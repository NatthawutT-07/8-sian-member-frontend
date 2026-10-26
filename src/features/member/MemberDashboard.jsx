import useMemberDashboard from './hooks/useMemberDashboard.js';
import SiteFooter from '../../components/SiteFooter.jsx';
import CouponReceiptDialog from './components/CouponReceiptDialog.jsx';
import CouponBarcodeDialog from './components/CouponBarcodeDialog.jsx';
import CouponHowTo from './components/CouponHowTo.jsx';
import CouponWallet from './components/CouponWallet.jsx';
import CampaignPanel from './components/CampaignPanel.jsx';
import CouponTabs from './components/CouponTabs.jsx';
import MemberWelcome from './components/MemberWelcome.jsx';
import MemberHeader from './components/MemberHeader.jsx';
import { Check } from 'lucide-react';
import './dashboard.css';
export default function MemberDashboard({ member, onSignedOut }) {
  const {
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
  } = useMemberDashboard({
    member,
    onSignedOut,
  });
  return (
    <div className="member-home">
      <MemberHeader busy={busy} logout={logout} />
      <main className="member-main">
        <MemberWelcome member={member} />
        <CouponTabs
          activeTab={activeTab}
          available={available}
          busy={busy}
          campaignTab={campaignTab}
          handleTabKey={handleTabKey}
          load={load}
          loading={loading}
          setActiveTab={setActiveTab}
          walletTab={walletTab}
        />
        {notice && (
          <p className="campaign-notice" role="status">
            <Check size={16} />
            {notice}
          </p>
        )}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <CampaignPanel
          activeTab={activeTab}
          busy={busy}
          campaigns={campaigns}
          claim={claim}
          claiming={claiming}
          loading={loading}
        />
        <CouponWallet
          activeTab={activeTab}
          available={available}
          busy={busy}
          loading={loading}
          now={now}
          showBarcode={showBarcode}
        />
        <CouponHowTo activeTab={activeTab} />
      </main>
      <SiteFooter className="member-footer" />
      {selected && (
        <CouponBarcodeDialog
          barcode={barcode}
          barcodeError={barcodeError}
          busy={busy}
          cancelButton={cancelButton}
          closeBarcode={closeBarcode}
          now={now}
          selected={selected}
          showBarcode={showBarcode}
        />
      )}
      {receipt && (
        <CouponReceiptDialog
          receipt={receipt}
          receiptHeading={receiptHeading}
          setReceipt={setReceipt}
        />
      )}
    </div>
  );
}
