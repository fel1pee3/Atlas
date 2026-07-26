import { useCallback, useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../src/state/auth.store';
import { deleteAccountAndWipe, exportAndShare } from '../../src/features/privacy/privacy.service';
import { purgeDemoLocalEvents } from '../../src/features/events/events.service';
import { disableHealth } from '../../src/features/health/health.service';
import { disableLocation } from '../../src/features/location/location.service';
import { disableCalendar } from '../../src/features/calendar/calendar.service';
import {
  loadDogfoodSnapshot,
  type DogfoodSnapshot,
} from '../../src/features/dogfood/dogfood.service';
import { colors, spacing } from '../../src/theme';
import {
  Screen,
  TextField,
  Button,
  Caption,
  PageHeader,
  SectionTitle,
  Ledger,
  LedgerRow,
  pagePad,
} from '../../src/ui';

/**
 * Ajustes — export / apagar / dogfooding (docs/19 §13, M7/M8).
 */
export default function SettingsScreen() {
  const router = useRouter();
  const logout = useAuth((s) => s.logout);
  const [loggingOut, setLoggingOut] = useState(false);
  const [busy, setBusy] = useState<'export' | 'delete' | 'purgeDemo' | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [dogfood, setDogfood] = useState<DogfoodSnapshot | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDogfood = useCallback(async () => {
    setDogfood(await loadDogfoodSnapshot());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadDogfood();
    }, [loadDogfood]),
  );

  const onExport = async () => {
    setBusy('export');
    try {
      const { counts } = await exportAndShare();
      Alert.alert(
        'Export pronto',
        `Eventos: ${counts.events ?? 0} · Insights: ${counts.insights ?? 0}`,
      );
    } catch (err) {
      Alert.alert('Falha no export', err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setBusy(null);
    }
  };

  const onDelete = () => {
    if (confirmText.trim().toUpperCase() !== 'APAGAR') {
      Alert.alert('Confirmação', 'Digite APAGAR para confirmar a exclusão permanente.');
      return;
    }
    Alert.alert(
      'Apagar conta?',
      'Isso remove seus dados no servidor e neste aparelho. Não dá para desfazer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar tudo',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              setBusy('delete');
              try {
                await deleteAccountAndWipe();
                router.replace('/login');
              } catch (err) {
                Alert.alert(
                  'Falha ao apagar',
                  err instanceof Error ? err.message : 'Erro desconhecido',
                );
                setBusy(null);
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <Screen padded={false} safe={false}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void loadDogfood().finally(() => setRefreshing(false));
            }}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <PageHeader
          title="Ajustes"
          lead="Seus dados são seus. Exporte quando quiser; apague de verdade."
        />

        <SectionTitle>Dogfooding</SectionTitle>
        {dogfood ? (
          <Ledger>
            <LedgerRow
              label="Streak"
              value={`${dogfood.streakDays} dia${dogfood.streakDays === 1 ? '' : 's'}`}
            />
            <LedgerRow label="Aberturas" value={String(dogfood.openDaysTotal)} />
            {dogfood.stats ? (
              <>
                <LedgerRow
                  label="Úteis / semana"
                  value={`${dogfood.stats.usefulThisWeek}${
                    dogfood.stats.northStarMet ? ' · North Star' : ''
                  }`}
                />
                <LedgerRow
                  label="Totais"
                  value={`${dogfood.stats.usefulTotal} úteis · ${dogfood.stats.eventsTotal} ev.`}
                  last
                />
              </>
            ) : (
              <LedgerRow
                label="Stats"
                value={dogfood.statsError ?? 'offline'}
                last
              />
            )}
          </Ledger>
        ) : (
          <ActivityIndicator color={colors.primary} />
        )}

        <SectionTitle>Dados reais</SectionTitle>
        <Caption style={styles.hint}>
          Remove eventos Demo locais e desativa conectores sintéticos.
        </Caption>
        <Button
          variant="secondary"
          label="Limpar dados Demo"
          busy={busy === 'purgeDemo'}
          disabled={busy !== null}
          onPress={() => {
            Alert.alert(
              'Limpar dados Demo?',
              'Apaga só eventos locais sintéticos. Eventos reais e a conta ficam.',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Limpar Demo',
                  style: 'destructive',
                  onPress: () => {
                    void (async () => {
                      setBusy('purgeDemo');
                      try {
                        const removed = await purgeDemoLocalEvents();
                        await disableHealth();
                        await disableLocation();
                        await disableCalendar();
                        Alert.alert('Pronto', `${removed} eventos Demo removidos.`);
                        await loadDogfood();
                      } catch (err) {
                        Alert.alert(
                          'Falha',
                          err instanceof Error ? err.message : 'Erro ao limpar Demo',
                        );
                      } finally {
                        setBusy(null);
                      }
                    })();
                  },
                },
              ],
            );
          }}
        />

        <SectionTitle>Portabilidade</SectionTitle>
        <Button
          label="Exportar meus dados (JSON)"
          onPress={() => void onExport()}
          busy={busy === 'export'}
          disabled={busy !== null}
        />

        <SectionTitle>Exclusão</SectionTitle>
        <Caption style={styles.hint}>Digite APAGAR para confirmar.</Caption>
        <TextField
          value={confirmText}
          onChangeText={setConfirmText}
          autoCapitalize="characters"
          placeholder="APAGAR"
          style={styles.field}
        />
        <Button
          variant="danger"
          label="Apagar conta e dados"
          onPress={onDelete}
          busy={busy === 'delete'}
          disabled={busy !== null}
        />

        <SectionTitle>Sessão</SectionTitle>
        <Button
          variant="secondary"
          label="Sair"
          busy={loggingOut}
          disabled={busy !== null || loggingOut}
          onPress={() => {
            if (loggingOut) return;
            setLoggingOut(true);
            void (async () => {
              await logout();
              router.replace('/login');
            })();
          }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { ...pagePad, gap: spacing.sm },
  hint: { marginBottom: spacing.sm, lineHeight: 18 },
  field: { marginBottom: spacing.sm },
});
