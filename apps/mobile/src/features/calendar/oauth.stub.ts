import type { CalendarConnector, CalendarPullResult } from './calendar.connector';

/**
 * Stub OAuth (Google/Apple Calendar) — docs/20 M4.
 * Fluxo real: AuthSession + tokens cifrados (docs/16) em marco posterior.
 */
export class OAuthCalendarConnectorStub implements CalendarConnector {
  constructor(
    readonly id: 'google_calendar' | 'apple_calendar',
    readonly label: string,
  ) {}

  async isAvailable(): Promise<boolean> {
    return false;
  }

  async requestPermissions(): Promise<{ granted: boolean }> {
    return { granted: false };
  }

  async pullSince(_since: string, _until?: string): Promise<CalendarPullResult> {
    throw new Error(
      this.id === 'google_calendar'
        ? 'Use GoogleCalendarConnector com googleWebClientId configurado.'
        : `${this.label} (Apple) ainda não está implementado. Use Google Calendar no Android.`,
    );
  }
}
