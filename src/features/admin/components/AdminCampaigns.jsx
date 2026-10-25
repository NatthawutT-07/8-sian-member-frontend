import { Plus } from 'lucide-react';

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
                  onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
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
                    setCampaignForm({ ...campaignForm, description: e.target.value })
                  }
                />
              </label>
              <label>
                ค่าใช้จ่ายเพิ่ม (บาท / 0 = ไม่มีค่าเพิ่ม)
                <input
                  type="number"
                  min={0}
                  max={100000}
                  required
                  value={campaignForm.extraPrice}
                  onChange={(e) =>
                    setCampaignForm({
                      ...campaignForm,
                      extraPrice: e.target.value === '' ? '' : Number(e.target.value),
                    })
                  }
                />
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
          <table>
            <thead>
              <tr>
                <th>คูปอง / รายละเอียด</th>
                <th>ค่าเพิ่ม</th>
                <th>อายุ</th>
                <th>แจกแล้ว</th>
                <th>สถานะ</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.title}</strong>
                    <small>{c.description}</small>
                    <small>
                      {c.prerequisite
                        ? `ปลดล็อกเมื่อใช้: ${c.prerequisite.title}`
                        : 'รับได้โดยไม่ต้องใช้คูปองก่อนหน้า'}
                    </small>
                  </td>
                  <td>{c.extraPrice} บาท</td>
                  <td>{c.validityDays} วัน</td>
                  <td>{c._count.coupons}</td>
                  <td>
                    <span className={`admin-badge ${c.active ? 'available' : 'expired'}`}>
                      {c.active ? 'เปิดแจก' : 'ปิดแจก'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="admin-link"
                      disabled={busy}
                      onClick={() =>
                        run(async () => {
                          await api(`/campaigns/${c.id}`, {
                            method: 'PATCH',
                            body: JSON.stringify({ active: !c.active }),
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
