/**
 * Decisões de merge remoto → local (docs/08 §7.6).
 * Puro / testável sem SQLite nem Expo.
 */

export interface RemoteEventLike {
  id: string;
  type: string;
  source: string;
  externalId: string | null;
  occurredAt: string;
  payload: Record<string, unknown>;
}

export interface LocalEventRef {
  id: string;
  serverId: string | null;
  syncState: string;
}

export type MergeDecision =
  | { action: 'link'; localId: string; needsUpdate: boolean }
  | { action: 'skip' }
  | {
      action: 'insert';
      id: string;
      type: string;
      source: string;
      occurredAt: string;
      payloadJson: string;
      serverId: string;
    };

/**
 * Decide o que fazer com um evento remoto dado o estado local.
 * - externalId casa com id local → link (marca synced)
 * - serverId já existe → skip (idempotente)
 * - senão → insert como synced
 */
export function decideMerge(
  remote: RemoteEventLike,
  localByExternalId: LocalEventRef | null | undefined,
  localByServerId: LocalEventRef | null | undefined,
): MergeDecision {
  const localId = remote.externalId;

  if (localId && localByExternalId) {
    const needsUpdate =
      localByExternalId.serverId !== remote.id || localByExternalId.syncState !== 'synced';
    return { action: 'link', localId, needsUpdate };
  }

  if (localByServerId) {
    return { action: 'skip' };
  }

  const occurredAt =
    typeof remote.occurredAt === 'string'
      ? remote.occurredAt
      : new Date(remote.occurredAt as unknown as string).toISOString();

  return {
    action: 'insert',
    id: localId ?? remote.id,
    type: remote.type,
    source: remote.source,
    occurredAt,
    payloadJson: JSON.stringify(remote.payload ?? {}),
    serverId: remote.id,
  };
}
