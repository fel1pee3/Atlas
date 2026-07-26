import { useCallback, useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
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
import { colors, spacing } from '../../src/theme';
import {
  Screen,
  Caption,
  Button,
  PageHeader,
  EntryRow,
  Hairline,
  pagePad,
} from '../../src/ui';

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
          ? 'A demo só aparece em versões de desenvolvimento.'
          : connector.id === 'health_connect'
            ? 'Instale o app Health Connect e abra o Atlas pela versão de desenvolvimento (não pelo Expo Go).'
            : `${connectorLabel(connector)} ainda não está disponível neste aparelho.`,
      );
      return;
    }

    const message =
      connector.id === 'demo'
        ? 'Demo: dados de exemplo só para testar o app no desenvolvimento.'
        : 'O Atlas lê sono e passos do Health Connect para montar sua timeline e insights. Os dados ficam privados.';

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
              setLastImport(
                result.imported === 1
                  ? '1 registro importado'
                  : `${result.imported} registros importados`,
              );
              await refresh();
            } catch (err) {
              Alert.alert(
                'Não foi possível atualizar',
                err instanceof Error ? err.message : 'Tente de novo em instantes.',
              );
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
      setLastImport(
        result.imported === 1
          ? '1 registro novo'
          : `${result.imported} registros novos`,
      );
      await refresh();
    } catch (err) {
      Alert.alert(
        'Não foi possível atualizar',
        err instanceof Error ? err.message : 'Tente de novo em instantes.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function onDisable() {
    await disableHealth();
    await refresh();
  }

  return (
    <Screen padded={false} safe={false}>
      <ScrollView contentContainerStyle={styles.container}>
        <PageHeader
          title="Saúde"
          lead="Importe sono e passos do Health Connect para preencher a timeline."
        />

        {connectors.map((c, index) => (
          <View key={c.id}>
            {index > 0 ? <Hairline /> : null}
            <EntryRow
              kind={c.id === 'demo' ? 'Demo' : 'Sono e passos'}
              meta={
                c.id === 'demo'
                  ? 'dados de exemplo'
                  : c.id === 'health_connect'
                    ? 'Android'
                    : c.id === 'healthkit'
                      ? 'iPhone'
                      : undefined
              }
              trailing={activeId === c.id && enabled ? 'ativo' : undefined}
            >
              <Caption style={styles.connectorName}>{connectorLabel(c)}</Caption>
              <Button
                label={activeId === c.id && enabled ? 'Atualizar' : 'Conectar'}
                onPress={() => void onConnect(c)}
                busy={busy}
                style={styles.actionBtn}
              />
            </EntryRow>
          </View>
        ))}

        {enabled ? (
          <View style={styles.actions}>
            <Hairline />
            <Button
              variant="secondary"
              label="Atualizar agora"
              onPress={() => void onSync()}
              disabled={busy}
              style={styles.actionBtn}
            />
            <Button
              variant="ghost"
              label="Desconectar"
              onPress={() => void onDisable()}
              disabled={busy}
            />
          </View>
        ) : null}

        {busy ? <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} /> : null}
        {lastImport ? <Caption style={styles.footer}>{lastImport}</Caption> : null}
      </ScrollView>
    </Screen>
  );
}

function connectorLabel(c: HealthConnector): string {
  if (c.id === 'demo') return 'Demo (só desenvolvimento)';
  if (c.id === 'health_connect') return 'Health Connect';
  if (c.id === 'healthkit') return 'Apple Saúde';
  return c.label;
}

const styles = StyleSheet.create({
  container: { ...pagePad },
  connectorName: {
    marginTop: 2,
    marginBottom: spacing.sm,
    color: colors.text,
  },
  actions: { marginTop: spacing.md, gap: spacing.sm },
  actionBtn: { marginTop: spacing.sm },
  footer: { marginTop: spacing.md },
});
