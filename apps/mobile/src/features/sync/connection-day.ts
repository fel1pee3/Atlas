/**
 * Dia UTC em que a fonte foi conectada — piso do sync (sem lookback histórico).
 */
export function startOfUtcDayIso(date: Date = new Date()): string {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

/** Retorna o instante mais recente entre dois ISO (para não puxar antes da conexão). */
export function laterIso(a: string, b: string): string {
  return Date.parse(a) >= Date.parse(b) ? a : b;
}
