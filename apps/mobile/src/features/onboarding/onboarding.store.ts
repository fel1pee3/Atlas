import { create } from 'zustand';
import {
  clearOnboardingCache,
  isOnboardingCompleted,
  markOnboardingCompleted,
} from './onboarding.service';

interface OnboardingState {
  done: boolean | null;
  refresh: () => Promise<void>;
  complete: () => Promise<void>;
  reset: () => void;
}

/**
 * Estado do gate de onboarding (M7) — evita race markCompleted → navigate.
 */
export const useOnboarding = create<OnboardingState>((set) => ({
  done: null,

  refresh: async () => {
    set({ done: await isOnboardingCompleted() });
  },

  complete: async () => {
    await markOnboardingCompleted();
    set({ done: true });
  },

  reset: () => {
    // false = "não feito" (após apagar conta). null = "ainda carregando" — nunca usar no logout
    // senão o gate autentica + done=null e a UI fica em spinner/stack zumbi.
    clearOnboardingCache();
    set({ done: false });
  },
}));
