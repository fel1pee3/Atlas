import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { getGoogleAndroidClientId, getGoogleWebClientId } from '../../config/extra';
import type { CalendarConnector, CalendarPullResult, CalendarSample } from './calendar.connector';

WebBrowser.maybeCompleteAuthSession();

const SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';
const TOKEN_KEY = 'atlas.google.calendar.tokens';
const DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

type StoredTokens = {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
};

/**
 * Google Calendar via OAuth (docs/20 M4).
 * Configure googleAndroidClientId / googleWebClientId em app.json → extra.
 */
export class GoogleCalendarConnector implements CalendarConnector {
  readonly id = 'google_calendar' as const;
  readonly label = 'Google Calendar';

  private clientId(): string {
    // Auth Session on Android typically uses the Web client ID with custom scheme PKCE.
    return getGoogleWebClientId() || getGoogleAndroidClientId();
  }

  async isAvailable(): Promise<boolean> {
    return this.clientId().length > 0;
  }

  async requestPermissions(): Promise<{ granted: boolean }> {
    if (!(await this.isAvailable())) return { granted: false };

    const clientId = this.clientId();
    const redirectUri = AuthSession.makeRedirectUri({ scheme: 'atlas' });
    const request = new AuthSession.AuthRequest({
      clientId,
      redirectUri,
      scopes: [SCOPE, 'openid', 'email'],
      usePKCE: true,
      responseType: AuthSession.ResponseType.Code,
      extraParams: { access_type: 'offline', prompt: 'consent' },
    });

    await request.makeAuthUrlAsync(DISCOVERY);
    const result = await request.promptAsync(DISCOVERY);
    if (result.type !== 'success' || !result.params.code) {
      return { granted: false };
    }

    const tokenResult = await AuthSession.exchangeCodeAsync(
      {
        clientId,
        code: result.params.code,
        redirectUri,
        extraParams: request.codeVerifier ? { code_verifier: request.codeVerifier } : undefined,
      },
      DISCOVERY,
    );

    if (!tokenResult.accessToken) return { granted: false };

    const expiresIn = tokenResult.expiresIn ?? 3600;
    const tokens: StoredTokens = {
      accessToken: tokenResult.accessToken,
      refreshToken: tokenResult.refreshToken,
      expiresAt: Date.now() + expiresIn * 1000,
    };
    await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(tokens));
    return { granted: true };
  }

  async pullSince(since: string, until?: string): Promise<CalendarPullResult> {
    const accessToken = await this.getValidAccessToken();
    if (!accessToken) {
      throw new Error(
        'Google Calendar não autenticado. Conecte novamente (OAuth) ou configure googleWebClientId / googleAndroidClientId no app.json.',
      );
    }

    const timeMin = since;
    const timeMax = until ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
    url.searchParams.set('timeMin', timeMin);
    url.searchParams.set('timeMax', timeMax);
    url.searchParams.set('singleEvents', 'true');
    url.searchParams.set('orderBy', 'startTime');
    url.searchParams.set('maxResults', '250');

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Google Calendar API ${res.status}: ${body.slice(0, 200)}`);
    }

    const data = (await res.json()) as {
      items?: Array<{
        id?: string;
        summary?: string;
        location?: string;
        attendees?: unknown[];
        start?: { dateTime?: string; date?: string };
        end?: { dateTime?: string; date?: string };
      }>;
    };

    const samples: CalendarSample[] = [];
    for (const item of data.items ?? []) {
      const startsAt = item.start?.dateTime ?? (item.start?.date ? `${item.start.date}T09:00:00.000Z` : null);
      if (!startsAt || !item.id) continue;
      const endsAt = item.end?.dateTime ?? (item.end?.date ? `${item.end.date}T18:00:00.000Z` : undefined);
      samples.push({
        externalId: `gcal:${item.id}`,
        type: 'calendar.event',
        occurredAt: startsAt,
        payload: {
          title: item.summary?.trim() || '(sem título)',
          startsAt,
          endsAt,
          location: item.location,
          attendees: Array.isArray(item.attendees) ? item.attendees.length : undefined,
        },
      });
    }

    return { samples, nextCursor: timeMax };
  }

  private async getValidAccessToken(): Promise<string | null> {
    const raw = await SecureStore.getItemAsync(TOKEN_KEY);
    if (!raw) return null;
    let tokens: StoredTokens;
    try {
      tokens = JSON.parse(raw) as StoredTokens;
    } catch {
      return null;
    }

    if (tokens.expiresAt > Date.now() + 60_000) {
      return tokens.accessToken;
    }

    if (!tokens.refreshToken) return tokens.accessToken;

    const clientId = this.clientId();
    const refreshed = await AuthSession.refreshAsync(
      { clientId, refreshToken: tokens.refreshToken },
      DISCOVERY,
    );
    if (!refreshed.accessToken) return null;

    const next: StoredTokens = {
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken ?? tokens.refreshToken,
      expiresAt: Date.now() + (refreshed.expiresIn ?? 3600) * 1000,
    };
    await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(next));
    return next.accessToken;
  }
}
