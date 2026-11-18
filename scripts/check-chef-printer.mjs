import test from 'node:test';
import assert from 'node:assert/strict';
import { compactRaster } from '../src/features/chef/printer.js';

test('compact raster preserves every dot and row at both paper widths', () => {
  for (const stride of [48, 72]) {
    const rows = 128;
    const original = new Uint8Array(stride * rows);
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < (y % 4 === 0 ? 0 : y % stride); x++) original[y * stride + x] = (y * 17 + x * 31) & 255;
    const encoded = compactRaster(original, stride, rows);
    const decoded = new Uint8Array(original.length);
    let offset = 0, top = 0;
    while (offset < encoded.length) {
      assert.deepEqual(encoded.slice(offset, offset + 4), [29, 118, 48, 0]);
      const width = encoded[offset + 4] + encoded[offset + 5] * 256;
      const height = encoded[offset + 6] + encoded[offset + 7] * 256;
      offset += 8;
      for (let y = 0; y < height; y++) {
        decoded.set(encoded.slice(offset, offset + width), (top + y) * stride);
        offset += width;
      }
      top += height;
    }
    assert.equal(top, rows);
    assert.deepEqual(decoded, original);
    assert.ok(encoded.length < original.length);
  }
});

test('serial ticket prints one table label and short feed for both paper widths', async () => {
  const { ticketBytes } = await import('../src/features/chef/printer.js');
  const original = global.document;
  const labels = [];
  let canvas;
  const context = {
    measureText: (text) => ({ width: text.length * 20 }),
    fillRect() {},
    fillText: (label) => labels.push(label),
    getImageData: () => ({ data: new Uint8ClampedArray(canvas.width * canvas.height * 4).fill(255) }),
  };
  global.document = { fonts: { ready: Promise.resolve() }, createElement: () => (canvas = { getContext: () => context }) };
  try {
    for (const width of [384, 576]) {
      const bytes = await ticketBytes({ tableNumber: 27, items: [{ name: 'DO NOT PRINT', quantity: 99 }] }, width, true);
      assert.equal(canvas.height, 106);
      assert.deepEqual([...bytes.slice(-6)], [27, 100, 1, 29, 86, 1]);
      assert.ok(bytes.length < 200, 'blank margins are compressed');
    }
    assert.deepEqual(labels, ['โต๊ะ 27', 'โต๊ะ 27']);
  } finally { global.document = original; }
});
