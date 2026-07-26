/**
 * Lógica pura de eventos locais (offline-first) — testável sem Expo SQLite.
 */

export interface LocalEventDraft {
  id: string;
  type: string;
  source: string;
  occurredAt: string;
  payload: string;
  serverId: null;
  syncState: 'pending';
  createdAt: number;
}

export interface AddEventLocalLogicInput {
  type: string;
  source: string;
  occurredAt: string;
  payload: Record<string, unknown>;
  id?: string;
}

/** Idempotência: se já existe, não insere de novo. */
export function planAddEventLocal(
  existing: { id: string } | null | undefined,
  input: AddEventLocalLogicInput,
  generatedId: string,
  nowMs: number,
): { inserted: false; id: string } | { inserted: true; row: LocalEventDraft } {
  const id = input.id ?? generatedId;
  if (existing) {
    return { inserted: false, id: existing.id };
  }
  return {
    inserted: true,
    row: {
      id,
      type: input.type,
      source: input.source,
      occurredAt: input.occurredAt,
      payload: JSON.stringify(input.payload),
      serverId: null,
      syncState: 'pending',
      createdAt: nowMs,
    },
  };
}

/** Conta quantos eventos demo seriam removidos (source=demo). */
export function countDemoEvents(rows: Array<{ source: string }>): number {
  return rows.filter((r) => r.source === 'demo').length;
}

/** Ids com source=demo (candidatos a purge). */
export function filterDemoEventIds(
  rows: Array<{ id: string; source: string }>,
): string[] {
  return rows.filter((r) => r.source === 'demo').map((r) => r.id);
}
