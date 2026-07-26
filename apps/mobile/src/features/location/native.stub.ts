import type { LocationConnector, LocationPullResult } from './location.connector';

/**
 * Stub nativo (expo-location / geofencing) — docs/08 §10.1.
 * Ativa com permissões reais + background em development build.
 */
export class NativeLocationConnectorStub implements LocationConnector {
  readonly id = 'device_location' as const;
  readonly label = 'Localização do device';

  async isAvailable(): Promise<boolean> {
    return false;
  }

  async requestPermissions(): Promise<{ granted: boolean }> {
    return { granted: false };
  }

  async pullSince(_since: string, _until?: string): Promise<LocationPullResult> {
    throw new Error(
      'Este stub foi substituído por DeviceLocationConnector (expo-location).',
    );
  }
}
