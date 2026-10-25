import useAdminConsole from './hooks/useAdminConsole.js';
import AdminAuditPanel from './components/AdminAuditPanel.jsx';
import AdminCampaigns from './components/AdminCampaigns.jsx';
import AdminMemberDetail from './components/AdminMemberDetail.jsx';
import AdminMemberList from './components/AdminMemberList.jsx';
import AdminSummary from './components/AdminSummary.jsx';
import AdminLogin from './components/AdminLogin.jsx';
import { LogOut, Users, Ticket, History, LoaderCircle, Check } from 'lucide-react';
import BrandLogo from '../../components/BrandLogo.jsx';
import './admin.css';
export default function AdminPage() {
  const {
    admin,
    api,
    audit,
    busy,
    campaignForm,
    campaigns,
    changeTab,
    createCampaign,
    detail,
    error,
    grant,
    grantConfirm,
    initializing,
    issue,
    loadCommon,
    loadMembers,
    login,
    members,
    notice,
    overview,
    query,
    reset,
    resetOpen,
    resetPassword,
    run,
    setAudit,
    setCampaignForm,
    setDetail,
    setGrant,
    setGrantConfirm,
    setLogin,
    setQuery,
    setReset,
    setResetOpen,
    setSearch,
    showMember,
    signIn,
    signOut,
    tab,
  } = useAdminConsole();
  const alerts = (
    <>
      {error && (
        <p role="alert" className="admin-error">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="admin-notice">
          <Check size={16} />
          {notice}
        </p>
      )}
    </>
  );
  if (initializing)
    return (
      <div className="admin-loading">
        <LoaderCircle size={28} className="spin" /> กำลังตรวจสอบสิทธิ์แอดมิน…
      </div>
    );
  if (!admin)
    return (
      <AdminLogin alerts={alerts} busy={busy} login={login} setLogin={setLogin} signIn={signIn} />
    );
  return (
    <div className="admin-app">
      <header className="admin-header">
        <a className="brand" href="/">
          <BrandLogo />
          <span>
            8 เซียน<span className="brand-sub">จัดการระบบสมาชิก</span>
          </span>
        </a>
        <div>
          <span className="admin-role">ADMIN · {admin.username}</span>
          <button className="admin-secondary" onClick={signOut} disabled={busy}>
            <LogOut size={15} /> ออกจากระบบ
          </button>
        </div>
      </header>
      <main className="admin-main">
        <div className="admin-page-title">
          <div>
            <div className="eyebrow">8 SIAN • OWNER CONSOLE</div>
            <h1>หลังบ้านของร้าน</h1>
            <p>ข้อมูลสมาชิก คูปอง และประวัติการทำรายการ</p>
          </div>
          {busy && (
            <span className="admin-working" role="status">
              <LoaderCircle className="spin" size={16} /> กำลังดำเนินการ…
            </span>
          )}
        </div>
        <AdminSummary overview={overview} />
        <nav className="admin-tabs">
          {[
            ['members', 'สมาชิก', Users],
            ['campaigns', 'แคมเปญคูปอง', Ticket],
            ['audit', 'ประวัติระบบ', History],
          ].map(([key, label, Icon]) => (
            <button
              key={key}
              className={tab === key ? 'active' : ''}
              onClick={() => changeTab(key)}
              disabled={busy}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>
        {alerts}
        {tab === 'members' && !detail && (
          <AdminMemberList
            busy={busy}
            loadMembers={loadMembers}
            members={members}
            query={query}
            run={run}
            setQuery={setQuery}
            setSearch={setSearch}
            showMember={showMember}
          />
        )}
        {tab === 'members' && detail && (
          <AdminMemberDetail
            busy={busy}
            campaigns={campaigns}
            detail={detail}
            grant={grant}
            grantConfirm={grantConfirm}
            issue={issue}
            reset={reset}
            resetOpen={resetOpen}
            resetPassword={resetPassword}
            setDetail={setDetail}
            setGrant={setGrant}
            setGrantConfirm={setGrantConfirm}
            setReset={setReset}
            setResetOpen={setResetOpen}
          />
        )}
        {tab === 'campaigns' && (
          <AdminCampaigns
            api={api}
            busy={busy}
            campaignForm={campaignForm}
            campaigns={campaigns}
            createCampaign={createCampaign}
            loadCommon={loadCommon}
            run={run}
            setCampaignForm={setCampaignForm}
          />
        )}
        {tab === 'audit' && (
          <AdminAuditPanel api={api} audit={audit} busy={busy} run={run} setAudit={setAudit} />
        )}
      </main>
    </div>
  );
}
