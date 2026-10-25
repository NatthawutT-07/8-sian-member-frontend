import { Ticket, Gift, RefreshCw } from 'lucide-react';

export default function CouponTabs({
  activeTab,
  available,
  busy,
  campaignTab,
  handleTabKey,
  load,
  loading,
  setActiveTab,
  walletTab,
}) {
  return (
    <div className="member-tabbar">
      <div
        className="member-coupon-tabs"
        role="tablist"
        aria-label="เมนูคูปอง"
        onKeyDown={handleTabKey}
      >
        <button
          ref={walletTab}
          id="wallet-tab"
          type="button"
          role="tab"
          aria-selected={activeTab === 'wallet'}
          aria-controls="wallet-panel"
          tabIndex={activeTab === 'wallet' ? 0 : -1}
          className={activeTab === 'wallet' ? 'active' : ''}
          onClick={() => setActiveTab('wallet')}
          disabled={busy}
        >
          <Ticket size={19} />
          <span>คูปองของฉัน</span>
          <b>{loading ? '—' : available.length}</b>
        </button>
        <button
          ref={campaignTab}
          id="campaigns-tab"
          type="button"
          role="tab"
          aria-selected={activeTab === 'campaigns'}
          aria-controls="campaigns-panel"
          tabIndex={activeTab === 'campaigns' ? 0 : -1}
          className={activeTab === 'campaigns' ? 'active' : ''}
          onClick={() => setActiveTab('campaigns')}
          disabled={busy}
        >
          <Gift size={19} />
          <span>รับคูปองแคมเปญ</span>
        </button>
      </div>
      <button
        className="refresh-coupons member-tabs-refresh"
        onClick={load}
        disabled={loading || busy}
        aria-label="อัปเดตคูปองและแคมเปญ"
        title="อัปเดตคูปองและแคมเปญ"
      >
        <RefreshCw size={16} className={loading ? 'spin' : ''} />
      </button>
    </div>
  );
}
