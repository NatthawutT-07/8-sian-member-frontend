import useAdminConsole from './hooks/useAdminConsole.js';
import AdminAuditPanel from './components/AdminAuditPanel.jsx';
import AdminCampaigns from './components/AdminCampaigns.jsx';
import AdminMemberDetail from './components/AdminMemberDetail.jsx';
import AdminMemberList from './components/AdminMemberList.jsx';
import AdminSummary from './components/AdminSummary.jsx';
import AdminLogin from './components/AdminLogin.jsx';
import AdminLoyalty from './components/AdminLoyalty.jsx';
import AdminPos from './components/AdminPos.jsx';
import AdminBusinessReports from './components/AdminBusinessReports.jsx';
import AdminOrdering from './components/AdminOrdering.jsx';
import AdminRecordDialog, {
  memberFields,
  reasonField,
  deleteAction,
} from './components/AdminRecordDialog.jsx';
import { useState } from 'react';
import { LogOut, Users, Ticket, History, LoaderCircle, Check, QrCode } from 'lucide-react';
import BrandLogo from '../../components/BrandLogo.jsx';
import './admin.css';
export default function AdminPage() {
  const [recordAction, setRecordAction] = useState(null);
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
            8 เซียน<span className="brand-sub">จัดการหลังบ้านร้าน</span>
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
            <p>จัดการสมาชิก คูปอง พนักงาน สินค้า ยอดขาย และกะของร้าน</p>
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
            ['loyalty', 'สะสมครั้ง', QrCode],
            ['pos', 'พนักงานและสินค้า POS', Users],
            ['ordering', 'โต๊ะและเมนูสั่งอาหาร', QrCode],
            ['business', 'ยอดขายและกะ', History],
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
          <div className="admin-toolbar">
            <button
              className="admin-primary"
              disabled={busy}
              onClick={() =>
                setRecordAction({
                  title: 'เพิ่มสมาชิก',
                  description:
                    'กรอกเฉพาะข้อมูลที่มี เช่น เบอร์โทรศัพท์ ชื่อและข้อมูลอื่นเว้นว่างได้ หากไม่ตั้งรหัสผ่าน สมาชิกจะยังเข้าสู่ระบบด้วยเบอร์และรหัสผ่านไม่ได้',
                  endpoint: '/members',
                  method: 'POST',
                  fields: [
                    ...memberFields,
                    {
                      name: 'password',
                      label: 'รหัสผ่านเริ่มต้น',
                      type: 'password',
                      minLength: 6,
                      maxLength: 128,
                      required: false,
                    },
                    {
                      name: 'privacyConsent',
                      label: 'สมาชิกยอมรับนโยบายความเป็นส่วนตัวแล้ว',
                      type: 'checkbox',
                      required: false,
                    },
                    {
                      name: 'marketingConsent',
                      label: 'สมาชิกยินยอมรับข่าวสาร',
                      type: 'checkbox',
                      required: false,
                    },
                  ],
                })
              }
            >
              เพิ่มสมาชิก
            </button>
          </div>
        )}
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
            api={api}
            run={run}
            reload={() => api(`/members/${detail.member.id}`).then(setDetail)}
            editMember={() =>
              setRecordAction({
                title: 'แก้ไขข้อมูลสมาชิก',
                endpoint: `/members/${detail.member.id}`,
                method: 'PUT',
                fields: [
                  ...memberFields.map((field) => ({
                    ...field,
                    value:
                      field.name === 'birthDate'
                        ? detail.member.birthDate?.slice(0, 10)
                        : detail.member[field.name],
                  })),
                  { ...reasonField, required: false },
                ],
                transform: (values) => ({
                  ...values,
                  phone: values.phone || null,
                  birthDate: values.birthDate || null,
                }),
              })
            }
            deleteMember={() =>
              setRecordAction(
                deleteAction(
                  `/members/${detail.member.id}`,
                  `${detail.member.firstName} ${detail.member.lastName}`,
                ),
              )
            }
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
        {tab === 'loyalty' && <AdminLoyalty api={api} />}
        {tab === 'pos' && <AdminPos api={api} />}
        {tab === 'ordering' && <AdminOrdering api={api} />}
        {tab === 'business' && <AdminBusinessReports api={api} />}
        {recordAction && (
          <AdminRecordDialog
            action={recordAction}
            api={api}
            onClose={() => setRecordAction(null)}
            onSaved={() =>
              run(async () => {
                if (recordAction.method === 'DELETE') setDetail(null);
                else if (detail) setDetail(await api(`/members/${detail.member.id}`));
                await loadMembers();
                await loadCommon();
              })
            }
          />
        )}
      </main>
    </div>
  );
}
