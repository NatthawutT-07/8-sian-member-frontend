import BrandLogo from '../../../components/BrandLogo.jsx';
import { ShieldCheck, LoaderCircle } from 'lucide-react';

export default function AdminLogin({ alerts, busy, login, setLogin, signIn }) {
  return (
    <div className="admin-login-page">
      <a className="brand" href="/">
        <BrandLogo />
        <span>
          8 เซียน<span className="brand-sub">ราชาหมูกระทะ</span>
        </span>
      </a>
      <section className="admin-login-card">
        <div className="admin-lock">
          <ShieldCheck size={27} />
        </div>
        <div className="eyebrow">OWNER ACCESS</div>
        <h1>เข้าสู่ระบบแอดมิน</h1>
        <p>สำหรับเจ้าของร้าน 1 บัญชีเท่านั้น</p>
        {alerts}
        <form onSubmit={signIn}>
          <fieldset disabled={busy}>
            <label>
              ชื่อผู้ใช้
              <input
                autoComplete="username"
                required
                maxLength={80}
                value={login.username}
                onChange={(e) => setLogin({ ...login, username: e.target.value })}
              />
            </label>
            <label>
              รหัสผ่าน
              <input
                type="password"
                autoComplete="current-password"
                required
                maxLength={128}
                value={login.password}
                onChange={(e) => setLogin({ ...login, password: e.target.value })}
              />
            </label>
            <button className="button submit" disabled={busy}>
              {busy ? (
                <>
                  <LoaderCircle size={17} className="spin" /> กำลังเข้าสู่ระบบ…
                </>
              ) : (
                <>
                  เข้าสู่ระบบหลังบ้าน <ShieldCheck size={17} />
                </>
              )}
            </button>
          </fieldset>
        </form>
        <a className="admin-back" href="/">
          กลับหน้าสมาชิก
        </a>
      </section>
    </div>
  );
}
