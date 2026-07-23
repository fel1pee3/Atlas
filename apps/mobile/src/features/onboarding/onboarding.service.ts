import { getMeta, setMeta } from '../../db/meta';

const META_DONE = 'onboarding.completed';

/** Cache em memória evita race no gate após markCompleted → navigate. */
let memoryDone: boolean | null = null;

export async function isOnboardingCompleted(): Promise<boolean> {
  if (memoryDone === true) return true;
  const done = (await getMeta(META_DONE)) === '1';
  memoryDone = done;
  return done;
}

export async function markOnboardingCompleted(): Promise<void> {
  await setMeta(META_DONE, '1');
  memoryDone = true;
}

/** Chamar após resetLocalDb / delete de conta. */
export function clearOnboardingCache(): void {
  memoryDone = null;
}
