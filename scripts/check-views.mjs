// Render representative extracted views without a browser or backend requests.
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import jsQR from 'jsqr';

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
  return html;
}
try {
  const { default: LandingPage } = await server.ssrLoadModule('/src/pages/LandingPage.jsx');
  const home = renderToStaticMarkup(createElement(LandingPage, {}));
  assert.ok(home.includes('landing-hero'));
  assert.ok(home.includes('<h1>'), 'Home should have a clear main heading');
  assert.ok(
    !home.includes('class="form-card"'),
    'Home should link to the separate registration page',
  );
  assert.ok(home.includes('href="/register"') && home.includes('href="/coupons"'));
  for (const mode of ['register', 'login']) {
    const html = renderToStaticMarkup(createElement(LandingPage, { authMode: mode }));
    assert.ok(!html.includes('landing-hero'), 'Auth shortcuts should skip the landing content');
    assert.ok(html.includes('line-auth-card'));
    assert.ok(!html.includes('<input'), 'LINE entry must not render registration fields');
    assert.ok(!html.includes('name="birthDate"'));
    assert.ok(html.includes('เข้าสู่ระบบด้วย LINE'));
  }
  console.log('PASS: home, register and login render separate shortcut pages');
  for (const value of [
    '88012345678901234567890123456789',
    '00012345678901234567890123456789',
    `8SM-${'a'.repeat(64)}`,
  ]) {
    const qrHtml = await check(
      'features/member/components/CouponQrCode.jsx',
      { value },
      'QR Code คูปอง',
    );
    const size = Number(qrHtml.match(/viewBox="0 0 (\d+) \d+"/)[1]);
    const scale = 6,
      width = size * scale;
    const pixels = new Uint8ClampedArray(width * width * 4).fill(255);
    for (const match of qrHtml.matchAll(/M(\d+) (\d+)h1v1h-1z/g)) {
      const x = Number(match[1]),
        y = Number(match[2]);
      assert.ok(
        x >= 4 && y >= 4 && x < size - 4 && y < size - 4,
        'QR needs a four-module quiet zone',
      );
      for (let dy = 0; dy < scale; dy++)
        for (let dx = 0; dx < scale; dx++) {
          const i = ((y * scale + dy) * width + x * scale + dx) * 4;
          pixels[i] = pixels[i + 1] = pixels[i + 2] = 0;
        }
    }
    assert.equal(
      jsQR(pixels, width, width)?.data,
      value,
      'Rendered QR must decode to the exact coupon payload',
    );
  }
  console.log('PASS: rendered QR decodes to the original coupon code, including leading zeros');
  for (const extraPrice of [-20, 79, 0]) {
    const title = extraPrice < 0 ? 'ส่วนลด' : 'สิทธิพิเศษ';
    const amount = extraPrice < 0 ? '-20' : extraPrice > 0 ? '+79' : 'ฟรี';
    const text =
      extraPrice < 0 ? 'ส่วนลด 20 บาท' : extraPrice > 0 ? 'เพิ่ม 79 บาท' : 'ไม่มีค่าเพิ่ม';
    await check(
      'features/member/components/CouponCard.jsx',
      { coupon: { ...coupon, title, extraPrice }, now, busy: false, showBarcode: noop },
      amount,
    );
    await check(
      'features/member/components/CampaignPanel.jsx',
      {
        activeTab: 'campaigns',
        campaigns: [{ ...campaign, extraPrice }],
        loading: false,
        busy: false,
        claim: noop,
      },
      text,
    );
    await check(
      'features/member/components/CouponBarcodeDialog.jsx',
      {
        selected: { ...coupon, extraPrice },
        now,
        barcode: { code: '88012345678901234567890123456789', expiresAt: coupon.expiresAt },
        busy: false,
        cancelButton: { current: null },
        closeBarcode: noop,
        showBarcode: noop,
      },
      text,
    );
    const adminHtml = await check(
      'features/admin/components/AdminCampaigns.jsx',
      {
        busy: false,
        campaignForm: { title, description: 'สิทธิ์ทดสอบ', extraPrice, validityDays: 30 },
        campaigns: [{ ...campaign, extraPrice }],
        createCampaign: noop,
        setCampaignForm: noop,
      },
      text,
    );
    assert.ok(adminHtml.includes('min="-100000"') && adminHtml.includes('step="1"'));
    await check(
      'features/promotions/components/PromotionList.jsx',
      { promotions: [{ ...campaign, extraPrice }] },
      extraPrice === 0 ? 'ไม่มีค่าเพิ่ม' : amount,
    );
  }
  console.log(
    'PASS: discounts, surcharges and zero prices render correctly across admin and member views',
  );
  const memberHome = await check(
    'features/member/MemberDashboard.jsx',
    { member, onSignedOut: noop },
    'สิทธิ์สมาชิกของคุณ',
  );
  const publicPromotion = await check(
    'features/promotions/PublicPromotions.jsx',
    {},
    '1–30 พฤศจิกายน 2569',
  );
  for (const html of [home, publicPromotion, memberHome]) {
    assert.ok(html.includes('โปรโมชั่น หมูกระทะ 199 บาท'));
    assert.ok(html.includes('<del>100 บาท</del>'));
    assert.ok(html.includes('<strong>79</strong>'));
    assert.ok(html.includes('<strong>ฟรี</strong>ตะแกรงย่าง'));
    assert.ok(html.includes('ยังไม่รวมรีฟิล 39 บาท'));
    assert.ok(!html.includes('กำลังโหลดโปรโมชั่น'));
    assert.ok(!html.includes('หลังรับคูปอง'));
  }
  assert.ok(memberHome.includes(member.memberNumber));
  assert.ok(memberHome.includes('แสดงบัตรสมาชิกด้านบนกับพนักงานเพื่อรับสิทธิ์'));
  assert.ok(!memberHome.includes('รับคูปอง') && !memberHome.includes('wallet-tab'));
  await check('features/member/components/MemberWelcome.jsx', { member }, 'สะสมครั้ง');
  await check('features/admin/components/AdminLoyalty.jsx', { api: noop }, 'สแกน QR สมาชิก');
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
    'รูปแบบรหัสคูปอง',
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
  await check(
    'features/promotions/components/PromotionList.jsx',
    {
      promotions: [
        { ...campaign, prerequisite: null },
        {
          ...campaign,
          id: 'locked-public',
          title: 'สิทธิ์ครั้งถัดไป',
          prerequisite: { title: 'คูปองก่อนหน้า' },
        },
      ],
    },
    'เข้าสู่ระบบรับคูปอง',
  );
  const longTitle = 'โปรโมชั่นสำหรับสมาชิกที่มีรายละเอียดมากขึ้นและชื่อยาวเป็นพิเศษ';
  const mobileMemberList = await check(
    'features/admin/components/AdminMemberList.jsx',
    {
      busy: false,
      loadMembers: noop,
      members: {
        members: [{ ...member, firstName: 'สมชาย'.repeat(12), lastName: 'ใจดี'.repeat(12) }],
        total: 1,
        page: 1,
        pages: 1,
      },
      query: '',
      run: noop,
      setQuery: noop,
      setSearch: noop,
      showMember: noop,
    },
    'ดูแลสมาชิก',
  );
  assert.ok(mobileMemberList.includes('data-label="เลขสมาชิก"'));
  assert.ok(mobileMemberList.includes('data-label="เบอร์โทร"'));
  assert.ok(mobileMemberList.includes('role="columnheader"'));
  const mobileCampaignList = await check(
    'features/admin/components/AdminCampaigns.jsx',
    {
      api: noop,
      busy: false,
      campaignForm: { ...campaign, title: longTitle },
      campaigns: [{ ...campaign, title: longTitle, description: 'รายละเอียดเงื่อนไข'.repeat(30) }],
      createCampaign: noop,
      loadCommon: noop,
      run: noop,
      setCampaignForm: noop,
    },
    longTitle,
  );
  assert.ok(mobileCampaignList.includes('data-label="ส่วนลด / ค่าเพิ่ม"'));
  await check(
    'features/member/components/CampaignPanel.jsx',
    {
      activeTab: 'campaigns',
      busy: false,
      campaigns: [
        { ...campaign, title: longTitle, locked: true, prerequisiteCampaign: { title: longTitle } },
      ],
      claim: noop,
      claiming: null,
      loading: false,
    },
    'ยังไม่ปลดล็อก',
  );
  await check(
    'features/member/components/CouponBarcodeDialog.jsx',
    {
      selected: { ...coupon, title: longTitle },
      now,
      barcode: {
        code: '88012345678901234567890123456789',
        expiresAt: new Date(now - 1000).toISOString(),
      },
      barcodeError: '',
      busy: false,
      cancelButton: { current: null },
      closeBarcode: noop,
      showBarcode: noop,
    },
    'สร้างรหัสใหม่',
  );
  console.log(
    'PASS: mobile-view markup handles long content, readable table labels, locked campaigns and expired barcodes',
  );
  console.log(
    'PASS: extracted views and public promotion list render without missing bindings or props',
  );
} finally {
  await server.close();
}
