import * as SecureStore from 'expo-secure-store';
import { getMeta } from '../../db/meta';

/**
 * Onboarding por usuário no SecureStore (sobrevive a logout / wipe do SQLite).
 * Login de conta existente marca como feito (pula Bem-vindo após reinstall).
 * Só registro novo passa pelo onboarding.
 */

const KEY_PREFIX = 'atlas.onboarding.done.';
const LAST_USER_KEY = 'atlas.lastUserId';

/** Cache em memória evita race markCompleted → navigate. */
let memoryDone: boolean | null = null;
let memoryUserId: string | null = null;

function keyFor(userId: string): string {
  return `${KEY_PREFIX}${userId}`;
}

export async function isOnboardingCompleted(userId: string | null): Promise<boolean> {
  if (!userId) return false;
  if (memoryUserId === userId && memoryDone === true) return true;

  try {
    if ((await SecureStore.getItemAsync(keyFor(userId))) === '1') {
      memoryUserId = userId;
      memoryDone = true;
      return true;
    }
  } catch {
    /* SecureStore indisponível */
  }

  // Migração: flag antiga no SQLite (antes do SecureStore por userId).
  try {
    if ((await getMeta('onboarding.completed')) === '1') {
      await markOnboardingCompleted(userId);
      return true;
    }
  } catch {
    /* db ainda não pronto */
  }

  memoryUserId = userId;
  memoryDone = false;
  return false;
}

export async function markOnboardingCompleted(userId: string): Promise<void> {
  await SecureStore.setItemAsync(keyFor(userId), '1');
  memoryUserId = userId;
  memoryDone = true;
}

/** Apagar conta / reset explícito desta conta. */
export async function clearOnboardingForUser(userId: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(keyFor(userId));
  } catch {
    /* ignore */
  }
  if (memoryUserId === userId) {
    memoryUserId = null;
    memoryDone = null;
  }
}

export async function rememberLastUserId(userId: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(LAST_USER_KEY, userId);
  } catch {
    /* ignore */
  }
}

export async function getLastUserId(): Promise<string | null> {
  try {
    return (await SecureStore.getItemAsync(LAST_USER_KEY)) ?? null;
  } catch {
    return null;
  }
}

/** Só limpa cache em RAM (após wipe do SQLite / troca de sessão). */
export function clearOnboardingCache(): void {
  memoryDone = null;
  memoryUserId = null;
}
