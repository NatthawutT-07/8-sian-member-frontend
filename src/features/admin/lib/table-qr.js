import QRCode from 'qrcode';

const logos = new Map();
function loadLogo(source) {
  if (!logos.has(source)) {
    const image = new Image();
    image.src = source;
    logos.set(source, image.decode().then(() => image).catch(() => null));
  }
  return logos.get(source);
}

export async function createTableQr(value, { logoSource = '/images/logo.png' } = {}) {
  const canvas = document.createElement('canvas');
  await QRCode.toCanvas(canvas, value, { width: 600, margin: 4, errorCorrectionLevel: 'H' });
  const logo = await loadLogo(logoSource);
  if (logo) {
    const context = canvas.getContext('2d');
    const size = Math.round(canvas.width * 0.14);
    const padding = Math.round(canvas.width * 0.015);
    const left = Math.round((canvas.width - size) / 2);
    context.fillStyle = '#fff';
    context.fillRect(left - padding, left - padding, size + 2 * padding, size + 2 * padding);
    const scale = size / Math.max(logo.naturalWidth, logo.naturalHeight);
    const width = logo.naturalWidth * scale, height = logo.naturalHeight * scale;
    context.drawImage(logo, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
  }
  return canvas.toDataURL('image/png');
}
