import { useState, useRef, useEffect } from 'react';
import { request } from '../../../lib/api.js';
const freshCampaign = {
  title: '',
  description: '',
  extraPrice: 79,
  validityDays: 30,
  prerequisiteCampaignId: null,
};
export default function useAdminConsole() {
  const [admin, setAdmin] = useState(null),
    [initializing, setInitializing] = useState(true),
    [tab, setTab] = useState('members'),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const [login, setLogin] = useState({ username: 'admin', password: '' }),
    [overview, setOverview] = useState(null),
    [campaigns, setCampaigns] = useState([]),
    [members, setMembers] = useState({ members: [], total: 0, page: 1, pages: 0 }),
    [query, setQuery] = useState(''),
    [search, setSearch] = useState(''),
    [detail, setDetail] = useState(null),
    [audit, setAudit] = useState({ audits: [], page: 1, pages: 0 }),
    [campaignForm, setCampaignForm] = useState(freshCampaign),
    [grant, setGrant] = useState(''),
    [grantConfirm, setGrantConfirm] = useState(false),
    [resetOpen, setResetOpen] = useState(false),
    [reset, setReset] = useState({ newPassword: '', confirm: '', adminPassword: '', reason: '' });
  const lock = useRef(false);
  async function api(path, options) {
    try {
      return await request(`/api/admin${path}`, options);
    } catch (e) {
      if (e.status === 401 && admin) {
        setAdmin(null);
        setDetail(null);
        setReset({ newPassword: '', confirm: '', adminPassword: '', reason: '' });
        setLogin((old) => ({ ...old, password: '' }));
      }
      throw e;
    }
  }
  useEffect(() => {
    request('/api/admin/me')
      .then((r) => setAdmin(r.admin))
      .catch((e) => {
        if (e.status !== 401) setError(e.message);
      })
      .finally(() => setInitializing(false));
  }, []);
  async function loadMembers(page = 1, q = search) {
    const result = await api(`/members?q=${encodeURIComponent(q)}&page=${page}`);
    setMembers(result);
  }
  async function loadCommon() {
    const [stats, offers] = await Promise.all([api('/overview'), api('/campaigns')]);
    setOverview(stats);
    setCampaigns(offers.campaigns);
  }
  async function run(work) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await work();
    } catch (e) {
      setError(e.message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  useEffect(() => {
    if (admin)
      run(async () => {
        await loadCommon();
        await loadMembers(1, '');
      });
  }, [admin]);
  async function signIn(e) {
    e.preventDefault();
    await run(async () => {
      const [result] = await Promise.allSettled([
        request('/api/admin/login', { method: 'POST', body: JSON.stringify(login) }),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);
      if (result.status === 'rejected') throw result.reason;
      setLogin((old) => ({ ...old, password: '' }));
      setAdmin(result.value.admin);
    });
  }
  async function signOut() {
    await run(async () => {
      await api('/logout', { method: 'POST', body: '{}' });
      setAdmin(null);
      setDetail(null);
      setReset({ newPassword: '', confirm: '', adminPassword: '', reason: '' });
    });
  }
  async function showMember(id) {
    await run(async () => {
      setDetail(await api(`/members/${id}`));
      setGrant('');
      setGrantConfirm(false);
      setResetOpen(false);
      setReset({ newPassword: '', confirm: '', adminPassword: '', reason: '' });
    });
  }
  async function changeTab(next) {
    setDetail(null);
    setTab(next);
    await run(async () => {
      if (next === 'audit') setAudit(await api('/audits'));
      else if (next === 'campaigns') await loadCommon();
      else if (next === 'members') await loadMembers();
    });
  }
  async function issue(e) {
    e.preventDefault();
    if (!grantConfirm) {
      setGrantConfirm(true);
      return;
    }
    await run(async () => {
      await api(`/members/${detail.member.id}/coupons`, {
        method: 'POST',
        body: JSON.stringify({ campaignId: grant }),
      });
      setDetail(await api(`/members/${detail.member.id}`));
      await loadCommon();
      setGrant('');
      setGrantConfirm(false);
      setNotice('แจกคูปองให้สมาชิกเรียบร้อยแล้ว');
    });
  }
  async function resetPassword(e) {
    e.preventDefault();
    if (reset.newPassword !== reset.confirm) {
      setError('รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน');
      return;
    }
    await run(async () => {
      const { confirm, ...body } = reset;
      await api(`/members/${detail.member.id}/password`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setReset({ newPassword: '', confirm: '', adminPassword: '', reason: '' });
      setResetOpen(false);
      setDetail(await api(`/members/${detail.member.id}`));
      setNotice('ตั้งรหัสผ่านใหม่แล้ว สมาชิกต้องเข้าสู่ระบบอีกครั้ง');
    });
  }
  async function createCampaign(e) {
    e.preventDefault();
    await run(async () => {
      await api('/campaigns', { method: 'POST', body: JSON.stringify(campaignForm) });
      setCampaignForm(freshCampaign);
      await loadCommon();
      setNotice('สร้างแคมเปญแล้ว เลือกสมาชิกเพื่อแจกคูปองได้เลย');
    });
  }
  return {
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
  };
}
