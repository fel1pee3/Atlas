import { useCallback, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../src/state/auth.store';
import { deleteAccountAndWipe, exportAndShare } from '../../src/features/privacy/privacy.service';
import {
  loadDogfoodSnapshot,
  type DogfoodSnapshot,
} from '../../src/features/dogfood/dogfood.service';
import { colors, spacing, radius, font } from '../../src/theme';

/**
 * Ajustes — export / apagar / dogfooding North Star (docs/19 §13, M7/M8).
 */
export default function SettingsScreen() {
  const router = useRouter();
  const logout = useAuth((s) => s.logout);
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
                router.replace('/');
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
        />
      }
    >
      <Text style={styles.lead}>
        Seus dados são seus. Exporte quando quiser; apague de verdade. Acompanhe o dogfooding
        (North Star = insights úteis / semana).
      </Text>

      <Text style={styles.section}>Dogfooding (M8)</Text>
      {dogfood ? (
        <View style={styles.card}>
          <Text style={styles.statLine}>
            Streak: {dogfood.streakDays} dia{dogfood.streakDays === 1 ? '' : 's'} · meta D8: 30
          </Text>
          <Text style={styles.statLine}>Dias com abertura: {dogfood.openDaysTotal}</Text>
          {dogfood.stats ? (
            <>
              <Text style={styles.statLine}>
                Úteis esta semana: {dogfood.stats.usefulThisWeek}{' '}
                {dogfood.stats.northStarMet ? '✓ North Star' : '(meta ≥ 1)'}
              </Text>
              <Text style={styles.statMuted}>
                Úteis total {dogfood.stats.usefulTotal} · ativos {dogfood.stats.activeInsights} ·
                eventos {dogfood.stats.eventsTotal}
              </Text>
            </>
          ) : (
            <Text style={styles.statMuted}>{dogfood.statsError ?? 'Stats offline'}</Text>
          )}
        </View>
      ) : (
        <ActivityIndicator color={colors.primary} />
      )}

      <Text style={styles.section}>Portabilidade</Text>
      <Pressable
        style={[styles.btn, styles.btnPrimary]}
        onPress={() => void onExport()}
        disabled={busy !== null}
      >
        {busy === 'export' ? (
          <ActivityIndicator color={colors.primaryText} />
        ) : (
          <Text style={styles.btnPrimaryText}>Exportar meus dados (JSON)</Text>
        )}
      </Pressable>

      <Text style={styles.section}>Exclusão</Text>
      <Text style={styles.hint}>Digite APAGAR para habilitar a exclusão permanente.</Text>
      <TextInput
        style={styles.input}
        value={confirmText}
        onChangeText={setConfirmText}
        autoCapitalize="characters"
        placeholder="APAGAR"
        placeholderTextColor={colors.textMuted}
      />
      <Pressable
        style={[styles.btn, styles.btnDanger]}
        onPress={onDelete}
        disabled={busy !== null}
      >
        {busy === 'delete' ? (
          <ActivityIndicator color={colors.primaryText} />
        ) : (
          <Text style={styles.btnDangerText}>Apagar conta e dados</Text>
        )}
      </Pressable>

      <Text style={styles.section}>Sessão</Text>
      <Pressable
        style={styles.btn}
        onPress={() => {
          void logout().then(() => router.replace('/'));
        }}
        disabled={busy !== null}
      >
        <Text style={styles.btnText}>Sair</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, paddingBottom: spacing.xl },
  lead: {
    color: colors.textMuted,
    fontSize: font.size.sm,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  section: {
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  statLine: { color: colors.text, marginBottom: 4, fontSize: font.size.md },
  statMuted: { color: colors.textMuted, fontSize: font.size.sm, marginTop: 4 },
  hint: { color: colors.textMuted, fontSize: font.size.sm, marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  btn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  btnPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  btnPrimaryText: { color: colors.primaryText, fontWeight: '600' },
  btnDanger: { backgroundColor: colors.danger, borderColor: colors.danger },
  btnDangerText: { color: colors.primaryText, fontWeight: '600' },
  btnText: { color: colors.text, fontWeight: '500' },
});
