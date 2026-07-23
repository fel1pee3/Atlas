/**
 * Utilitário de dia civil (UTC) a partir de um instante.
 * MVP: UTC deliberado — evita depender de fuso do servidor; V1 pode
 * projetar no fuso do usuário (docs/11 §5.1).
 */
export function dayKeyUtc(when: Date): string {
  return when.toISOString().slice(0, 10); // YYYY-MM-DD
}

export function parseDayKey(day: string): Date {
  // Meia-noite UTC do dia civil.
  return new Date(`${day}T00:00:00.000Z`);
}
