import { Platform } from 'react-native';
import { resolveHealthConnector } from '../../src/features/health/resolve-connector';
import { enableHealth, syncHealthNow } from '../../src/features/health/health.service';
import { syncNow } from '../../src/features/sync/sync.service';
import { ConnectSourceScreen } from '../../src/features/onboarding/ConnectSourceScreen';

/**
 * Onboarding — conectar saúde (passo 1/3).
 */
export default function OnboardingConnectHealth() {
  const connector = resolveHealthConnector();
  const ctaLabel =
    connector.id === 'health_connect'
      ? 'Conectar Health Connect'
      : connector.id === 'healthkit'
        ? 'Conectar HealthKit'
        : `Conectar ${connector.label}`;

  return (
    <ConnectSourceScreen
      kind="health"
      ctaLabel={ctaLabel}
      onConnect={async () => {
        const available = await connector.isAvailable();
        if (!available) {
          throw new Error(
            connector.id === 'health_connect'
              ? 'Instale o Health Connect e abra o Atlas pelo development build (não Expo Go).'
              : Platform.OS === 'ios'
                ? 'HealthKit ainda não está disponível neste build.'
                : `${connector.label} ainda não está disponível neste dispositivo.`,
          );
        }
        const { granted } = await enableHealth(connector);
        if (!granted) {
          throw new Error('Permissão negada. Nada foi alterado.');
        }
        await syncHealthNow(connector);
        void syncNow().catch(() => undefined);
      }}
    />
  );
}
