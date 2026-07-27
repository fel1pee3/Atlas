import { Platform } from 'react-native';
import type { CalendarConnector } from './calendar.connector';
import { DemoCalendarConnector } from './demo.connector';
import { DeviceCalendarConnector } from './device-calendar.connector';
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

/** Só calendário do aparelho (+ demo em __DEV__). Google/Apple ficam fora da UI. */
export function listCalendarConnectors(): CalendarConnector[] {
  const out: CalendarConnector[] = [];
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    out.push(new DeviceCalendarConnector());
  }
  if (isDemoConnectorAllowed()) {
    out.push(new DemoCalendarConnector());
  }
  return out;
}
