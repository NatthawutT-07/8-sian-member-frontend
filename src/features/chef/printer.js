// ESC/POS raster output keeps Thai glyphs independent of printer code pages.
export async function ticketBytes(ticket, width, cut) {
  await document.fonts.ready;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = '24px sans-serif';
  const lines = [`ใบอาหาร · โต๊ะ ${ticket.tableNumber}`, `#${ticket.id.slice(-8)}`, new Date(ticket.createdAt).toLocaleString('th-TH'), ''];
  for (const item of ticket.items) {
    let line = '';
    for (const character of `${item.name} × ${item.quantity}`) {
      if (context.measureText(line + character).width > width - 32) { lines.push(line); line = ''; }
      line += character;
    }
    lines.push(line);
  }
  canvas.width = width;
  canvas.height = lines.length * 38 + 32;
  if (canvas.height > 24000) throw new Error('ใบอาหารยาวเกินไป กรุณาพิมพ์ผ่านเบราว์เซอร์');
  context.fillStyle = 'white'; context.fillRect(0, 0, width, canvas.height);
  context.fillStyle = 'black'; context.font = '24px sans-serif'; context.textBaseline = 'top';
  lines.forEach((line, index) => context.fillText(line, 16, 16 + index * 38));
  const { data } = context.getImageData(0, 0, width, canvas.height);
  const bytes = [27, 64];
  const stride = width / 8;
  for (let top = 0; top < canvas.height; top += 128) {
    const height = Math.min(128, canvas.height - top);
    bytes.push(29, 118, 48, 0, stride, 0, height, 0);
    for (let y = top; y < top + height; y++) {
      for (let x = 0; x < width; x += 8) {
        let value = 0;
        for (let bit = 0; bit < 8; bit++) {
          const offset = (y * width + x + bit) * 4;
          if ((data[offset] + data[offset + 1] + data[offset + 2]) / 3 < 200) value |= 128 >> bit;
        }
        bytes.push(value);
      }
    }
  }
  bytes.push(27, 100, 4);
  if (cut) bytes.push(29, 86, 1);
  return Uint8Array.from(bytes);
}

export async function sendSerial(port, bytes) {
  if (!port?.writable) throw new Error('เครื่องพิมพ์ไม่ได้เชื่อมต่อ กรุณาเชื่อมต่อใหม่');
  const writer = port.writable.getWriter();
  try {
    for (let offset = 0; offset < bytes.length; offset += 512) await writer.write(bytes.subarray(offset, offset + 512));
  } finally { writer.releaseLock(); }
}
