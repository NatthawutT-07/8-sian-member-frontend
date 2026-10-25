import { useState } from 'react';
import LandingPage from '../pages/LandingPage.jsx';
import MemberDashboard from '../features/member/MemberDashboard.jsx';
import AdminPage from '../features/admin/AdminPage.jsx';
import { ADMIN_PATH } from '../config/routes.js';

export default function App() {
  const [member, setMember] = useState(null);
  if (window.location.pathname.replace(/\/$/, '') === ADMIN_PATH) return <AdminPage />;
  if (member)
    return (
      <MemberDashboard
        member={member}
        onSignedOut={() => {
          setMember(null);
          window.location.hash = 'register';
        }}
      />
    );
  return <LandingPage onAuthenticated={setMember} />;
}
