import test from 'node:test';
import assert from 'node:assert/strict';
import { createMenuClient } from '../src/features/ordering/menu-client.js';

const room = {
  sessionId: 'session',
  menuVersion: 'v1',
  tableNumber: 1,
  menu: [{ id: 'food', name: 'หมู' }],
};
function storage() {
  const rows = new Map();
  return {
    getItem: (key) => rows.get(key) || null,
    setItem: (key, value) => rows.set(key, value),
    removeItem: (key) => rows.delete(key),
  };
}
test('coalesces concurrent requests, avoids focus reloads and checks status before replacing a menu', async () => {
  let time = 100000,
    version = 'v1';
  const calls = [];
  const client = createMenuClient(
    'token',
    async (path) => {
      calls.push(path);
      return path.endsWith('/status')
        ? { sessionId: 'session', menuVersion: version }
        : { ...room, menuVersion: version };
    },
    { storage: storage(), now: () => time },
  );
  await Promise.all(Array.from({ length: 100 }, () => client.load()));
  assert.equal(calls.length, 1);
  time += 10000;
  await client.load();
  assert.equal(calls.length, 1);
  time += 30000;
  await client.load();
  assert.equal(calls.length, 2);
  assert.ok(calls[1].endsWith('/status'));
  version = 'v2';
  time += 60000;
  assert.equal((await client.load()).menuVersion, 'v2');
  assert.equal(calls.length, 4);
});
test('reopening a page reuses its menu only after live session/version validation; closed tables discard it', async () => {
  const store = storage();
  let time = 100000;
  await createMenuClient('token', async () => room, { storage: store, now: () => time }).load();
  const calls = [];
  let closed = false;
  const client = createMenuClient(
    'token',
    async (path) => {
      calls.push(path);
      if (closed) throw Object.assign(Error('closed'), { status: 403 });
      return { sessionId: room.sessionId, menuVersion: room.menuVersion };
    },
    { storage: store, now: () => time },
  );
  assert.equal((await client.load()).menu[0].name, 'หมู');
  assert.ok(calls[0].endsWith('/status'));
  closed = true;
  time += 60000;
  await assert.rejects(client.load(), { status: 403 });
  assert.equal(store.getItem('table-menu:token'), null);
});
test('rate limits are respected even if refresh is clicked repeatedly', async () => {
  let time = 100000,
    calls = 0;
  const client = createMenuClient(
    'token',
    async () => {
      calls++;
      throw Object.assign(Error('wait'), { status: 429, retryAfter: 20 });
    },
    { storage: storage(), now: () => time },
  );
  await assert.rejects(client.load(), { status: 429 });
  await assert.rejects(client.load(true), { status: 429 });
  assert.equal(calls, 1);
  time += 21000;
  await assert.rejects(client.load(), { status: 429 });
  assert.equal(calls, 2);
});
