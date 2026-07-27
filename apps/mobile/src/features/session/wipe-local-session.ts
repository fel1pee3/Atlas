import { resetLocalDb } from '../../db/client';
import { useOnboarding } from '../onboarding/onboarding.store';
import { stopAutoSync } from '../sync/auto-sync';

/**
 * Zera CMHL local + onboarding do aparelho.
 * Usar no logout e antes de login/registro de outra conta —
 * evita timeline da conta anterior no mesmo celular.
 */
export function wipeLocalSession(): void {
  try {
    stopAutoSync();
  } catch {
    /* auto-sync pode não ter iniciado */
  }
  resetLocalDb();
  useOnboarding.getState().reset();
}
