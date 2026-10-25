export default function CouponHowTo({ activeTab }) {
  return (
    <section hidden={activeTab !== 'wallet'} className="coupon-howto">
      <div>
        <div className="eyebrow">MAKE IT A GOOD MEAL</div>
        <h2>ใช้คูปองง่าย ๆ ที่ร้าน</h2>
      </div>
      <ol>
        <li>
          <b>01</b>
          <span>เลือกคูปองที่ต้องการ</span>
        </li>
        <li>
          <b>02</b>
          <span>
            เปิดบาร์โค้ดให้พนักงาน
            <br />
            สแกนผ่าน POS
          </span>
        </li>
        <li>
          <b>03</b>
          <span>
            ชำระบิลที่ POS
            <br />
            เมื่อสำเร็จคูปองจึงเปลี่ยนเป็นใช้แล้ว
          </span>
        </li>
      </ol>
    </section>
  );
}
