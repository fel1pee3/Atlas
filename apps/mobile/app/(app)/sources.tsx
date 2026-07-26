import { useCallback, useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
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
  SectionTitle,
  EntryRow,
  Hairline,
  pagePad,
} from '../../src/ui';

/**
 * Fontes M4: Location + Calendar (docs/20 §5, docs/08 §10).
 */
export default function SourcesScreen() {
  const [locConnectors, setLocConnectors] = useState<LocationConnector[]>([]);
  const [calConnectors, setCalConnectors] = useState<CalendarConnector[]>([]);
  const [locEnabled, setLocEnabled] = useState(false);
  const [calEnabled, setCalEnabled] = useState(false);
  const [locActive, setLocActive] = useState<string | null>(null);
  const [calActive, setCalActive] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

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

  function primingThen(title: string, message: string, onContinue: () => Promise<void>) {
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Continuar',
        onPress: () => {
          void (async () => {
            setBusy(true);
            try {
              await onContinue();
              await refresh();
            } catch (err) {
              Alert.alert('Falha', err instanceof Error ? err.message : 'Erro');
            } finally {
              setBusy(false);
            }
          })();
        },
      },
    ]);
  }

  function onConnectLocation(c: LocationConnector) {
    void (async () => {
      if (!(await c.isAvailable())) {
        Alert.alert(
          'Fonte indisponível',
          'Localização do aparelho precisa da versão de desenvolvimento do Atlas.',
        );
        return;
      }
      primingThen(
        'Conectar localização',
        c.id === 'demo'
          ? 'Demo: visitas de exemplo só para testar no desenvolvimento.'
          : 'O Atlas registra lugares visitados — não um rastro contínuo de GPS.',
        async () => {
          const { granted } = await enableLocation(c);
          if (!granted) {
            Alert.alert('Permissão negada', 'Nada foi alterado.');
            return;
          }
          const r = await syncLocationNow(c);
          setStatus(
            r.imported === 1
              ? 'Localização: 1 visita nova'
              : `Localização: ${r.imported} visitas novas`,
          );
        },
      );
    })();
  }

  function onConnectCalendar(c: CalendarConnector) {
    void (async () => {
      if (!(await c.isAvailable())) {
        Alert.alert(
          'Agenda indisponível',
          c.id === 'google_calendar'
            ? 'Google Agenda ainda não está configurada neste build. Prefira “Calendário do aparelho”.'
            : `${calendarLabel(c)} ainda não está disponível neste aparelho.`,
        );
        return;
      }
      const message =
        c.id === 'demo'
          ? 'Demo: agenda de exemplo só para testar no desenvolvimento.'
          : c.id === 'device_calendar'
            ? 'O Atlas lê os compromissos já salvos na agenda do celular, sem login extra.'
            : 'O Atlas lê compromissos com login na Google Agenda (opcional).';
      primingThen('Conectar agenda', message, async () => {
        const { granted } = await enableCalendar(c);
        if (!granted) {
          Alert.alert('Permissão negada', 'Nada foi alterado.');
          return;
        }
        const r = await syncCalendarNow(c);
        setStatus(
          r.imported === 1
            ? 'Agenda: 1 compromisso novo'
            : `Agenda: ${r.imported} compromissos novos`,
        );
      });
    })();
  }

  return (
    <Screen padded={false} safe={false}>
      <ScrollView contentContainerStyle={styles.container}>
        <PageHeader
          title="Espaço & agenda"
          lead="Onde você esteve e o que estava marcado. Preferência: calendário do aparelho."
        />

        <SectionTitle>Localização</SectionTitle>
        {locConnectors.map((c, index) => (
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
                busy={busy}
                style={styles.btn}
              />
            </EntryRow>
          </View>
        ))}
        {locEnabled ? (
          <View style={styles.actions}>
            <Button
              variant="secondary"
              label="Atualizar localização"
              disabled={busy}
              onPress={() => {
                void (async () => {
                  setBusy(true);
                  try {
                    const r = await syncLocationNow(
                      locConnectors.find((x) => x.id === locActive) ?? resolveLocationConnector(),
                    );
                    setStatus(
                      r.imported === 1
                        ? 'Localização: 1 visita nova'
                        : `Localização: ${r.imported} visitas novas`,
                    );
                  } finally {
                    setBusy(false);
                  }
                })();
              }}
            />
            <Button
              variant="ghost"
              label="Desconectar localização"
              onPress={() => void disableLocation().then(refresh)}
            />
          </View>
        ) : null}

        <SectionTitle>Agenda</SectionTitle>
        {calConnectors.map((c, index) => (
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
                busy={busy}
                style={styles.btn}
              />
            </EntryRow>
          </View>
        ))}
        {calEnabled ? (
          <View style={styles.actions}>
            <Button
              variant="secondary"
              label="Atualizar agenda"
              disabled={busy}
              onPress={() => {
                void (async () => {
                  setBusy(true);
                  try {
                    const r = await syncCalendarNow(
                      calConnectors.find((x) => x.id === calActive) ?? resolveCalendarConnector(),
                    );
                    setStatus(
                      r.imported === 1
                        ? 'Agenda: 1 compromisso novo'
                        : `Agenda: ${r.imported} compromissos novos`,
                    );
                  } finally {
                    setBusy(false);
                  }
                })();
              }}
            />
            <Button
              variant="ghost"
              label="Desconectar agenda"
              onPress={() => void disableCalendar().then(refresh)}
            />
          </View>
        ) : null}

        {busy ? <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} /> : null}
        {status ? <Caption style={styles.footer}>{status}</Caption> : null}
      </ScrollView>
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
  if (c.id === 'google_calendar') return 'Google Agenda';
  if (c.id === 'apple_calendar') return 'Calendário Apple';
  return c.label.replace(/\(__DEV__ only\)/i, '(só desenvolvimento)');
}

const styles = StyleSheet.create({
  container: { ...pagePad },
  name: { marginTop: 2, marginBottom: spacing.sm, color: colors.text },
  btn: { marginTop: spacing.xs },
  actions: { gap: spacing.sm, marginTop: spacing.sm, marginBottom: spacing.sm },
  footer: { marginTop: spacing.md },
});
