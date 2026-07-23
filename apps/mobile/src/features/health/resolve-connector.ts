import { Platform } from 'react-native';
import type { HealthConnector } from './health.connector';
import { DemoHealthConnector } from './demo.connector';
import { NativeHealthConnectorStub } from './native.stub';

/**
 * Resolve o conector usado nas syncs automáticas (docs/08 §10.3).
 * M2: Demo é o default utilizável no Expo Go. Health Connect / HealthKit
 * aparecem na UI (listHealthConnectors) e ativam quando isAvailable()=true
 * num development build.
 */
export function resolveHealthConnector(): HealthConnector {
  return new DemoHealthConnector();
}

/** Lista conectores para a UI (priming JIT — docs/08 §9.2). */
export function listHealthConnectors(): HealthConnector[] {
  const demo = new DemoHealthConnector();
  if (Platform.OS === 'android') {
    return [demo, new NativeHealthConnectorStub('health_connect', 'Health Connect')];
  }
  if (Platform.OS === 'ios') {
    return [demo, new NativeHealthConnectorStub('healthkit', 'HealthKit')];
  }
  return [demo];
}
