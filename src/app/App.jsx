import { useEffect, useState } from 'react';
import LandingPage from '../pages/LandingPage.jsx';
import MemberDashboard from '../features/member/MemberDashboard.jsx';
import AdminPage from '../features/admin/AdminPage.jsx';
import { ADMIN_PATH } from '../config/routes.js';
import { request } from '../lib/api.js';

export default function App() {
  const [member, setMember] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  useEffect(() => {
    if (path !== '/coupons') return;
    let active = true;
    setError('');
    request('/api/members/me')
      .then(({ member }) => {
        if (active) setMember(member);
      })
      .catch((error) => {
        if (!active) return;
        if (error.status === 401) window.location.replace('/login?next=/coupons');
        else setError(error.message);
      });
    return () => {
      active = false;
    };
  }, [path, attempt]);
  if (window.location.pathname.replace(/\/$/, '') === ADMIN_PATH) return <AdminPage />;
  if (path === '/coupons' && member)
    return (
      <MemberDashboard
        member={member}
        onSignedOut={(reason) => {
          window.location.replace(reason === 'logout' ? '/' : '/login?next=/coupons');
        }}
      />
    );
  if (path === '/coupons')
    return (
      <main className="route-status" aria-live="polite">
        {error ? (
          <>
            <p role="alert" className="error">
              {error}
            </p>
            <button className="button dark" onClick={() => setAttempt((value) => value + 1)}>
              ลองอีกครั้ง
            </button>
          </>
        ) : (
          <p role="status">กำลังตรวจสอบการเข้าสู่ระบบ…</p>
        )}
        <a href="/">กลับหน้าหลัก</a>
      </main>
    );
  const authMode = path === '/login' ? 'login' : path === '/register' ? 'register' : null;
  return (
    <LandingPage authMode={authMode} onAuthenticated={() => window.location.replace('/coupons')} />
  );
}
