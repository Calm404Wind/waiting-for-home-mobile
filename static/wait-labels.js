const counts = new Intl.NumberFormat('zh-HK');

export function elapsedLabel(item) {
  if (!Number.isFinite(item.wait_days) || item.wait_days < 0) return '';
  if (item.intake_precision === 'month') {
    const {wait_days_min: min, wait_days_max: max} = item;
    if (Number.isFinite(min) && Number.isFinite(max) && min < max) {
      return `${counts.format(min)}–${counts.format(max)} 天`;
    }
    return `約 ${counts.format(item.wait_days)} 天`;
  }
  return `${counts.format(item.wait_days)} 天`;
}

export function elapsedSummary(item) {
  const days = elapsedLabel(item);
  if (!days) return '';
  const start = [item.intake_basis || '記錄起點', item.intake_date].filter(Boolean).join(' ');
  const snapshot = item.reference_date || item.snapshot_date;
  return `${start}${snapshot ? `，截至 ${snapshot} 快照` : ''}已過 ${days}。`;
}
