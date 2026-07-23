import type { HealthConnector, HealthPermission, HealthPullResult } from './health.connector';

/**
 * Stub do adapter nativo (docs/08 §10.3).
 * Health Connect / HealthKit exigem **dev client** (não rodam no Expo Go).
 * Quando o prebuild existir, trocar o corpo por `react-native-health-connect`
 * / HealthKit mantendo esta mesma porta.
 */
export class NativeHealthConnectorStub implements HealthConnector {
  constructor(
    readonly id: 'health_connect' | 'healthkit',
    readonly label: string,
  ) {}

  async isAvailable(): Promise<boolean> {
    return false;
  }

  async requestPermissions(_kinds: HealthPermission[]): Promise<{ granted: boolean }> {
    return { granted: false };
  }

  async pullSince(_since: string, _until?: string): Promise<HealthPullResult> {
    throw new Error(
      `${this.label} requer um development build (expo-dev-client). ` +
        'No Expo Go use o conector Demo. Ver docs/08 §10.3 e docs/31.',
    );
  }
}
