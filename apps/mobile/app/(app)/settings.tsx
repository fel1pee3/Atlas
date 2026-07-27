import { useCallback, useState } from 'react';
import { StyleSheet, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
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
  AppDialog,
} from '../../src/ui';

type Notice = { title: string; message: string };

/**
 * Ajustes — export / apagar / resumo de uso (docs/19 §13, M7/M8).
 */
export default function SettingsScreen() {
  const router = useRouter();
  const logout = useAuth((s) => s.logout);
  const [loggingOut, setLoggingOut] = useState(false);
  const [busy, setBusy] = useState<'export' | 'delete' | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [dogfood, setDogfood] = useState<DogfoodSnapshot | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

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
      setNotice({
        title: 'Export pronto',
        message: `Eventos: ${counts.events ?? 0} · Insights: ${counts.insights ?? 0}`,
      });
    } catch (err) {
      setNotice({
        title: 'Falha no export',
        message: err instanceof Error ? err.message : 'Erro desconhecido',
      });
    } finally {
      setBusy(null);
    }
  };

  const onDeletePress = () => {
    if (confirmText.trim().toUpperCase() !== 'APAGAR') {
      setConfirmError('Digite APAGAR para confirmar a exclusão permanente.');
      return;
    }
    setConfirmError(null);
    setDeleteOpen(true);
  };

  const onDeleteConfirm = () => {
    void (async () => {
      setBusy('delete');
      try {
        await deleteAccountAndWipe();
        setDeleteOpen(false);
        router.replace('/login');
      } catch (err) {
        setBusy(null);
        setDeleteOpen(false);
        setNotice({
          title: 'Falha ao apagar',
          message: err instanceof Error ? err.message : 'Erro desconhecido',
        });
      }
    })();
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
          onChangeText={(v) => {
            setConfirmText(v);
            if (confirmError) setConfirmError(null);
          }}
          autoCapitalize="characters"
          placeholder="APAGAR"
          style={styles.field}
        />
        {confirmError ? (
          <Caption tone="danger" style={styles.fieldError}>
            {confirmError}
          </Caption>
        ) : null}
        <Button
          variant="danger"
          label="Apagar conta e dados"
          onPress={onDeletePress}
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

      <AppDialog
        visible={deleteOpen}
        title="Apagar conta?"
        message="Isso remove seus dados no servidor e neste aparelho. Não dá para desfazer."
        confirmLabel="Apagar tudo"
        cancelLabel="Cancelar"
        destructive
        busy={busy === 'delete'}
        onConfirm={onDeleteConfirm}
        onDismiss={() => {
          if (busy === 'delete') return;
          setDeleteOpen(false);
        }}
      />

      <AppDialog
        visible={notice != null}
        title={notice?.title ?? ''}
        message={notice?.message}
        onDismiss={() => setNotice(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { ...pagePad, gap: spacing.sm },
  header: { marginBottom: spacing.sm },
  firstSection: { marginTop: 0, marginBottom: spacing.xs },
  hint: { marginBottom: spacing.sm, lineHeight: 18 },
  field: { marginBottom: spacing.sm },
  fieldError: { marginBottom: spacing.sm, marginTop: -4 },
});
