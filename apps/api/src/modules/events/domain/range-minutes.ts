/**
 * Duração em minutos entre dois ISO datetimes (docs/11 payloads location/calendar).
 */
export function rangeMinutes(start?: unknown, end?: unknown): number {
  if (typeof start !== 'string' || typeof end !== 'string') return 0;
  const a = Date.parse(start);
  const b = Date.parse(end);
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return 0;
  return Math.round((b - a) / 60_000);
}
