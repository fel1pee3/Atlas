/**
 * Porta do conector de calendário (docs/20 M4 — Google/Apple Calendar).
 * OAuth real fica para o stub; Demo desbloqueia dogfooding no Expo Go.
 */

export interface CalendarSample {
  externalId: string;
  type: 'calendar.event';
  occurredAt: string;
  payload: {
    title: string;
    startsAt: string;
    endsAt?: string;
    location?: string;
    attendees?: number;
  };
}

export interface CalendarPullResult {
  samples: CalendarSample[];
  nextCursor: string;
}

export interface CalendarConnector {
  readonly id: 'demo' | 'google_calendar' | 'apple_calendar';
  readonly label: string;
  isAvailable(): Promise<boolean>;
  requestPermissions(): Promise<{ granted: boolean }>;
  pullSince(since: string, until?: string): Promise<CalendarPullResult>;
}
