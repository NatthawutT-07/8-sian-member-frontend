const CHECK_GAP = 30000;
const CACHE_AGE = 10 * 60000;

export function createMenuClient(token, request, { now = Date.now, storage } = {}) {
  if (!storage) {
    try {
      storage = globalThis.sessionStorage;
    } catch {
      /* Private browser mode. */
    }
  }
  const key = `table-menu:${token}`;
  let cached = null,
    checkedAt = 0,
    pending = null,
    retryAt = 0,
    blocked = null;
  try {
    const saved = JSON.parse(storage?.getItem(key) || 'null');
    if (
      saved?.expiresAt > now() &&
      Array.isArray(saved.data?.menu) &&
      saved.data?.sessionId &&
      saved.data?.menuVersion
    )
      cached = saved.data;
  } catch {
    /* Ignore old or unavailable browser storage. */
  }
  function clear() {
    cached = null;
    try {
      storage?.removeItem(key);
    } catch {
      /* Storage is optional. */
    }
  }
  return {
    async load(force = false) {
      if (pending) return pending;
      if (now() < retryAt && blocked) throw blocked;
      if (!force && cached && checkedAt && now() - checkedAt < CHECK_GAP) return cached;
      pending = (async () => {
        try {
          let data;
          if (cached && !force) {
            const status = await request(`/api/ordering/${token}/status`);
            if (status.sessionId === cached.sessionId && status.menuVersion === cached.menuVersion)
              data = cached;
          }
          if (!data) data = await request(`/api/ordering/${token}`);
          checkedAt = now();
          cached = data;
          blocked = null;
          try {
            storage?.setItem(key, JSON.stringify({ expiresAt: now() + CACHE_AGE, data }));
          } catch {
            /* Quota does not prevent ordering. */
          }
          return data;
        } catch (error) {
          if ([403, 404].includes(error.status)) clear();
          if (error.status === 429) {
            retryAt = now() + (error.retryAfter || 60) * 1000;
            blocked = error;
          }
          throw error;
        }
      })();
      try {
        return await pending;
      } finally {
        pending = null;
      }
    },
  };
}
