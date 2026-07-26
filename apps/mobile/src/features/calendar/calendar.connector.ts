/**
 * Porta do conector de calendário (docs/20 M4).
 * Preferência: agenda do aparelho; Google/Apple OAuth opcional; Demo só em __DEV__.
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
  readonly id: 'demo' | 'device_calendar' | 'google_calendar' | 'apple_calendar';
  readonly label: string;
  isAvailable(): Promise<boolean>;
  requestPermissions(): Promise<{ granted: boolean }>;
  pullSince(since: string, until?: string): Promise<CalendarPullResult>;
}
