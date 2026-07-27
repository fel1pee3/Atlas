import { resolveCalendarConnector } from '../../src/features/calendar/resolve-connector';
import { enableCalendar, syncCalendarNow } from '../../src/features/calendar/calendar.service';
import { syncNow } from '../../src/features/sync/sync.service';
import { ConnectSourceScreen } from '../../src/features/onboarding/ConnectSourceScreen';

/**
 * Onboarding — conectar agenda (passo 2/3).
 */
export default function OnboardingConnectCalendar() {
  const connector = resolveCalendarConnector();
  const ctaLabel =
    connector.id === 'device_calendar'
      ? 'Conectar calendário do aparelho'
      : `Conectar ${connector.label}`;

  return (
    <ConnectSourceScreen
      kind="calendar"
      ctaLabel={ctaLabel}
      onConnect={async () => {
        if (!(await connector.isAvailable())) {
          throw new Error(
            `${ctaLabel.replace('Conectar ', '')} ainda não está disponível neste aparelho.`,
          );
        }
        const { granted } = await enableCalendar(connector);
        if (!granted) {
          throw new Error('Permissão negada. Nada foi alterado.');
        }
        await syncCalendarNow(connector);
        void syncNow().catch(() => undefined);
      }}
    />
  );
}
