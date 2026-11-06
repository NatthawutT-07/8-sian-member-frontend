export function getOrderLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('อุปกรณ์นี้ไม่รองรับตำแหน่ง กรุณาเปิดเว็บผ่าน HTTPS บนมือถือ'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords, timestamp }) => resolve({
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        timestamp,
      }),
      (error) => reject(new Error(error.code === 1
        ? 'กรุณาอนุญาตให้เว็บไซต์เข้าถึงตำแหน่ง และเปิดตำแหน่งที่แม่นยำก่อนส่งรายการ'
        : 'อ่านตำแหน่งไม่ได้ กรุณาเปิด GPS แล้วลองส่งรายการอีกครั้ง')),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
    );
  });
}
