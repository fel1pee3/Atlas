import { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
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
  AppDialog,
} from '../../src/ui';

type BusyKey = `connect:${string}` | 'sync' | 'disable';

type Notice = { title: string; message: string };

/**
 * Conector de saúde (docs/08 §9–§10, docs/20 M2).
 * Conectar vai direto à permissão do SO / Health Connect — sem priming Atlas.
 */
export default function HealthScreen() {
  const [connectors, setConnectors] = useState<HealthConnector[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<BusyKey | null>(null);
  const [lastImport, setLastImport] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const locked = busyKey !== null;

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
      setNotice({
        title: 'Fonte indisponível',
        message:
          connector.id === 'demo'
            ? 'A demo só aparece em versões de desenvolvimento.'
            : connector.id === 'health_connect'
              ? 'Instale o app Health Connect e abra o Atlas pela versão de desenvolvimento (não pelo Expo Go).'
              : `${connectorLabel(connector)} ainda não está disponível neste aparelho.`,
      });
      return;
    }

    const key: BusyKey = `connect:${connector.id}`;
    setBusyKey(key);
    try {
      const { granted } = await enableHealth(connector);
      if (!granted) {
        setLastImport('Permissão não concedida.');
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
      setNotice({
        title: 'Não foi possível atualizar',
        message: err instanceof Error ? err.message : 'Tente de novo em instantes.',
      });
    } finally {
      setBusyKey(null);
    }
  }

  async function onSync() {
    setBusyKey('sync');
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
      setNotice({
        title: 'Não foi possível atualizar',
        message: err instanceof Error ? err.message : 'Tente de novo em instantes.',
      });
    } finally {
      setBusyKey(null);
    }
  }

  async function onDisable() {
    setBusyKey('disable');
    try {
      await disableHealth();
      await refresh();
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <Screen padded={false} safe={false}>
      <ScrollView contentContainerStyle={styles.container}>
        <PageHeader
          title="Saúde"
          lead="Sono e passos do Health Connect. O Atlas atualiza sozinho ao abrir o app."
        />

        {connectors.map((c, index) => {
          const key: BusyKey = `connect:${c.id}`;
          return (
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
                  busy={busyKey === key}
                  disabled={locked && busyKey !== key}
                  style={styles.actionBtn}
                />
              </EntryRow>
            </View>
          );
        })}

        {enabled ? (
          <View style={styles.actions}>
            <Hairline />
            <Button
              variant="secondary"
              label="Atualizar agora"
              onPress={() => void onSync()}
              busy={busyKey === 'sync'}
              disabled={locked && busyKey !== 'sync'}
              style={styles.actionBtn}
            />
            <Button
              variant="ghost"
              label="Desconectar"
              onPress={() => void onDisable()}
              busy={busyKey === 'disable'}
              disabled={locked && busyKey !== 'disable'}
            />
          </View>
        ) : null}

        {lastImport ? <Caption style={styles.footer}>{lastImport}</Caption> : null}
      </ScrollView>

      <AppDialog
        visible={notice != null}
        title={notice?.title ?? ''}
        message={notice?.message}
        onDismiss={() => setNotice(null)}
      />
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
