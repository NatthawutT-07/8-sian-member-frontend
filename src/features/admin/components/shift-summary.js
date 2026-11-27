// The existing list API has no payment totals. Read closed-shift reports with
// limited concurrency; a failed report must not hide the rest of the page.
export async function loadShiftSummaries(shifts, api) {
  const rows = shifts.map((shift) => ({ ...shift }));
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(4, rows.length) }, async () => {
    while (cursor < rows.length) {
      const row = rows[cursor++];
      if (!row.closedAt) continue;
      try {
        row.report = await api(`/pos/shifts/${row.id}/report`);
      } catch {
        row.summaryError = true;
      }
    }
  }));
  return rows;
}
