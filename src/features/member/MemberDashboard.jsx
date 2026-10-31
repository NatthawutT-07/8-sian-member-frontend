import { useState } from 'react';
import { request } from '../../lib/api.js';
import SiteFooter from '../../components/SiteFooter.jsx';
import PublicPromotions from '../promotions/PublicPromotions.jsx';
import MemberWelcome from './components/MemberWelcome.jsx';
import MemberHeader from './components/MemberHeader.jsx';
import './dashboard.css';

export default function MemberDashboard({ member, onSignedOut }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function logout() {
    setBusy(true);
    setError('');
    try {
      await request('/api/auth/logout', { method: 'POST', body: '{}' });
      onSignedOut('logout');
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="member-home">
      <MemberHeader busy={busy} logout={logout} />
      <main className="member-main">
        <MemberWelcome member={member} />
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <PublicPromotions isMember />
      </main>
      <SiteFooter className="member-footer" />
    </div>
  );
}
