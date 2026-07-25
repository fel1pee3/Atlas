import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { DemoHealthConnector } from '../../src/features/health/demo.connector';
import { enableHealth, syncHealthNow } from '../../src/features/health/health.service';
import { syncNow } from '../../src/features/sync/sync.service';
import { colors, spacing, radius, font } from '../../src/theme';

/**
 * Conectar 1 fonte densa — Demo Saúde no Expo Go (docs/20 §2.7).
 */
export default function OnboardingConnect() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const connectDemo = async () => {
    setBusy(true);
    try {
      const connector = new DemoHealthConnector();
      const { granted } = await enableHealth(connector);
      if (!granted) {
        Alert.alert('Permissão', 'Não foi possível ativar o Demo de saúde.');
        return;
      }
      const { imported } = await syncHealthNow(connector);
      // Sync remoto em background (syncHealthNow já dispara push). Não bloquear o aha.
      void syncNow().catch(() => undefined);
      Alert.alert('Fonte conectada', `${imported} amostras Demo importadas.`);
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
        No Expo Go usamos o Demo de Saúde: ~30 dias de sono e atividade sintéticos para você
        ver a timeline e o primeiro insight agora.
      </Text>

      <Pressable style={styles.primary} onPress={() => void connectDemo()} disabled={busy}>
        {busy ? (
          <ActivityIndicator color={colors.primaryText} />
        ) : (
          <Text style={styles.primaryText}>Conectar Demo Saúde</Text>
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
