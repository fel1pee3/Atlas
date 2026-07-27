import { resolveLocationConnector } from '../../src/features/location/resolve-connector';
import { enableLocation, syncLocationNow } from '../../src/features/location/location.service';
import { syncNow } from '../../src/features/sync/sync.service';
import { ConnectSourceScreen } from '../../src/features/onboarding/ConnectSourceScreen';

/**
 * Onboarding — conectar lugares (passo 3/3).
 */
export default function OnboardingConnectLocation() {
  const connector = resolveLocationConnector();
  const ctaLabel =
    connector.id === 'device_location' ? 'Permitir localização' : `Conectar ${connector.label}`;

  return (
    <ConnectSourceScreen
      kind="location"
      ctaLabel={ctaLabel}
      onConnect={async () => {
        if (!(await connector.isAvailable())) {
          throw new Error(
            'Localização do aparelho precisa da versão de desenvolvimento do Atlas.',
          );
        }
        const { granted } = await enableLocation(connector);
        if (!granted) {
          throw new Error('Permissão negada. Nada foi alterado.');
        }
        await syncLocationNow(connector);
        void syncNow().catch(() => undefined);
      }}
    />
  );
}
