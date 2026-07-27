/**
 * Porta do conector de localização (docs/08 §10.1, docs/20 M4).
 * Preferir visitas discretas (stay points) a GPS contínuo.
 */

export interface LocationSample {
  externalId: string;
  type: 'location.visited';
  occurredAt: string;
  payload: {
    lat: number;
    lng: number;
    /** Raio de incerteza do GPS (metros), se o SO informar. */
    accuracyM?: number;
    label?: string;
    arrivedAt?: string;
    leftAt?: string;
  };
}

export interface LocationPullResult {
  samples: LocationSample[];
  nextCursor: string;
}

export interface LocationConnector {
  readonly id: 'demo' | 'device_location';
  readonly label: string;
  isAvailable(): Promise<boolean>;
  requestPermissions(): Promise<{ granted: boolean }>;
  pullSince(since: string, until?: string): Promise<LocationPullResult>;
}
