/**
 * Porta do conector de saúde (docs/08 §10.3, docs/11 §4 adapters).
 * Normaliza amostras do SO → eventos canônicos Atlas.
 * Implementações: Demo (Expo Go), Health Connect / HealthKit (dev client).
 */

export type HealthPermission = 'sleep' | 'steps';

export interface HealthSample {
  /** Id estável da amostra na origem — vira externalId (idempotência). */
  externalId: string;
  type: 'sleep.recorded' | 'activity.steps' | 'activity.workout';
  occurredAt: string; // ISO
  payload: Record<string, unknown>;
}

export interface HealthPullResult {
  samples: HealthSample[];
  /** Cursor opaco para próxima leitura incremental (ISO date ou âncora nativa). */
  nextCursor: string;
}

export interface HealthConnector {
  readonly id: 'demo' | 'health_connect' | 'healthkit';
  readonly label: string;
  /** True se o runtime atual pode usar este conector. */
  isAvailable(): Promise<boolean>;
  requestPermissions(kinds: HealthPermission[]): Promise<{ granted: boolean }>;
  /**
   * Lê histórico incremental desde `since` (ISO day ou instante).
   * Preferir pull a listener contínuo (docs/08 §8.3).
   */
  pullSince(since: string, until?: string): Promise<HealthPullResult>;
}
