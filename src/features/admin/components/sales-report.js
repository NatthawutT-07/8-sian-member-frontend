import { useEffect, useState } from 'react';

export const reportToday = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date());
export const reportMoney = (value = 0) => (value / 100).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const reportDate = (value) => new Date(value).toLocaleString('th-TH', {
  timeZone: 'Asia/Bangkok', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
});
export const paymentLabel = (method) => ({ CASH: 'เงินสด', TRANSFER: 'เงินโอน', MIXED: 'สด + โอน' })[method] || method;
export function useSalesReport(api, url) {
  const [state, setState] = useState({ data: null, busy: true, error: '' });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setState({ data: null, busy: true, error: '' });
    api(url).then((data) => { if (active) setState({ data, busy: false, error: '' }); })
      .catch((error) => { if (active) setState({ data: null, busy: false, error: error.message }); });
    return () => { active = false; };
  }, [api, url, revision]);
  return { ...state, reload: () => setRevision((value) => value + 1) };
}
