import { Plus } from 'lucide-react';
import { campaignPriceText } from '../../../lib/campaign-price.js';
export default function AdminCampaigns({
  api,
  busy,
  campaignForm,
  campaigns,
  createCampaign,
  loadCommon,
  run,
  setCampaignForm,
}) {
  return (
    <>
      <section className="admin-panel">
        <h2>สร้างแคมเปญคูปอง</h2>
        <p className="admin-help">
          แคมเปญที่เปิดแจกจะแสดงให้สมาชิกรับเองได้ หรือเลือกสมาชิกเพื่อแจกทีละบัญชี
        </p>
        <form onSubmit={createCampaign}>
          <fieldset disabled={busy}>
            <div className="admin-form-grid">
              <label>
                ชื่อคูปอง
                <input
                  placeholder="เช่น เพิ่มทะเล +79"
                  maxLength={100}
                  required
                  value={campaignForm.title}
                  onChange={(e) =>
                    setCampaignForm({
                      ...campaignForm,
                      title: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                รายละเอียดสิทธิ์
                <input
                  placeholder="เช่น กินทะเลไม่อั้น"
                  maxLength={500}
                  required
                  value={campaignForm.description}
                  onChange={(e) =>
                    setCampaignForm({
                      ...campaignForm,
                      description: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                ส่วนลด / ค่าเพิ่ม (บาท)
                <input
                  type="number"
                  min={-100000}
                  max={100000}
                  step={1}
                  aria-describedby="campaign-price-help"
                  required
                  value={campaignForm.extraPrice}
                  onChange={(e) =>
                    setCampaignForm({
                      ...campaignForm,
                      extraPrice: e.target.value === '' ? '' : Number(e.target.value),
                    })
                  }
                />
                <small id="campaign-price-help">
                  -20 = ลด 20 · 79 = เพิ่ม 79 · 0 = ไม่มีค่าเพิ่ม
                </small>
              </label>
              <label>
                อายุคูปองหลังแจก (วัน)
                <input
                  type="number"
                  min={1}
                  max={365}
                  required
                  value={campaignForm.validityDays}
                  onChange={(e) =>
                    setCampaignForm({
                      ...campaignForm,
                      validityDays: e.target.value === '' ? '' : Number(e.target.value),
                    })
                  }
                />
              </label>
              <label>
                ต้องใช้คูปองแคมเปญใดก่อน
                <select
                  value={campaignForm.prerequisiteCampaignId || ''}
                  onChange={(e) =>
                    setCampaignForm({
                      ...campaignForm,
                      prerequisiteCampaignId: e.target.value || null,
                    })
                  }
                >
                  <option value="">ไม่มีเงื่อนไข (คูปองแรก)</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.title}
                      {campaign.active ? '' : ' (ปิดแจก)'}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button className="admin-primary" disabled={busy}>
              <Plus size={16} /> สร้างแคมเปญ
            </button>
          </fieldset>
        </form>
      </section>
      <section className="admin-panel">
        <h2>แคมเปญทั้งหมด</h2>
        <div className="admin-table-wrap">
          <table className="admin-responsive-table" role="table">
            <thead role="rowgroup">
              <tr role="row">
                <th role="columnheader">คูปอง / รายละเอียด</th>
                <th role="columnheader">ส่วนลด / ค่าเพิ่ม</th>
                <th role="columnheader">อายุ</th>
                <th role="columnheader">แจกแล้ว</th>
                <th role="columnheader">สถานะ</th>
                <th role="columnheader" />
              </tr>
            </thead>
            <tbody role="rowgroup">
              {campaigns.map((c) => (
                <tr key={c.id} role="row">
                  <td role="cell" data-label="คูปอง / รายละเอียด">
                    <strong>{c.title}</strong>
                    <small>{c.description}</small>
                    <small>
                      {c.prerequisite
                        ? `ปลดล็อกเมื่อใช้: ${c.prerequisite.title}`
                        : 'รับได้โดยไม่ต้องใช้คูปองก่อนหน้า'}
                    </small>
                  </td>
                  <td role="cell" data-label="ส่วนลด / ค่าเพิ่ม">
                    {campaignPriceText(c.extraPrice)}
                  </td>
                  <td role="cell" data-label="อายุ">
                    {c.validityDays} วัน
                  </td>
                  <td role="cell" data-label="แจกแล้ว">
                    {c._count.coupons}
                  </td>
                  <td role="cell" data-label="สถานะ">
                    <span className={`admin-badge ${c.active ? 'available' : 'expired'}`}>
                      {c.active ? 'เปิดแจก' : 'ปิดแจก'}
                    </span>
                  </td>
                  <td role="cell" data-label="" className="admin-cell-action">
                    <button
                      className="admin-link"
                      disabled={busy}
                      onClick={() =>
                        run(async () => {
                          await api(`/campaigns/${c.id}`, {
                            method: 'PATCH',
                            body: JSON.stringify({
                              active: !c.active,
                            }),
                          });
                          await loadCommon();
                        })
                      }
                    >
                      {c.active ? 'ปิดการแจก' : 'เปิดการแจก'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="admin-help">
          การปิดแจกไม่ยกเลิกคูปองที่สมาชิกได้รับแล้ว เงื่อนไขแคมเปญที่สร้างแล้วไม่แก้ย้อนหลัง
        </p>
      </section>
    </>
  );
}
