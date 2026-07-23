import { Share } from 'react-native';
import { accountApi } from '../../lib/api';
import { getDb, resetLocalDb } from '../../db/client';
import { events } from '../../db/schema';
import { useAuth } from '../../state/auth.store';
import { useOnboarding } from '../onboarding/onboarding.store';

/**
 * Export / delete (docs/15 §7, docs/19 §13–15.4, M7).
 */

export async function exportAndShare(): Promise<{ counts: Record<string, number> }> {
  const server = await accountApi.export();
  const localRows = await getDb().select().from(events);

  const bundle = {
    ...server,
    localDeviceEvents: localRows.map((r) => ({
      id: r.id,
      type: r.type,
      source: r.source,
      occurredAt: r.occurredAt,
      payload: JSON.parse(r.payload) as unknown,
      serverId: r.serverId,
      syncState: r.syncState,
    })),
    localCounts: { events: localRows.length },
  };

  const json = JSON.stringify(bundle, null, 2);
  await Share.share({
    title: 'Atlas — export CMHL',
    message: json,
  });

  const counts = (server.counts as Record<string, number>) ?? {};
  return { counts };
}

/**
 * Delete real: servidor (cascade) → limpa SQLite → limpa tokens.
 */
export async function deleteAccountAndWipe(): Promise<void> {
  await accountApi.delete();
  resetLocalDb();
  useOnboarding.getState().reset();
  await useAuth.getState().logoutLocalOnly();
}
