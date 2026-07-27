import { useCallback, useState } from 'react';
import { StyleSheet, Alert, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../src/state/auth.store';
import { deleteAccountAndWipe, exportAndShare } from '../../src/features/privacy/privacy.service';
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
 * Ajustes — export / apagar / resumo de uso (docs/19 §13, M7/M8).
 */
export default function SettingsScreen() {
  const router = useRouter();
  const logout = useAuth((s) => s.logout);
  const [loggingOut, setLoggingOut] = useState(false);
  const [busy, setBusy] = useState<'export' | 'delete' | null>(null);
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
          style={styles.header}
        />

        <SectionTitle style={styles.firstSection}>Seu uso</SectionTitle>
        <Caption style={styles.hint}>
          Como você tem usado o Atlas — dias abertos e insights que marcou como úteis.
        </Caption>
        {dogfood ? (
          <Ledger>
            <LedgerRow
              label="Dias seguidos"
              value={`${dogfood.streakDays} dia${dogfood.streakDays === 1 ? '' : 's'}`}
            />
            <LedgerRow
              label="Dias com o app aberto"
              value={String(dogfood.openDaysTotal)}
            />
            {dogfood.stats ? (
              <>
                <LedgerRow
                  label="Insights úteis esta semana"
                  value={
                    dogfood.stats.northStarMet
                      ? `${dogfood.stats.usefulThisWeek} · meta ok`
                      : String(dogfood.stats.usefulThisWeek)
                  }
                />
                <LedgerRow
                  label="No total"
                  value={`${dogfood.stats.usefulTotal} úteis · ${dogfood.stats.eventsTotal} registros`}
                  last
                />
              </>
            ) : (
              <LedgerRow
                label="Resumo do servidor"
                value={dogfood.statsError ?? 'Sem conexão'}
                last
              />
            )}
          </Ledger>
        ) : (
          <ActivityIndicator color={colors.primary} />
        )}

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
  header: { marginBottom: spacing.sm },
  firstSection: { marginTop: 0, marginBottom: spacing.xs },
  hint: { marginBottom: spacing.sm, lineHeight: 18 },
  field: { marginBottom: spacing.sm },
});
