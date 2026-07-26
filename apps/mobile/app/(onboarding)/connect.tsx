import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { resolveHealthConnector } from '../../src/features/health/resolve-connector';
import { enableHealth, syncHealthNow } from '../../src/features/health/health.service';
import { syncNow } from '../../src/features/sync/sync.service';
import { colors, spacing, radius, font } from '../../src/theme';

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
    <View style={styles.container}>
      <Text style={styles.title}>Conecte uma fonte</Text>
      <Text style={styles.body}>
        Conecte o Health Connect para importar sono e passos reais (~30 dias) e ver a timeline e o
        primeiro insight com a sua vida — não com dados fictícios.
      </Text>

      <Pressable style={styles.primary} onPress={() => void connectHealth()} disabled={busy}>
        {busy ? (
          <ActivityIndicator color={colors.primaryText} />
        ) : (
          <Text style={styles.primaryText}>Conectar Health Connect</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  title: {
    color: colors.text,
    fontSize: font.size.xl,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  body: {
    color: colors.textMuted,
    fontSize: font.size.md,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  primary: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  primaryText: { color: colors.primaryText, fontWeight: '600' },
});
