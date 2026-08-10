export const CURRENT_AUDIT_DATE = '2026-08-03';
export const CURRENT_AUDIT_CUTOFF = '2026-08-03T23:59:59+08:00';

export function isFutureDateTime(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
    && Date.parse(value) > Date.parse(CURRENT_AUDIT_CUTOFF);
}
