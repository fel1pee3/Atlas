import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authApi, configureApi, type AuthTokens } from '../lib/api';
import { humanizeAuthError } from '../features/auth/auth-errors';
import { wipeLocalSession } from '../features/session/wipe-local-session';
import {
  clearOnboardingCache,
  markOnboardingCompleted,
  rememberLastUserId,
} from '../features/onboarding/onboarding.service';
import { userIdFromAccessToken } from '../lib/jwt';

/**
 * Store de autenticação (docs/16_Security.md).
 * Tokens são persistidos no SecureStore (Keychain/Keystore) — nunca em AsyncStorage.
 */
const ACCESS_KEY = 'atlas.accessToken';
const REFRESH_KEY = 'atlas.refreshToken';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  error: string | null;
  clearError: () => void;
  hydrate: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Limpa sessão local sem chamar a API (após delete de conta). */
  logoutLocalOnly: () => Promise<void>;
  refresh: () => Promise<string | null>;
}

async function persist(tokens: AuthTokens): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_KEY, tokens.accessToken);
  await SecureStore.setItemAsync(REFRESH_KEY, tokens.refreshToken);
}

async function clearPersisted(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}

export const useAuth = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  status: 'loading',
  error: null,

  clearError: () => set({ error: null }),

  hydrate: async () => {
    try {
      const accessToken = await SecureStore.getItemAsync(ACCESS_KEY);
      const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
      set({
        accessToken,
        refreshToken,
        status: accessToken ? 'authenticated' : 'unauthenticated',
      });
    } catch (e) {
      // SecureStore pode falhar em alguns ambientes; nunca deve impedir o boot.
      console.warn('[Atlas] hydrate falhou', e);
      set({ accessToken: null, refreshToken: null, status: 'unauthenticated' });
    }
  },

  register: async (email, password) => {
    set({ error: null });
    try {
      const tokens = await authApi.register(email, password);
      const userId = userIdFromAccessToken(tokens.accessToken);
      // Conta nova: não herda timeline; onboarding desta conta começa do zero.
      wipeLocalSession();
      if (userId) await rememberLastUserId(userId);
      await persist(tokens);
      set({ ...tokens, status: 'authenticated' });
    } catch (e) {
      set({ error: humanizeAuthError(e, 'register') });
      throw e;
    }
  },

  login: async (email, password) => {
    set({ error: null });
    try {
      const tokens = await authApi.login(email, password);
      const userId = userIdFromAccessToken(tokens.accessToken);
      // Conta já existe → pula Bem-vindo mesmo após reinstall / limpar dados.
      if (userId) await markOnboardingCompleted(userId);
      wipeLocalSession();
      if (userId) await rememberLastUserId(userId);
      await persist(tokens);
      set({ ...tokens, status: 'authenticated' });
    } catch (e) {
      set({ error: humanizeAuthError(e, 'login') });
      throw e;
    }
  },

  logout: async () => {
    const { refreshToken } = get();
    // Limpa timeline local; “já fiz onboarding” permanece no SecureStore desta conta.
    wipeLocalSession();
    clearOnboardingCache();
    await clearPersisted();
    set({ accessToken: null, refreshToken: null, status: 'unauthenticated' });
    if (refreshToken) {
      void authApi.logout(refreshToken).catch(() => undefined);
    }
  },

  logoutLocalOnly: async () => {
    wipeLocalSession();
    clearOnboardingCache();
    await clearPersisted();
    set({ accessToken: null, refreshToken: null, status: 'unauthenticated' });
  },

  refresh: async () => {
    const { refreshToken } = get();
    if (!refreshToken) {
      set({ status: 'unauthenticated' });
      return null;
    }
    try {
      const tokens = await authApi.refresh(refreshToken);
      await persist(tokens);
      set({ ...tokens, status: 'authenticated' });
      return tokens.accessToken;
    } catch {
      // Sessão inválida: zera local para o próximo login não herdar dados.
      wipeLocalSession();
      await clearPersisted();
      set({ accessToken: null, refreshToken: null, status: 'unauthenticated' });
      return null;
    }
  },
}));

// Liga o cliente de API ao store (token + refresh transparente).
configureApi({
  getAccessToken: () => useAuth.getState().accessToken,
  onNeedRefresh: () => useAuth.getState().refresh(),
});
