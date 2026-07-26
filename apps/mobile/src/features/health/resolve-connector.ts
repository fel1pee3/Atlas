import { Platform } from 'react-native';
import type { HealthConnector } from './health.connector';
import { DemoHealthConnector } from './demo.connector';
import { HealthConnectConnector } from './health-connect.connector';
import { NativeHealthConnectorStub } from './native.stub';
import { isDemoConnectorAllowed } from '../connectors/demo-gate';

/**
 * Resolve o conector usado nas syncs automáticas (docs/08 §10.3).
 * Preferência: Health Connect (Android) → HealthKit stub (iOS) → Demo só em __DEV__.
 */
export function resolveHealthConnector(): HealthConnector {
  if (Platform.OS === 'android') {
    return new HealthConnectConnector();
  }
  if (Platform.OS === 'ios') {
    return new NativeHealthConnectorStub('healthkit', 'HealthKit');
  }
  if (isDemoConnectorAllowed()) {
    return new DemoHealthConnector();
  }
  throw new Error('Nenhum conector de saúde disponível nesta plataforma.');
}

/** Lista conectores para a UI (priming JIT — docs/08 §9.2). */
export function listHealthConnectors(): HealthConnector[] {
  const out: HealthConnector[] = [];
  if (Platform.OS === 'android') {
    out.push(new HealthConnectConnector());
  } else if (Platform.OS === 'ios') {
    out.push(new NativeHealthConnectorStub('healthkit', 'HealthKit'));
  }
  if (isDemoConnectorAllowed()) {
    out.push(new DemoHealthConnector());
  }
  return out;
}
