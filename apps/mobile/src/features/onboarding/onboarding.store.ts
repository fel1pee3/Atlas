import { create } from 'zustand';
import { useAuth } from '../../state/auth.store';
import { userIdFromAccessToken } from '../../lib/jwt';
import {
  clearOnboardingCache,
  isOnboardingCompleted,
  markOnboardingCompleted,
} from './onboarding.service';

interface OnboardingState {
  done: boolean | null;
  refresh: () => Promise<void>;
  complete: () => Promise<void>;
  /** Após apagar conta: força “não feito” até o próximo login. */
  reset: () => void;
}

/**
 * Estado do gate de onboarding (M7) — evita race markCompleted → navigate.
 */
export const useOnboarding = create<OnboardingState>((set) => ({
  done: null,

  refresh: async () => {
    const userId = userIdFromAccessToken(useAuth.getState().accessToken);
    set({ done: await isOnboardingCompleted(userId) });
  },

  complete: async () => {
    const userId = userIdFromAccessToken(useAuth.getState().accessToken);
    if (!userId) return;
    await markOnboardingCompleted(userId);
    set({ done: true });
  },

  reset: () => {
    clearOnboardingCache();
    set({ done: false });
  },
}));
