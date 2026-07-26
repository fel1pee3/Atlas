import { Platform } from 'react-native';
import * as Location from 'expo-location';
import type { LocationConnector, LocationPullResult, LocationSample } from './location.connector';

/**
 * Localização do aparelho via expo-location (docs/08 §10.1).
 * MVP: visita discreta (posição atual) — não GPS contínuo.
 */
export class DeviceLocationConnector implements LocationConnector {
  readonly id = 'device_location' as const;
  readonly label = 'Localização do aparelho';

  async isAvailable(): Promise<boolean> {
    return Platform.OS === 'android' || Platform.OS === 'ios';
  }

  async requestPermissions(): Promise<{ granted: boolean }> {
    if (!(await this.isAvailable())) return { granted: false };
    const { status } = await Location.requestForegroundPermissionsAsync();
    return { granted: status === Location.PermissionStatus.GRANTED };
  }

  async pullSince(since: string, _until?: string): Promise<LocationPullResult> {
    if (!(await this.isAvailable())) {
      throw new Error(
        'Localização nativa requer development build + expo-location (não Expo Go puro).',
      );
    }

    const permission = await Location.getForegroundPermissionsAsync();
    if (permission.status !== Location.PermissionStatus.GRANTED) {
      throw new Error('Permissão de localização não concedida.');
    }

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const occurredAt = new Date(pos.timestamp).toISOString();
    const nextCursor = new Date().toISOString();

    if (occurredAt <= since) {
      return { samples: [], nextCursor };
    }

    let label: string | undefined;
    try {
      const places = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      const p = places[0];
      if (p) {
        label = [p.name, p.street, p.city, p.region].filter(Boolean).join(', ') || undefined;
      }
    } catch {
      // reverse geocode is best-effort
    }

    const lat = Number(pos.coords.latitude.toFixed(5));
    const lng = Number(pos.coords.longitude.toFixed(5));
    const day = occurredAt.slice(0, 10);
    const sample: LocationSample = {
      externalId: `device:visit:${day}:${lat},${lng}`,
      type: 'location.visited',
      occurredAt,
      payload: {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        label,
        arrivedAt: occurredAt,
      },
    };

    return { samples: [sample], nextCursor };
  }
}
