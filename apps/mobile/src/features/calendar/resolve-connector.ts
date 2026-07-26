import { Platform } from 'react-native';
import type { CalendarConnector } from './calendar.connector';
import { DemoCalendarConnector } from './demo.connector';
import { DeviceCalendarConnector } from './device-calendar.connector';
import { GoogleCalendarConnector } from './google-calendar.connector';
import { OAuthCalendarConnectorStub } from './oauth.stub';
import { isDemoConnectorAllowed } from '../connectors/demo-gate';

/** Sync automático: agenda do aparelho (sem OAuth). */
export function resolveCalendarConnector(): CalendarConnector {
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    return new DeviceCalendarConnector();
  }
  if (isDemoConnectorAllowed()) {
    return new DemoCalendarConnector();
  }
  throw new Error('Nenhum conector de calendário disponível nesta plataforma.');
}

export function listCalendarConnectors(): CalendarConnector[] {
  const out: CalendarConnector[] = [];
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    out.push(new DeviceCalendarConnector());
    // OAuth opcional (avançado) — só útil com Client ID no app.json.
    out.push(new GoogleCalendarConnector());
  }
  if (Platform.OS === 'ios') {
    out.push(new OAuthCalendarConnectorStub('apple_calendar', 'Apple Calendar'));
  }
  if (isDemoConnectorAllowed()) {
    out.push(new DemoCalendarConnector());
  }
  return out;
}
