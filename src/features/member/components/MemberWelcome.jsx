import { UtensilsCrossed } from 'lucide-react';

export default function MemberWelcome({ member }) {
  return (
    <section className="member-welcome member-welcome--compact">
      <div>
        <h1>คูปองของคุณ</h1>
        <p>เลือกรับโปรโมชั่น หรือเปิดคูปองเพื่อแสดงบาร์โค้ดที่ร้าน</p>
      </div>
      <div className="home-member-card">
        <div>
          <span>8 เซียน</span>
          <UtensilsCrossed size={28} strokeWidth={1.2} />
        </div>
        <small>บัตรสมาชิก</small>
        <h2>
          {member.firstName} {member.lastName}
        </h2>
        <strong>{member.memberNumber}</strong>
      </div>
    </section>
  );
}
