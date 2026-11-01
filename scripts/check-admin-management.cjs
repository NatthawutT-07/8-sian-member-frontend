// Isolated UI fixtures: all /api traffic is redirected to this in-memory server.
const { app, BrowserWindow } = require('electron');
const express = require('express');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
app.commandLine.appendSwitch('force-device-scale-factor', '1');
app.on('window-all-closed', () => {});
app.whenReady().then(async () => {
  let server, win;
  try {
    const api = express();
    api.use(express.json());
    api.use((req, res, next) => {
      res.set('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.set('Access-Control-Allow-Credentials', 'true');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      if (req.method === 'OPTIONS') return res.sendStatus(204);
      next();
    });
    const now = new Date().toISOString();
    const members = [
      {
        id: 'm1',
        memberNumber: '8S-000001',
        firstName: 'สมาชิก',
        lastName: 'มีประวัติ',
        phone: '0812345678',
        birthDate: '2000-01-01',
        createdAt: now,
      },
    ];
    const campaigns = [
      {
        id: 'c1',
        title: 'แคมเปญเดิม',
        description: 'สิทธิ์ทดสอบ',
        extraPrice: -20,
        validityDays: 30,
        active: true,
        _count: { coupons: 1 },
      },
      {
        id: 'c2',
        title: 'แคมเปญยังไม่แจก',
        description: 'แก้ไขได้',
        extraPrice: 79,
        validityDays: 30,
        active: true,
        _count: { coupons: 0 },
      },
    ];
    const staff = [
      { id: 'u1', username: 'cashier01', displayName: 'พนักงานเดิม', active: true, role: 'USER' },
    ];
    const products = [
      {
        id: 'p1',
        name: 'บุฟเฟต์หมูกระทะ',
        barcode: '8850123456789',
        priceSatang: 29900,
        group: 'MAIN',
        active: true,
      },
    ];
    const summary = { billCount: 2, totalSatang: 59800, cashSatang: 29900, transferSatang: 29900 };
    const shift = {
      id: 's1',
      businessDate: now.slice(0, 10),
      openedAt: now,
      closedAt: now,
      openingCashSatang: 10000,
      expectedCashSatang: 39900,
      countedCashSatang: 39900,
      cashDifferenceSatang: 0,
      openedByName: 'พนักงานเดิม',
      closedByName: 'พนักงานเดิม',
      _count: { sales: 2 },
    };
    const sale = {
      id: 'sale1',
      receiptNumber: '2611011000001',
      createdAt: now,
      method: 'CASH',
      cashierDisplayName: 'พนักงานเดิม',
      totalSatang: 29900,
      discountSatang: 0,
      items: [{ ...products[0], productId: 'p1', quantity: 1 }],
    };
    let deleteCalls = 0,
      revoked = false,
      passwordChanged = false;
    const match = (rows, id) => rows.find((row) => row.id === id);
    api.get('/api/admin/me', (_, res) =>
      res.json({ admin: { username: 'fixture-owner', role: 'ADMIN' } }),
    );
    api.get('/api/admin/overview', (_, res) =>
      res.json({
        members: members.length,
        campaigns: campaigns.length,
        issued: 1,
        used: 0,
        available: 1,
        expired: 0,
      }),
    );
    api.get('/api/admin/members', (_, res) =>
      res.json({ members, total: members.length, page: 1, pages: 1 }),
    );
    api.get('/api/admin/members/:id', (req, res) =>
      res.json({
        member: match(members, req.params.id),
        usedCampaignIds: [],
        audits: [],
        coupons:
          req.params.id === 'm1'
            ? [
                {
                  id: 'coupon1',
                  campaignId: 'c1',
                  title: 'แคมเปญเดิม',
                  status: revoked ? 'EXPIRED' : 'AVAILABLE',
                  issuedAt: now,
                  expiresAt: new Date(Date.now() + 86400000).toISOString(),
                },
              ]
            : [],
      }),
    );
    api.post('/api/admin/members', (req, res) => {
      const row = {
        ...req.body,
        id: `m${members.length + 1}`,
        memberNumber: '8S-000002',
        createdAt: now,
      };
      delete row.password;
      members.push(row);
      res.json({ member: row });
    });
    api.put('/api/admin/members/:id', (req, res) => {
      const row = match(members, req.params.id);
      Object.assign(row, req.body);
      res.json({ member: row });
    });
    api.delete('/api/admin/members/:id', (req, res) => {
      deleteCalls++;
      const i = members.findIndex((row) => row.id === req.params.id);
      if (req.params.id === 'm1')
        return res.status(409).json({ message: 'สมาชิกมีประวัติแล้ว ไม่สามารถลบได้' });
      members.splice(i, 1);
      res.json({ message: 'ลบแล้ว' });
    });
    api.post('/api/admin/members/:id/coupons/:couponId/revoke', (_, res) => {
      revoked = true;
      res.json({ message: 'ยกเลิกแล้ว' });
    });
    api.get('/api/admin/campaigns', (_, res) => res.json({ campaigns }));
    api.put('/api/admin/campaigns/:id', (req, res) => {
      const row = match(campaigns, req.params.id);
      Object.assign(row, req.body);
      res.json({ campaign: row });
    });
    api.patch('/api/admin/campaigns/:id', (req, res) => {
      const row = match(campaigns, req.params.id);
      Object.assign(row, req.body);
      res.json({ campaign: row });
    });
    api.delete('/api/admin/campaigns/:id', (_, res) =>
      res.status(409).json({ message: 'แคมเปญนี้แจกคูปองแล้ว ไม่สามารถลบได้' }),
    );
    api.get('/api/admin/pos/users', (_, res) => res.json(staff));
    api.put('/api/admin/pos/users/:id', (req, res) => {
      const row = match(staff, req.params.id);
      Object.assign(row, req.body);
      res.json(row);
    });
    api.patch('/api/admin/pos/users/:id', (req, res) => {
      const row = match(staff, req.params.id);
      Object.assign(row, req.body);
      res.json(row);
    });
    api.post('/api/admin/pos/users/:id/password', (req, res) => {
      assert.equal(req.body.adminPassword, 'fixture-owner-password');
      assert.equal(req.body.confirmPassword, undefined);
      passwordChanged = true;
      res.json({ message: 'บันทึกแล้ว' });
    });
    api.get('/api/admin/pos/products', (_, res) => res.json(products));
    api.put('/api/admin/pos/products/:id', (req, res) => {
      const row = match(products, req.params.id);
      Object.assign(row, req.body);
      res.json(row);
    });
    api.delete('/api/admin/pos/products/:id', (_, res) =>
      res.status(409).json({ message: 'สินค้ามีประวัติขาย กรุณาหยุดขายแทน' }),
    );
    api.get('/api/admin/pos/coupon-rules', (_, res) => res.json(campaigns));
    api.get('/api/admin/pos/reports', (_, res) => res.json({ summary }));
    api.get('/api/admin/pos/sales', (_, res) =>
      res.json({ sales: [sale], total: 1, page: 1, pages: 1 }),
    );
    api.get('/api/admin/pos/sales/:id', (_, res) => res.json(sale));
    api.get('/api/admin/pos/shifts', (_, res) =>
      res.json({ shifts: [shift], total: 1, page: 1, pages: 1 }),
    );
    api.get('/api/admin/pos/shifts/:id/report', (_, res) =>
      res.json({ shift, summary, items: [{ ...sale.items[0], quantity: 2, totalSatang: 59800 }] }),
    );
    api.get('/api/admin/audits', (_, res) => res.json({ audits: [], total: 0, page: 1, pages: 0 }));
    api.use(express.static(path.resolve(__dirname, '../dist')));
    api.use((_, res) => res.sendFile(path.resolve(__dirname, '../dist/index.html')));
    server = api.listen(0, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    win = new BrowserWindow({
      show: false,
      width: 1280,
      height: 1000,
      webPreferences: {
        offscreen: true,
        sandbox: true,
        contextIsolation: true,
        nodeIntegration: false,
        partition: `qa-admin-${Date.now()}`,
        backgroundThrottling: false,
      },
    });
    win.webContents.session.webRequest.onBeforeRequest(
      { urls: ['*://*/*'] },
      (details, callback) => {
        const url = new URL(details.url);
        if (url.pathname.startsWith('/api/'))
          return details.url.startsWith(base)
            ? callback({})
            : callback({ redirectURL: base + url.pathname + url.search });
        callback({ cancel: !details.url.startsWith(base) });
      },
    );
    const js = (code) =>
      win.webContents.executeJavaScript(code).catch((error) => {
        console.error('Failed UI cell:', code);
        throw error;
      });
    win.webContents.on('console-message', (event) => {
      if (event.level === 'error') console.error('Renderer:', event.message);
    });
    await win.loadURL(base + '/control-8sian-4d9c7a2e7f');
    await js(
      `window.setField=(name,value)=>{const el=document.querySelector('[role=dialog] [name="'+name+'"]');const proto=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:el.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(el,value);el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));};window.clickText=(text,selector='button')=>{const el=[...document.querySelectorAll(selector)].find(el=>el.textContent.trim()===text);if(!el)throw Error('No button '+text);el.click();};window.modalSubmit=()=>document.querySelector('[role=dialog] form').requestSubmit();undefined;`,
    );
    async function wait(condition) {
      for (let i = 0; i < 200; i++) {
        if (await js(condition)) return;
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
      throw new Error(`UI timeout: ${condition}`);
    }
    async function openModal(code) {
      await js(code);
      await wait('document.querySelector("[role=dialog] form") !== null');
    }
    const modalGone = () =>
      wait('!document.querySelector("[role=dialog]") && !document.querySelector(".admin-working")');
    await wait(
      'document.querySelector(".admin-tabs") && !document.querySelector(".admin-working")',
    );
    await openModal(`clickText('เพิ่มสมาชิก')`);
    await js(
      `setField('firstName','สมาชิก');setField('lastName','เพิ่มใหม่');setField('phone','0899999999');setField('birthDate','2000-01-01');setField('password','fixture-member-password');document.querySelector('[role=dialog] [name=privacyConsent]').click();modalSubmit();`,
    );
    await modalGone();
    assert.equal(members.length, 2);
    await js(
      `var row=[...document.querySelectorAll('tbody tr')].find(row=>row.textContent.includes('เพิ่มใหม่'));row.querySelector('button').click()`,
    );
    await wait(
      'document.querySelector(".admin-panel").textContent.includes("เพิ่มใหม่") && !document.querySelector(".admin-working")',
    );
    await openModal(`clickText('แก้ไขสมาชิก')`);
    await js(
      `setField('lastName','แก้ไขแล้ว');setField('reason','แก้ไขข้อมูลทดสอบ');modalSubmit()`,
    );
    await modalGone();
    assert.equal(members[1].lastName, 'แก้ไขแล้ว');
    await openModal(`clickText('ลบสมาชิก')`);
    await js(
      `setField('confirmName','ชื่อไม่ตรง');setField('reason','ลบรายการทดสอบ');modalSubmit()`,
    );
    await wait('document.querySelector("[role=dialog] [role=alert]")');
    assert.equal(deleteCalls, 0);
    await js(`setField('confirmName','สมาชิก แก้ไขแล้ว');modalSubmit()`);
    await modalGone();
    assert.equal(members.length, 1);
    await js(`clickText('แคมเปญคูปอง','.admin-tabs button')`);
    await wait('!document.querySelector(".admin-working")');
    await openModal(
      `var row=[...document.querySelectorAll('tbody tr')].find(row=>row.textContent.includes('ยังไม่แจก'));[...row.querySelectorAll('button')].find(b=>b.textContent==='แก้ไข').click();`,
    );
    await js(`setField('title','แคมเปญแก้ไขแล้ว');modalSubmit()`);
    await modalGone();
    assert.equal(campaigns[1].title, 'แคมเปญแก้ไขแล้ว');
    await js(`clickText('พนักงานและสินค้า POS','.admin-tabs button')`);
    await wait(
      'document.querySelector(".admin-pos-row") && !document.querySelector(".admin-pos [role=status]")',
    );
    await openModal(
      `var row=[...document.querySelectorAll('.admin-pos-row')].find(row=>row.textContent.includes('cashier01'));[...row.querySelectorAll('button')].find(b=>b.textContent==='แก้ไข').click()`,
    );
    await js(
      `setField('displayName','พนักงานแก้ไขแล้ว');document.querySelector('[role=dialog] [name=active]').click();modalSubmit()`,
    );
    await modalGone();
    assert.equal(staff[0].active, false);
    await openModal(`clickText('ตั้งรหัสผ่าน')`);
    await js(
      `setField('newPassword','fixture-staff-password');setField('confirmPassword','fixture-staff-password');setField('adminPassword','fixture-owner-password');setField('reason','พนักงานลืมรหัสผ่าน');modalSubmit()`,
    );
    await modalGone();
    assert.equal(passwordChanged, true);
    await js(`clickText('หยุดขาย')`);
    await wait(
      '[...document.querySelectorAll(".admin-pos-row button")].some(button=>button.textContent==="เปิดขาย")',
    );
    assert.equal(products[0].active, false);
    await js(`clickText('ยอดขายและกะ','.admin-tabs button')`);
    await wait('document.querySelector(".admin-business-reports table tbody tr")');
    await js(`clickText('ดูบิล')`);
    await wait('document.querySelector("[role=dialog]")?.textContent.includes("2611011000001")');
    await js(`clickText('ปิด','[role=dialog] button');clickText('กะเปิด–ปิดร้าน')`);
    await wait(
      'document.querySelector(".admin-business-reports table tbody").textContent.includes("ดูสรุปกะ")',
    );
    await js(`clickText('ดูสรุปกะ')`);
    await wait('document.querySelector("[role=dialog]")?.textContent.includes("เงินโอน")');
    const out = path.resolve(__dirname, '../../.tmp/admin-management');
    fs.mkdirSync(out, { recursive: true });
    await new Promise((resolve) => setTimeout(resolve, 250));
    fs.writeFileSync(path.join(out, 'desktop.png'), (await win.webContents.capturePage()).toPNG());
    await js(`clickText('ปิด','[role=dialog] button')`);
    win.setSize(390, 844);
    await new Promise((resolve) => setTimeout(resolve, 300));
    assert.equal(await js('document.documentElement.scrollWidth <= innerWidth + 1'), true);
    fs.writeFileSync(path.join(out, 'mobile.png'), (await win.webContents.capturePage()).toPNG());
    await js(`clickText('สมาชิก','.admin-tabs button')`);
    await wait('document.querySelector("tbody tr") && !document.querySelector(".admin-working")');
    await js(`document.querySelector('tbody tr button').click()`);
    await wait(
      'document.querySelector(".admin-panel").textContent.includes("มีประวัติ") && !document.querySelector(".admin-working")',
    );
    await openModal(`clickText('แก้ไขสมาชิก')`);
    assert.equal(await js('document.documentElement.scrollWidth <= innerWidth + 1'), true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    fs.writeFileSync(
      path.join(out, 'mobile-edit.png'),
      (await win.webContents.capturePage()).toPNG(),
    );
    await js(`clickText('ยกเลิก','[role=dialog] button')`);
    await openModal(`clickText('ลบสมาชิก')`);
    await js(
      `setField('confirmName','สมาชิก มีประวัติ');setField('reason','ทดสอบป้องกันลบประวัติ');modalSubmit()`,
    );
    await wait(
      'document.querySelector("[role=dialog] [role=alert]")?.textContent.includes("มีประวัติ")',
    );
    assert.equal(members.length, 1);
    await js(`clickText('ยกเลิก','[role=dialog] button')`);
    await openModal(`clickText('ยกเลิกสิทธิ์คูปอง')`);
    await js(`setField('reason','ทดสอบยกเลิกสิทธิ์ที่ยังไม่ใช้');modalSubmit()`);
    await modalGone();
    assert.equal(revoked, true);
    console.log(
      'PASS: admin member create/edit/confirmed delete, campaign edit, staff profile/status/password, product status, sales detail, shift report and 390px responsive layout. All mutations used isolated fixtures.',
    );
    app.exit(0);
  } catch (error) {
    console.error(error);
    app.exit(1);
  } finally {
    if (win && !win.isDestroyed()) win.destroy();
    if (server) server.close();
  }
});
