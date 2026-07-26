import { useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { resolveHealthConnector } from '../../src/features/health/resolve-connector';
import { enableHealth, syncHealthNow } from '../../src/features/health/health.service';
import { syncNow } from '../../src/features/sync/sync.service';
import { spacing } from '../../src/theme';
import { Screen, Button, PageHeader } from '../../src/ui';

/**
 * Conectar 1 fonte densa — Health Connect no Android (docs/20 §2.7).
 */
export default function OnboardingConnect() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const connectHealth = async () => {
    setBusy(true);
    try {
      const connector = resolveHealthConnector();
      const available = await connector.isAvailable();
      if (!available) {
        Alert.alert(
          'Fonte indisponível',
          connector.id === 'health_connect'
            ? 'Instale o Health Connect e abra o Atlas pelo development build (não Expo Go).'
            : `${connector.label} ainda não está disponível neste dispositivo.`,
        );
        return;
      }
      const { granted } = await enableHealth(connector);
      if (!granted) {
        Alert.alert('Permissão', 'Não foi possível ativar a fonte de saúde.');
        return;
      }
      const { imported } = await syncHealthNow(connector);
      void syncNow().catch(() => undefined);
      Alert.alert('Fonte conectada', `${imported} amostras importadas de ${connector.label}.`);
      router.push('/(onboarding)/aha');
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Falha ao conectar');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen style={styles.container} safe={false}>
      <PageHeader
        title="Conecte uma fonte"
        lead="Importe sono e passos reais (~30 dias) para ver a timeline e o primeiro insight com a sua vida."
      />
      <Button
        label="Conectar Health Connect"
        onPress={() => void connectHealth()}
        busy={busy}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', paddingVertical: spacing.lg, gap: spacing.md },
});
