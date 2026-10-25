import { Gift, LoaderCircle, Plus, LockKeyhole } from 'lucide-react';

export default function CampaignPanel({ activeTab, busy, campaigns, claim, claiming, loading }) {
  return (
    <section
      id="campaigns-panel"
      role="tabpanel"
      aria-labelledby="campaigns-tab"
      hidden={activeTab !== 'campaigns'}
      className="member-campaigns"
    >
      <div className="coupon-section-heading">
        <div>
          <div className="eyebrow">PICK YOUR NEXT GOOD THING</div>
          <h2>แคมเปญรับคูปอง</h2>
          <p>เลือกสิทธิพิเศษที่ชอบ รับได้บัญชีละ 1 ครั้งต่อแคมเปญ</p>
        </div>
      </div>
      {loading ? (
        <p className="campaign-loading">กำลังโหลดแคมเปญ…</p>
      ) : campaigns.length ? (
        <div className="campaign-offer-grid">
          {campaigns.map((c) => (
            <article className="campaign-offer" key={c.id}>
              <div className="campaign-offer-icon">
                <Gift size={23} strokeWidth={1.3} />
              </div>
              <div className="campaign-offer-info">
                <h3>{c.title}</h3>
                <p>{c.description}</p>
                <small>
                  {c.extraPrice > 0 ? `ค่าเพิ่ม ${c.extraPrice} บาท` : 'ไม่มีค่าใช้จ่ายเพิ่ม'} ·
                  ใช้ได้ {c.validityDays} วันหลังรับ
                </small>
                {c.prerequisiteCampaign && (
                  <p className="coupon-prerequisite" id={`campaign-condition-${c.id}`}>
                    {c.locked ? 'ต้องใช้' : 'ผ่านเงื่อนไขแล้ว: ใช้'} “{c.prerequisiteCampaign.title}
                    ” {c.locked ? 'และให้ระบบยืนยันสำเร็จก่อน' : 'สำเร็จแล้ว'}
                  </p>
                )}
              </div>
              <button
                className="button dark"
                disabled={busy || c.locked}
                aria-describedby={c.prerequisiteCampaign ? `campaign-condition-${c.id}` : undefined}
                onClick={() => claim(c)}
              >
                {claiming === c.id ? (
                  <>
                    <LoaderCircle size={15} className="spin" /> กำลังรับ…
                  </>
                ) : c.locked ? (
                  <>
                    <LockKeyhole size={15} /> ยังไม่ปลดล็อก
                  </>
                ) : (
                  <>
                    รับคูปอง <Plus size={15} />
                  </>
                )}
              </button>
            </article>
          ))}
        </div>
      ) : (
        <p className="campaign-loading">ไม่มีแคมเปญใหม่ให้รับในขณะนี้</p>
      )}
    </section>
  );
}
