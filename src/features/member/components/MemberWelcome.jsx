import { UtensilsCrossed } from 'lucide-react';

export default function MemberWelcome({ member }) {
  return (
    <section className="member-welcome">
      <div>
        <div className="eyebrow">A GOOD MEAL STARTS HERE</div>
      </div>
      <div className="home-member-card">
        <div>
          <span>8 เซียน</span>
          <UtensilsCrossed size={28} strokeWidth={1.2} />
        </div>
        <small>MEMBER</small>
        <h2>
          {member.firstName} {member.lastName}
        </h2>
        <strong>{member.memberNumber}</strong>
        <div className="card-smallprint">8 SIAN • GOOD FOOD, GREAT COMPANY</div>
      </div>
    </section>
  );
}
