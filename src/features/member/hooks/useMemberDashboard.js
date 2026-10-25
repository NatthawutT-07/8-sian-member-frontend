import { useState, useRef, useEffect } from 'react';
import { request } from '../../../lib/api.js';

export default function useMemberDashboard({ member, onSignedOut }) {
  const [coupons, setCoupons] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(''),
    [selected, setSelected] = useState(null),
    [busy, setBusy] = useState(false),
    [receipt, setReceipt] = useState(null),
    [now, setNow] = useState(Date.now());
  const offset = useRef(0),
    cancelButton = useRef(null),
    receiptHeading = useRef(null),
    claimLock = useRef(false),
    barcodeLock = useRef(false);
  const [barcode, setBarcode] = useState(null),
    [barcodeError, setBarcodeError] = useState('');
  const [campaigns, setCampaigns] = useState([]),
    [claiming, setClaiming] = useState(null),
    [notice, setNotice] = useState('');
  const [activeTab, setActiveTab] = useState('wallet');
  const walletTab = useRef(null),
    campaignTab = useRef(null);
  function handleTabKey(e) {
    if (busy || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const next =
      e.key === 'Home'
        ? 'wallet'
        : e.key === 'End'
          ? 'campaigns'
          : activeTab === 'wallet'
            ? 'campaigns'
            : 'wallet';
    setActiveTab(next);
    (next === 'wallet' ? walletTab : campaignTab).current?.focus();
  }
  async function load() {
    setLoading(true);
    setError('');
    try {
      const [result, offers] = await Promise.all([
        request('/api/coupons'),
        request('/api/campaigns'),
      ]);
      offset.current = new Date(result.serverTime).getTime() - Date.now();
      setNow(Date.now() + offset.current);
      setCoupons(result.coupons);
      setCampaigns(offers.campaigns.filter((c) => !c.received));
    } catch (e) {
      if (e.status === 401) {
        onSignedOut();
        return;
      }
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  async function claim(campaign) {
    if (claimLock.current || busy) return;
    claimLock.current = true;
    setBusy(true);
    setClaiming(campaign.id);
    setError('');
    setNotice('');
    try {
      const result = await request(`/api/campaigns/${campaign.id}/claim`, {
        method: 'POST',
        body: '{}',
      });
      setCampaigns((old) => old.filter((c) => c.id !== campaign.id));
      await load();
      setNotice(result.message);
      setActiveTab('wallet');
      walletTab.current?.focus();
    } catch (e) {
      if (e.status === 401) {
        onSignedOut();
        return;
      }
      if (e.status === 409 || e.status === 404) await load();
      setError(e.message);
    } finally {
      claimLock.current = false;
      setBusy(false);
      setClaiming(null);
    }
  }
  useEffect(() => {
    window.scrollTo(0, 0);
    load();
    const timer = setInterval(() => setNow(Date.now() + offset.current), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (selected && !busy) cancelButton.current?.focus();
  }, [selected, busy]);
  useEffect(() => {
    if (!selected || !barcode) return;
    let cancelled = false,
      timer;
    async function poll() {
      try {
        const result = await request(`/api/coupons/${selected.id}/status`);
        if (cancelled) return;
        offset.current = new Date(result.serverTime).getTime() - Date.now();
        setNow(Date.now() + offset.current);
        if (result.status === 'USED') {
          setCoupons((old) => old.filter((c) => c.id !== selected.id));
          setReceipt({
            couponId: selected.id,
            title: selected.title,
            description: selected.description,
            extraPrice: selected.extraPrice,
            usedAt: result.usedAt,
            memberNumber: member.memberNumber,
          });
          setSelected(null);
          setBarcode(null);
          return;
        }
        if (result.status === 'EXPIRED') {
          setCoupons((old) => old.filter((c) => c.id !== selected.id));
          setSelected(null);
          setBarcode(null);
          setError('คูปองหมดอายุแล้ว');
          return;
        }
        if (result.barcodeExpiresAt !== barcode.expiresAt) {
          setBarcode(null);
          setBarcodeError('บาร์โค้ดถูกเปลี่ยนจากอีกหน้าต่าง กรุณาเปิดรหัสใหม่');
          return;
        }
        setBarcodeError('');
      } catch (e) {
        if (cancelled) return;
        if (e.status === 401) {
          onSignedOut();
          return;
        }
        setBarcodeError('ยังตรวจสอบสถานะไม่ได้ กรุณาตรวจอินเทอร์เน็ต');
      }
      if (!cancelled) timer = setTimeout(poll, 5000);
    }
    timer = setTimeout(poll, 5000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [selected, barcode]);
  useEffect(() => {
    if (receipt) receiptHeading.current?.focus();
  }, [receipt]);
  const available = coupons.filter((c) => new Date(c.expiresAt).getTime() > now);
  async function showBarcode(coupon) {
    if (barcodeLock.current || busy) return;
    barcodeLock.current = true;
    setBusy(true);
    setError('');
    setBarcodeError('');
    setBarcode(null);
    setSelected(coupon);
    try {
      const result = await request(`/api/coupons/${coupon.id}/barcode`, {
        method: 'POST',
        body: '{}',
      });
      offset.current = new Date(result.serverTime).getTime() - Date.now();
      setNow(Date.now() + offset.current);
      setBarcode(result.barcode);
    } catch (e) {
      if (e.status === 401) {
        onSignedOut();
        return;
      }
      setBarcodeError(e.message);
      if (e.status === 409) {
        setCoupons((old) => old.filter((c) => c.id !== coupon.id));
      }
    } finally {
      barcodeLock.current = false;
      setBusy(false);
    }
  }
  function closeBarcode() {
    if (busy) return;
    setSelected(null);
    setBarcode(null);
    setBarcodeError('');
  }
  async function logout() {
    setBusy(true);
    setError('');
    try {
      await request('/api/auth/logout', { method: 'POST', body: '{}' });
      onSignedOut('logout');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return {
    activeTab,
    available,
    barcode,
    barcodeError,
    busy,
    campaignTab,
    campaigns,
    cancelButton,
    claim,
    claiming,
    closeBarcode,
    error,
    handleTabKey,
    load,
    loading,
    logout,
    notice,
    now,
    receipt,
    receiptHeading,
    selected,
    setActiveTab,
    setReceipt,
    showBarcode,
    walletTab,
  };
}
