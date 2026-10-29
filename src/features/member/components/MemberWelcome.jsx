import { UtensilsCrossed } from 'lucide-react';
import MemberLoyalty from './MemberLoyalty.jsx';

export default function MemberWelcome({ member }) {
  return (
    <section className="member-welcome member-welcome--compact">
    
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
        <MemberLoyalty member={member} />
        <span className="member-card-watermark" aria-hidden="true">
          8
        </span>
      </div>
    </section>
  );
}
