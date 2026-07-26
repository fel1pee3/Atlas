import { Platform } from 'react-native';
import type { LocationConnector } from './location.connector';
import { DemoLocationConnector } from './demo.connector';
import { DeviceLocationConnector } from './device-location.connector';
import { isDemoConnectorAllowed } from '../connectors/demo-gate';

export function resolveLocationConnector(): LocationConnector {
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    return new DeviceLocationConnector();
  }
  if (isDemoConnectorAllowed()) {
    return new DemoLocationConnector();
  }
  throw new Error('Nenhum conector de localização disponível nesta plataforma.');
}

export function listLocationConnectors(): LocationConnector[] {
  const out: LocationConnector[] = [];
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    out.push(new DeviceLocationConnector());
  }
  if (isDemoConnectorAllowed()) {
    out.push(new DemoLocationConnector());
  }
  return out;
}
