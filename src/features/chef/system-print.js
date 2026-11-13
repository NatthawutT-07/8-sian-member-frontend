// Keep a dedicated print document alive when Chrome hands off to Windows.
// Hiding/unmounting the source dialog must not erase the spooled document.
export async function printSystemTicket(source) {
  if (!source) throw new Error('ไม่พบใบอาหารสำหรับพิมพ์');
  document.getElementById('chef-print-frame')?.remove();
  const frame = document.createElement('iframe');
  frame.id = 'chef-print-frame';
  frame.title = 'ใบอาหารสำหรับเครื่องพิมพ์';
  frame.style.cssText = 'position:fixed;left:-10000px;top:0;width:800px;height:600px;border:0';
  document.body.append(frame);
  const target = frame.contentDocument;
  target.open();
  target.write('<!doctype html><html lang="th"><head><meta charset="utf-8"><title>8 เซียน · ใบอาหาร</title></head><body></body></html>');
  target.close();
  const style = target.createElement('style');
  style.textContent = '@page{margin:3mm}*{box-sizing:border-box}body{margin:0;color:#000;background:#fff;font:14px sans-serif}h2{font-size:18px}ul{list-style:none;padding:0}li{display:flex;gap:8px;border-bottom:1px solid #aaa;padding:8px 0;break-inside:avoid}li span{flex:1}p,li{overflow-wrap:anywhere}';
  target.head.append(style);
  const copy = source.cloneNode(true);
  copy.removeAttribute('class');
  target.body.append(copy);
  await target.fonts.ready;
  await new Promise((resolve) => frame.contentWindow.requestAnimationFrame(resolve));
  frame.contentWindow.focus();
  frame.contentWindow.print();
}
