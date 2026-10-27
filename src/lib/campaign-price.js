export function campaignPriceText(amount) {
  if (amount < 0) return `ส่วนลด ${Math.abs(amount).toLocaleString('th-TH')} บาท`;
  if (amount > 0) return `เพิ่ม ${amount.toLocaleString('th-TH')} บาท`;
  return 'ไม่มีค่าเพิ่ม';
}

export function campaignPriceAmount(amount) {
  if (amount === 0) return 'ฟรี';
  return `${amount > 0 ? '+' : '-'}${Math.abs(amount).toLocaleString('th-TH')}`;
}
