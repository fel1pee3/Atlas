import { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import type { LocationConnector } from '../../src/features/location/location.connector';
import {
  listLocationConnectors,
  resolveLocationConnector,
} from '../../src/features/location/resolve-connector';
import {
  enableLocation,
  disableLocation,
  isLocationEnabled,
  getActiveLocationConnectorId,
  syncLocationNow,
} from '../../src/features/location/location.service';
import type { CalendarConnector } from '../../src/features/calendar/calendar.connector';
import {
  listCalendarConnectors,
  resolveCalendarConnector,
} from '../../src/features/calendar/resolve-connector';
import {
  enableCalendar,
  disableCalendar,
  isCalendarEnabled,
  getActiveCalendarConnectorId,
  syncCalendarNow,
} from '../../src/features/calendar/calendar.service';
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

type BusyKey =
  | `loc:connect:${string}`
  | 'loc:sync'
  | 'loc:disable'
  | `cal:connect:${string}`
  | 'cal:sync'
  | 'cal:disable';

type Notice = { title: string; message: string };

/**
 * Fontes M4: Location + Calendar (docs/20 §5, docs/08 §10).
 * Conectar vai direto à permissão do SO — sem priming duplicado do Atlas.
 */
export default function SourcesScreen() {
  const [locConnectors, setLocConnectors] = useState<LocationConnector[]>([]);
  const [calConnectors, setCalConnectors] = useState<CalendarConnector[]>([]);
  const [locEnabled, setLocEnabled] = useState(false);
  const [calEnabled, setCalEnabled] = useState(false);
  const [locActive, setLocActive] = useState<string | null>(null);
  const [calActive, setCalActive] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<BusyKey | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const locked = busyKey !== null;

  const refresh = useCallback(async () => {
    setLocConnectors(listLocationConnectors());
    setCalConnectors(listCalendarConnectors());
    setLocEnabled(await isLocationEnabled());
    setCalEnabled(await isCalendarEnabled());
    setLocActive(await getActiveLocationConnectorId());
    setCalActive(await getActiveCalendarConnectorId());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  function runBusy(key: BusyKey, work: () => Promise<void>) {
    void (async () => {
      setBusyKey(key);
      try {
        await work();
        await refresh();
      } catch (err) {
        setNotice({
          title: 'Falha',
          message: err instanceof Error ? err.message : 'Erro',
        });
      } finally {
        setBusyKey(null);
      }
    })();
  }

  function onConnectLocation(c: LocationConnector) {
    void (async () => {
      if (!(await c.isAvailable())) {
        setNotice({
          title: 'Fonte indisponível',
          message: 'Localização do aparelho precisa da versão de desenvolvimento do Atlas.',
        });
        return;
      }
      runBusy(`loc:connect:${c.id}`, async () => {
        const { granted } = await enableLocation(c);
        if (!granted) {
          setStatus('Localização: permissão não concedida.');
          return;
        }
        const r = await syncLocationNow(c);
        setStatus(formatLocationStatus(r));
      });
    })();
  }

  function onConnectCalendar(c: CalendarConnector) {
    void (async () => {
      if (!(await c.isAvailable())) {
        setNotice({
          title: 'Agenda indisponível',
          message: `${calendarLabel(c)} ainda não está disponível neste aparelho.`,
        });
        return;
      }
      runBusy(`cal:connect:${c.id}`, async () => {
        const { granted } = await enableCalendar(c);
        if (!granted) {
          setStatus('Agenda: permissão não concedida.');
          return;
        }
        const r = await syncCalendarNow(c);
        setStatus(formatCalendarStatus(r));
      });
    })();
  }

  return (
    <Screen padded={false} safe={false}>
      <ScrollView contentContainerStyle={styles.container}>
        <PageHeader
          title="Fontes"
          lead="Lugares e agenda do celular. O Atlas atualiza sozinho ao abrir o app."
        />

        {locConnectors.map((c, index) => {
          const key: BusyKey = `loc:connect:${c.id}`;
          return (
            <View key={c.id}>
              {index > 0 ? <Hairline /> : null}
              <EntryRow
                kind={c.id === 'demo' ? 'Demo' : 'Lugares'}
                meta={c.id === 'demo' ? 'dados de exemplo' : 'visitas'}
                trailing={locActive === c.id && locEnabled ? 'ativo' : undefined}
              >
                <Caption style={styles.name}>{locationLabel(c)}</Caption>
                <Button
                  label={locActive === c.id && locEnabled ? 'Atualizar' : 'Conectar'}
                  onPress={() => onConnectLocation(c)}
                  busy={busyKey === key}
                  disabled={locked && busyKey !== key}
                  style={styles.btn}
                />
              </EntryRow>
            </View>
          );
        })}
        {locEnabled ? (
          <View style={styles.actions}>
            <Button
              variant="secondary"
              label="Atualizar localização"
              busy={busyKey === 'loc:sync'}
              disabled={locked && busyKey !== 'loc:sync'}
              onPress={() =>
                runBusy('loc:sync', async () => {
                  const r = await syncLocationNow(
                    locConnectors.find((x) => x.id === locActive) ?? resolveLocationConnector(),
                  );
                  setStatus(formatLocationStatus(r));
                })
              }
            />
            <Button
              variant="ghost"
              label="Desconectar localização"
              busy={busyKey === 'loc:disable'}
              disabled={locked && busyKey !== 'loc:disable'}
              onPress={() => runBusy('loc:disable', () => disableLocation())}
            />
          </View>
        ) : null}

        {calConnectors.map((c, index) => {
          const key: BusyKey = `cal:connect:${c.id}`;
          return (
            <View key={c.id}>
              {index > 0 ? <Hairline /> : null}
              <EntryRow
                kind={c.id === 'demo' ? 'Demo' : 'Agenda'}
                meta={c.id === 'demo' ? 'dados de exemplo' : 'compromissos'}
                trailing={calActive === c.id && calEnabled ? 'ativo' : undefined}
              >
                <Caption style={styles.name}>{calendarLabel(c)}</Caption>
                <Button
                  label={calActive === c.id && calEnabled ? 'Atualizar' : 'Conectar'}
                  onPress={() => onConnectCalendar(c)}
                  busy={busyKey === key}
                  disabled={locked && busyKey !== key}
                  style={styles.btn}
                />
              </EntryRow>
            </View>
          );
        })}
        {calEnabled ? (
          <View style={styles.actions}>
            <Button
              variant="secondary"
              label="Atualizar agenda"
              busy={busyKey === 'cal:sync'}
              disabled={locked && busyKey !== 'cal:sync'}
              onPress={() =>
                runBusy('cal:sync', async () => {
                  const r = await syncCalendarNow(
                    calConnectors.find((x) => x.id === calActive) ?? resolveCalendarConnector(),
                  );
                  setStatus(formatCalendarStatus(r));
                })
              }
            />
            <Button
              variant="ghost"
              label="Desconectar agenda"
              busy={busyKey === 'cal:disable'}
              disabled={locked && busyKey !== 'cal:disable'}
              onPress={() => runBusy('cal:disable', () => disableCalendar())}
            />
          </View>
        ) : null}

        {status ? <Caption style={styles.footer}>{status}</Caption> : null}
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

function locationLabel(c: LocationConnector): string {
  if (c.id === 'demo') return 'Demo (só desenvolvimento)';
  if (c.id === 'device_location') return 'Localização do aparelho';
  return c.label.replace(/device/gi, 'aparelho').replace(/\(__DEV__ only\)/i, '(só desenvolvimento)');
}

function calendarLabel(c: CalendarConnector): string {
  if (c.id === 'demo') return 'Demo (só desenvolvimento)';
  if (c.id === 'device_calendar') return 'Calendário do aparelho';
  return c.label.replace(/\(__DEV__ only\)/i, '(só desenvolvimento)');
}

function formatLocationStatus(r: Awaited<ReturnType<typeof syncLocationNow>>): string {
  const place = r.reading?.label?.trim();
  const coords =
    r.reading != null
      ? `${r.reading.lat.toFixed(5)}, ${r.reading.lng.toFixed(5)}`
      : null;
  const accuracy =
    r.reading?.accuracyM != null ? ` (±${r.reading.accuracyM} m)` : '';
  const where = place ? `${place}${accuracy}` : coords ? `${coords}${accuracy}` : 'posição lida';
  if (r.imported > 0) {
    return `Localização: ${where} · ${r.imported === 1 ? '1 visita nova' : `${r.imported} visitas novas`}`;
  }
  return `Localização: ${where} · já registrada (nada novo)`;
}

function formatCalendarStatus(r: Awaited<ReturnType<typeof syncCalendarNow>>): string {
  const sample = r.titles.length > 0 ? ` · ex.: ${r.titles.slice(0, 3).join('; ')}` : '';
  if (r.imported > 0) {
    return `Agenda: ${r.imported} novo(s) de ${r.pulled} lido(s)${sample}`;
  }
  return `Agenda: ${r.pulled} lido(s), nenhum novo${sample}`;
}

const styles = StyleSheet.create({
  container: { ...pagePad },
  name: { marginTop: 2, marginBottom: spacing.sm, color: colors.text },
  btn: { marginTop: spacing.xs },
  actions: { gap: spacing.sm, marginTop: spacing.sm, marginBottom: spacing.sm },
  footer: { marginTop: spacing.md },
});
