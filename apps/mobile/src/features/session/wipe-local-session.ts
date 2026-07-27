import { resetLocalDb } from '../../db/client';
import { clearOnboardingCache } from '../onboarding/onboarding.service';
import { stopAutoSync } from '../sync/auto-sync';

/**
 * Zera CMHL local (timeline / sync meta).
 * Não apaga “onboarding feito” no SecureStore — isso é por userId e sobrevive a Sair/Entrar.
 */
export function wipeLocalSession(): void {
  try {
    stopAutoSync();
  } catch {
    /* auto-sync pode não ter iniciado */
  }
  resetLocalDb();
  clearOnboardingCache();
}
