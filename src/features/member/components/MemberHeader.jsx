import BrandLogo from '../../../components/BrandLogo.jsx';
import { LogOut } from 'lucide-react';

export default function MemberHeader({ busy, logout }) {
  return (
    <header className="member-header">
      <a className="brand" href="#member">
        <BrandLogo />
        <span>
          8 เซียน<span className="brand-sub">ราชาหมูกระทะ</span>
        </span>
      </a>
      <span className="member-header-label">MEMBER CLUB</span>
      <button className="member-logout" onClick={logout} disabled={busy}>
        <LogOut size={16} />
        <span>ออกจากระบบ</span>
      </button>
    </header>
  );
}
