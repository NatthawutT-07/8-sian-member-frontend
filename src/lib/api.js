const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const lineLoginUrl = `${API}/api/auth/line`;
export async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API}${path}`, {
      ...options,
      credentials: 'include',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new Error('เชื่อมต่อระบบไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่');
  }
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || 'ไม่สามารถทำรายการได้');
    error.status = response.status;
    if (response.status === 429) {
      const seconds = Number(response.headers.get('Retry-After'));
      error.retryAfter =
        Number.isFinite(seconds) && seconds > 0 ? Math.min(Math.ceil(seconds), 900) : 60;
    }
    throw error;
  }
  return data;
}
