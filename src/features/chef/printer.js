// ESC/POS raster output keeps Thai glyphs independent of printer code pages.
export async function ticketBytes(ticket, width, cut) {
  await document.fonts.ready;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (![384, 576].includes(width)) throw new Error('ขนาดกระดาษไม่ถูกต้อง');
  const label = `โต๊ะ ${ticket.tableNumber}`;
  let fontSize = 64;
  context.font = `800 ${fontSize}px Tahoma, sans-serif`;
  while (fontSize > 24 && context.measureText(label).width > width - 32) {
    fontSize--;
    context.font = `800 ${fontSize}px Tahoma, sans-serif`;
  }
  canvas.width = width;
  canvas.height = Math.ceil(fontSize * 1.4) + 16;
  context.fillStyle = 'white'; context.fillRect(0, 0, width, canvas.height);
  context.fillStyle = 'black'; context.font = `800 ${fontSize}px Tahoma, sans-serif`;
  context.textBaseline = 'top'; context.textAlign = 'center';
  context.fillText(label, width / 2, 8);
  const { data } = context.getImageData(0, 0, width, canvas.height);
  const bytes = [27, 64];
  const stride = width / 8;
  for (let top = 0; top < canvas.height; top += 128) {
    const height = Math.min(128, canvas.height - top);
    const pixels = new Uint8Array(stride * height);
    for (let y = top; y < top + height; y++) {
      for (let x = 0; x < width; x += 8) {
        let value = 0;
        for (let bit = 0; bit < 8; bit++) {
          const offset = (y * width + x + bit) * 4;
          const gray = (data[offset] * 299 + data[offset + 1] * 587 + data[offset + 2] * 114) / 1000;
          if (255 - ((255 - gray) * data[offset + 3]) / 255 < 200) value |= 128 >> bit;
        }
        pixels[(y - top) * stride + x / 8] = value;
      }
    }
    bytes.push(...compactRaster(pixels, stride, height));
  }
  bytes.push(27, 100, 1);
  if (cut) bytes.push(29, 86, 1);
  return Uint8Array.from(bytes);
}

// Same lossless band optimization as POS receipts: preserve every dot and row,
// omit only white right margins to reduce Bluetooth/serial transmission time.
export function compactRaster(pixels, stride, rows) {
  const widths = Array(rows).fill(0);
  for (let y = 0; y < rows; y++)
    for (let x = stride - 1; x >= 0; x--) if (pixels[y * stride + x]) { widths[y] = x + 1; break; }
  const cost = Array(rows + 1).fill(Infinity), split = [], segmentWidth = [];
  cost[0] = 0;
  for (let end = 1; end <= rows; end++) {
    let width = 1;
    for (let start = end - 1; start >= 0; start--) {
      width = Math.max(width, widths[start]);
      const candidate = cost[start] + 8 + width * (end - start);
      if (candidate <= cost[end]) { cost[end] = candidate; split[end] = start; segmentWidth[end] = width; }
    }
  }
  const segments = [];
  for (let end = rows; end > 0; end = split[end]) segments.push({ start: split[end], end, width: segmentWidth[end] });
  const output = [];
  for (const { start, end, width } of segments.reverse()) {
    output.push(29, 118, 48, 0, width, 0, end - start, 0);
    for (let y = start; y < end; y++) output.push(...pixels.subarray(y * stride, y * stride + width));
  }
  return output;
}

export async function sendSerial(port, bytes) {
  if (!port?.writable) throw new Error('เครื่องพิมพ์ไม่ได้เชื่อมต่อ กรุณาเชื่อมต่อใหม่');
  const writer = port.writable.getWriter();
  try {
    for (let offset = 0; offset < bytes.length; offset += 512) await writer.write(bytes.subarray(offset, offset + 512));
  } finally { writer.releaseLock(); }
}
