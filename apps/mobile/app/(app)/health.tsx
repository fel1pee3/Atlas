import { useCallback, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import type { HealthConnector } from '../../src/features/health/health.connector';
import {
  listHealthConnectors,
  resolveHealthConnector,
} from '../../src/features/health/resolve-connector';
import {
  enableHealth,
  disableHealth,
  isHealthEnabled,
  getActiveConnectorId,
  syncHealthNow,
} from '../../src/features/health/health.service';
import { colors, spacing, radius, font } from '../../src/theme';

/**
 * Conector de saúde (docs/08 §9–§10, docs/20 M2).
 * Health Connect no development build; Demo só em __DEV__.
 */
export default function HealthScreen() {
  const [connectors, setConnectors] = useState<HealthConnector[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [lastImport, setLastImport] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setConnectors(listHealthConnectors());
    setEnabled(await isHealthEnabled());
    setActiveId(await getActiveConnectorId());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  async function onConnect(connector: HealthConnector) {
    const available = await connector.isAvailable();
    if (!available) {
      Alert.alert(
        'Fonte indisponível',
        connector.id === 'demo'
          ? 'Demo só aparece em builds de desenvolvimento.'
          : connector.id === 'health_connect'
            ? 'Instale o Health Connect e abra o Atlas pelo development build (não Expo Go).'
            : `${connector.label} ainda não está disponível neste dispositivo.`,
      );
      return;
    }

    const message =
      connector.id === 'demo'
        ? 'Modo Demo: dados sintéticos só para desenvolvimento local.'
        : 'O Atlas lê sono e passos reais do Health Connect para montar sua timeline e insights privados.';

    Alert.alert('Conectar saúde', message, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Continuar',
        onPress: () => {
          void (async () => {
            setBusy(true);
            try {
              const { granted } = await enableHealth(connector);
              if (!granted) {
                Alert.alert('Permissão negada', 'Nada foi alterado.');
                return;
              }
              const result = await syncHealthNow(connector);
              setLastImport(`${result.imported} eventos importados`);
              await refresh();
            } catch (err) {
              Alert.alert('Falha na sync', err instanceof Error ? err.message : 'Erro desconhecido');
            } finally {
              setBusy(false);
            }
          })();
        },
      },
    ]);
  }

  async function onSync() {
    setBusy(true);
    try {
      const connector =
        connectors.find((c) => c.id === activeId) ?? resolveHealthConnector();
      const result = await syncHealthNow(connector);
      setLastImport(`${result.imported} novos eventos`);
      await refresh();
    } catch (err) {
      Alert.alert('Falha na sync', err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setBusy(false);
    }
  }

  async function onDisable() {
    await disableHealth();
    await refresh();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Saúde</Text>
      <Text style={styles.lead}>
        Conecte Health Connect para importar sono e passos reais. Use um development build (não
        Expo Go).
      </Text>

      {connectors.map((c) => (
        <View key={c.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{c.label}</Text>
            {activeId === c.id && enabled ? (
              <Text style={styles.badge}>ativo</Text>
            ) : null}
          </View>
          <Text style={styles.cardMeta}>
            id: {c.id}
            {c.id === 'demo' ? ' · somente __DEV__' : ''}
          </Text>
          <Pressable
            style={[styles.button, busy && styles.buttonDisabled]}
            disabled={busy}
            onPress={() => void onConnect(c)}
          >
            <Text style={styles.buttonText}>
              {activeId === c.id && enabled ? 'Reconectar / atualizar' : 'Conectar'}
            </Text>
          </Pressable>
        </View>
      ))}

      {enabled ? (
        <View style={styles.actions}>
          <Pressable
            style={[styles.buttonSecondary, busy && styles.buttonDisabled]}
            disabled={busy}
            onPress={() => void onSync()}
          >
            <Text style={styles.buttonSecondaryText}>Sincronizar agora</Text>
          </Pressable>
          <Pressable style={styles.link} onPress={() => void onDisable()} disabled={busy}>
            <Text style={styles.linkText}>Desativar conector</Text>
          </Pressable>
        </View>
      ) : null}

      {busy ? <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} /> : null}
      {lastImport ? <Text style={styles.footer}>{lastImport}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  title: { color: colors.text, fontSize: font.size.xl, fontWeight: font.weight.semibold },
  lead: { color: colors.textMuted, fontSize: font.size.md, lineHeight: 22 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { color: colors.text, fontSize: font.size.lg, fontWeight: font.weight.semibold },
  badge: { color: colors.success, fontSize: font.size.sm },
  cardMeta: { color: colors.textMuted, fontSize: font.size.sm },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.primaryText, fontWeight: font.weight.semibold },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
  buttonSecondary: {
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  buttonSecondaryText: { color: colors.text, fontWeight: font.weight.medium },
  link: { alignItems: 'center', padding: spacing.sm },
  linkText: { color: colors.textMuted },
  footer: { color: colors.textMuted, fontSize: font.size.sm, textAlign: 'center' },
});
