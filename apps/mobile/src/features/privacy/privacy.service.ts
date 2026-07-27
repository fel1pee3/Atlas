import { shareAsync, isAvailableAsync } from 'expo-sharing';
import {
  cacheDirectory,
  documentDirectory,
  writeAsStringAsync,
  EncodingType,
} from 'expo-file-system/legacy';
import { accountApi, api } from '../../lib/api';
import { getDb } from '../../db/client';
import { events } from '../../db/schema';
import { userIdFromAccessToken } from '../../lib/jwt';
import { useAuth } from '../../state/auth.store';
import { clearOnboardingForUser } from '../onboarding/onboarding.service';
import { wipeLocalSession } from '../session/wipe-local-session';

/**
 * Export / delete (docs/15 §7, docs/19 §13–15.4, M7).
 */

export async function exportAndShare(): Promise<{ counts: Record<string, number> }> {
  // Export pode ser grande (Demo 30 dias) — timeout longo; compartilhar como ARQUIVO
  // (Share.message com JSON enorme trava o Android e o spinner nunca para).
  const server = await api.get<Record<string, unknown>>('/account/export', {
    timeoutMs: api.timeouts.long,
  });

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
  const baseDir = cacheDirectory ?? documentDirectory;
  if (!baseDir) {
    throw new Error('Sem diretório local para gravar o export');
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileUri = `${baseDir}atlas-export-${stamp}.json`;
  await writeAsStringAsync(fileUri, json, { encoding: EncodingType.UTF8 });

  if (await isAvailableAsync()) {
    await shareAsync(fileUri, {
      mimeType: 'application/json',
      dialogTitle: 'Atlas — export CMHL',
      UTI: 'public.json',
    });
  } else {
    throw new Error('Compartilhamento não disponível neste aparelho');
  }

  const counts = (server.counts as Record<string, number>) ?? {};
  return { counts };
}

/**
 * Delete real: servidor (cascade) → limpa SQLite → limpa tokens.
 */
export async function deleteAccountAndWipe(): Promise<void> {
  const userId = userIdFromAccessToken(useAuth.getState().accessToken);
  await accountApi.delete();
  if (userId) await clearOnboardingForUser(userId);
  wipeLocalSession();
  await useAuth.getState().logoutLocalOnly();
}
