import { Platform } from 'react-native';
import type { CalendarConnector } from './calendar.connector';
import { DemoCalendarConnector } from './demo.connector';
import { GoogleCalendarConnector } from './google-calendar.connector';
import { OAuthCalendarConnectorStub } from './oauth.stub';
import { isDemoConnectorAllowed } from '../connectors/demo-gate';

export function resolveCalendarConnector(): CalendarConnector {
  const google = new GoogleCalendarConnector();
  return google;
}

export function listCalendarConnectors(): CalendarConnector[] {
  const out: CalendarConnector[] = [new GoogleCalendarConnector()];
  if (Platform.OS === 'ios') {
    out.push(new OAuthCalendarConnectorStub('apple_calendar', 'Apple Calendar'));
  }
  if (isDemoConnectorAllowed()) {
    out.push(new DemoCalendarConnector());
  }
  return out;
}
