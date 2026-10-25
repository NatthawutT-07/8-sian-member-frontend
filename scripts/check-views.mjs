// Render representative extracted views without a browser or backend requests.
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const server = await createServer({
  root: fileURLToPath(new URL('..', import.meta.url)),
  server: { middlewareMode: true, hmr: false },
  appType: 'custom',
});
const noop = () => {};
const now = Date.now();
const member = {
  id: 'test-member',
  firstName: 'สมชาย',
  lastName: 'ใจดี',
  phone: '0812345678',
  memberNumber: '8S-000001',
  createdAt: new Date(now).toISOString(),
  birthDate: '2000-01-01',
};
const coupon = {
  id: 'test-coupon',
  campaignId: 'test-campaign',
  title: 'ทะเล +79',
  description: 'กินทะเลไม่อั้น',
  extraPrice: 79,
  validityDays: 30,
  issuedAt: new Date(now).toISOString(),
  expiresAt: new Date(now + 86400000).toISOString(),
};
const campaign = {
  ...coupon,
  id: 'test-campaign',
  active: true,
  received: false,
  _count: { coupons: 1 },
};
async function check(module, props, expected) {
  const loaded = await server.ssrLoadModule('/src/' + module);
  const html = renderToStaticMarkup(createElement(loaded.default, props));
  assert.ok(html.includes(expected), `${module} should render ${expected}`);
}
try {
  const { default: LandingPage } = await server.ssrLoadModule('/src/pages/LandingPage.jsx');
  const home = renderToStaticMarkup(createElement(LandingPage, {}));
  assert.ok(home.includes('class="hero"'));
  assert.ok(
    !home.includes('class="form-card"'),
    'Home should link to the separate registration page',
  );
  assert.ok(home.includes('href="/register"') && home.includes('href="/coupons"'));
  for (const mode of ['register', 'login']) {
    const html = renderToStaticMarkup(createElement(LandingPage, { authMode: mode }));
    assert.ok(!html.includes('class="hero"'), 'Auth shortcuts should skip the landing content');
    assert.ok(html.includes('class="form-card"'));
    assert.ok(html.includes(mode === 'login' ? 'ยินดีต้อนรับกลับมา' : 'เริ่มต้นเป็นสมาชิก'));
  }
  console.log('PASS: home, register and login render separate shortcut pages');
  await check('features/member/MemberDashboard.jsx', { member, onSignedOut: noop }, 'คูปองของฉัน');
  await check(
    'features/member/components/CouponCard.jsx',
    { coupon, now, busy: false, showBarcode: noop },
    'ทะเล +79',
  );
  await check(
    'features/member/components/CampaignPanel.jsx',
    {
      activeTab: 'campaigns',
      campaigns: [campaign],
      loading: false,
      busy: false,
      claim: noop,
      claiming: null,
    },
    'รับคูปอง',
  );
  await check(
    'features/member/components/CouponBarcodeDialog.jsx',
    {
      selected: coupon,
      now,
      barcode: { code: '88012345678901234567890123456789', expiresAt: coupon.expiresAt },
      barcodeError: '',
      busy: false,
      cancelButton: { current: null },
      closeBarcode: noop,
      showBarcode: noop,
    },
    'บาร์โค้ดใช้คูปอง',
  );
  await check(
    'features/member/components/CouponReceiptDialog.jsx',
    {
      receipt: {
        ...coupon,
        couponId: coupon.id,
        memberNumber: member.memberNumber,
        usedAt: coupon.issuedAt,
      },
      receiptHeading: { current: null },
      setReceipt: noop,
    },
    'POS ยืนยันใช้คูปองแล้ว',
  );
  await check('features/admin/AdminPage.jsx', {}, 'กำลังตรวจสอบสิทธิ์แอดมิน');
  await check(
    'features/admin/components/AdminLogin.jsx',
    {
      alerts: null,
      busy: false,
      login: { username: 'admin', password: '' },
      setLogin: noop,
      signIn: noop,
    },
    'เข้าสู่ระบบแอดมิน',
  );
  await check(
    'features/admin/components/AdminMemberDetail.jsx',
    {
      detail: { member, coupons: [{ ...coupon, status: 'AVAILABLE' }], audits: [] },
      busy: false,
      campaigns: [campaign],
      grant: '',
      grantConfirm: false,
      issue: noop,
      reset: {},
      resetOpen: false,
      resetPassword: noop,
      setDetail: noop,
      setGrant: noop,
      setGrantConfirm: noop,
      setReset: noop,
      setResetOpen: noop,
    },
    'แจกคูปองให้สมาชิกนี้',
  );
  await check(
    'features/admin/components/AdminCampaigns.jsx',
    {
      api: noop,
      busy: false,
      campaignForm: { title: '', description: '', extraPrice: 79, validityDays: 30 },
      campaigns: [campaign],
      createCampaign: noop,
      loadCommon: noop,
      run: noop,
      setCampaignForm: noop,
    },
    'สร้างแคมเปญคูปอง',
  );
  console.log('PASS: 9 extracted member/admin views render without missing bindings or props');
} finally {
  await server.close();
}
