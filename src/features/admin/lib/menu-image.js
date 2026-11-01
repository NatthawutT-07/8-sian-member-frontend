export async function prepareMenuImage(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
    throw new Error('กรุณาเลือกรูป JPG, PNG หรือ WebP');
  if (file.size > 15 * 1024 * 1024) throw new Error('กรุณาเลือกรูปต้นฉบับไม่เกิน 15 MB');
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    try {
      await image.decode();
    } catch {
      throw new Error('เปิดรูปนี้ไม่ได้ กรุณาเลือกไฟล์รูปใหม่');
    }
    const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
    if (!blob || blob.size > 2 * 1024 * 1024)
      throw new Error('รูปยังใหญ่เกินไป กรุณาเลือกรูปขนาดเล็กลง');
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}
