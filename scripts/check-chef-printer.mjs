import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sendSerial } from '../src/features/chef/printer.js';

test('serial output preserves bytes across bounded writes and releases the writer', async () => {
  const data = Uint8Array.from({ length: 1300 }, (_, index) => index % 256);
  const received = [];
  let released = false;
  await sendSerial({ writable: { getWriter: () => ({
    async write(chunk) { assert.ok(chunk.length <= 512); received.push(...chunk); },
    releaseLock() { released = true; },
  }) } }, data);
  assert.deepEqual(received, [...data]);
  assert.equal(released, true);
});

test('failed writes release the port lock and never retry a partial print', async () => {
  let writes = 0;
  let released = false;
  await assert.rejects(sendSerial({ writable: { getWriter: () => ({
    async write() { writes++; throw new Error('disconnected'); },
    releaseLock() { released = true; },
  }) } }, new Uint8Array(1300)), /disconnected/);
  assert.equal(writes, 1);
  assert.equal(released, true);
  await assert.rejects(sendSerial(null, new Uint8Array()), /ไม่ได้เชื่อมต่อ/);
});
