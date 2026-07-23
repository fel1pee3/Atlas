import type { CalendarConnector } from './calendar.connector';
import { DemoCalendarConnector } from './demo.connector';
import { OAuthCalendarConnectorStub } from './oauth.stub';

export function resolveCalendarConnector(): CalendarConnector {
  return new DemoCalendarConnector();
}

export function listCalendarConnectors(): CalendarConnector[] {
  return [
    new DemoCalendarConnector(),
    new OAuthCalendarConnectorStub('google_calendar', 'Google Calendar'),
    new OAuthCalendarConnectorStub('apple_calendar', 'Apple Calendar'),
  ];
}
