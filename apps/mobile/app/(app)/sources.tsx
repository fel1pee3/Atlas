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
import { colors, spacing, radius, font } from '../../src/theme';

/**
 * Fontes M4: Location + Calendar (docs/20 §5, docs/08 §10).
 * Dados reais via expo-location + calendário do aparelho (expo-calendar).
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

  function primingThen(
    title: string,
    message: string,
    onContinue: () => Promise<void>,
  ) {
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
          'Localização nativa requer development build com expo-location.',
        );
        return;
      }
      primingThen(
        'Conectar localização',
        c.id === 'demo'
          ? 'Demo: visitas sintéticas só para desenvolvimento.'
          : 'O Atlas registra visitas (lugares), não um rastro contínuo de GPS.',
        async () => {
          const { granted } = await enableLocation(c);
          if (!granted) {
            Alert.alert('Permissão negada', 'Nada foi alterado.');
            return;
          }
          const r = await syncLocationNow(c);
          setStatus(`Local: ${r.imported} importados`);
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
            ? 'Google Calendar precisa de Client ID no app.json (opcional). Prefira “Calendário do aparelho”.'
            : `${c.label} ainda não está disponível neste dispositivo.`,
        );
        return;
      }
      const message =
        c.id === 'demo'
          ? 'Demo: agenda sintética só para desenvolvimento.'
          : c.id === 'device_calendar'
            ? 'O Atlas lê os eventos já salvos na agenda do celular (Samsung, Google sync, etc.), sem login extra.'
            : 'O Atlas lê eventos via login Google (opcional).';
      primingThen('Conectar agenda', message, async () => {
        const { granted } = await enableCalendar(c);
        if (!granted) {
          Alert.alert('Permissão negada', 'Nada foi alterado.');
          return;
        }
        const r = await syncCalendarNow(c);
        setStatus(`Agenda: ${r.imported} importados`);
      });
    })();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Espaço & agenda</Text>
      <Text style={styles.lead}>
        Eixos de contexto: onde você esteve e o que estava na agenda do celular. Preferência:
        Calendário do aparelho (sem login Google).
      </Text>

      <Text style={styles.section}>Localização</Text>
      {locConnectors.map((c) => (
        <View key={c.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{c.label}</Text>
            {locActive === c.id && locEnabled ? <Text style={styles.badge}>ativo</Text> : null}
          </View>
          {c.id === 'demo' ? <Text style={styles.meta}>somente __DEV__</Text> : null}
          <Pressable
            style={[styles.button, busy && styles.disabled]}
            disabled={busy}
            onPress={() => onConnectLocation(c)}
          >
            <Text style={styles.buttonText}>
              {locActive === c.id && locEnabled ? 'Atualizar' : 'Conectar'}
            </Text>
          </Pressable>
        </View>
      ))}
      {locEnabled ? (
        <View style={styles.row}>
          <Pressable
            style={styles.secondary}
            disabled={busy}
            onPress={() => {
              void (async () => {
                setBusy(true);
                try {
                  const r = await syncLocationNow(
                    locConnectors.find((x) => x.id === locActive) ?? resolveLocationConnector(),
                  );
                  setStatus(`Local: ${r.imported} novos`);
                } finally {
                  setBusy(false);
                }
              })();
            }}
          >
            <Text style={styles.secondaryText}>Sync localização</Text>
          </Pressable>
          <Pressable onPress={() => void disableLocation().then(refresh)}>
            <Text style={styles.link}>Desativar</Text>
          </Pressable>
        </View>
      ) : null}

      <Text style={styles.section}>Calendário</Text>
      {calConnectors.map((c) => (
        <View key={c.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{c.label}</Text>
            {calActive === c.id && calEnabled ? <Text style={styles.badge}>ativo</Text> : null}
          </View>
          {c.id === 'demo' ? <Text style={styles.meta}>somente __DEV__</Text> : null}
          <Pressable
            style={[styles.button, busy && styles.disabled]}
            disabled={busy}
            onPress={() => onConnectCalendar(c)}
          >
            <Text style={styles.buttonText}>
              {calActive === c.id && calEnabled ? 'Atualizar' : 'Conectar'}
            </Text>
          </Pressable>
        </View>
      ))}
      {calEnabled ? (
        <View style={styles.row}>
          <Pressable
            style={styles.secondary}
            disabled={busy}
            onPress={() => {
              void (async () => {
                setBusy(true);
                try {
                  const r = await syncCalendarNow(
                    calConnectors.find((x) => x.id === calActive) ?? resolveCalendarConnector(),
                  );
                  setStatus(`Agenda: ${r.imported} novos`);
                } finally {
                  setBusy(false);
                }
              })();
            }}
          >
            <Text style={styles.secondaryText}>Sync agenda</Text>
          </Pressable>
          <Pressable onPress={() => void disableCalendar().then(refresh)}>
            <Text style={styles.link}>Desativar</Text>
          </Pressable>
        </View>
      ) : null}

      {busy ? <ActivityIndicator color={colors.primary} /> : null}
      {status ? <Text style={styles.footer}>{status}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xl },
  title: { color: colors.text, fontSize: font.size.xl, fontWeight: font.weight.semibold },
  lead: { color: colors.textMuted, fontSize: font.size.md, lineHeight: 22, marginBottom: spacing.sm },
  section: {
    color: colors.text,
    fontSize: font.size.lg,
    fontWeight: font.weight.semibold,
    marginTop: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: colors.text, fontSize: font.size.md, fontWeight: font.weight.semibold },
  badge: { color: colors.success, fontSize: font.size.sm },
  meta: { color: colors.textMuted, fontSize: font.size.sm },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  disabled: { opacity: 0.6 },
  buttonText: { color: colors.primaryText, fontWeight: font.weight.semibold },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  secondary: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  secondaryText: { color: colors.text },
  link: { color: colors.textMuted, padding: spacing.sm },
  footer: { color: colors.textMuted, fontSize: font.size.sm, textAlign: 'center', marginTop: spacing.sm },
});
