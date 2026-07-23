import { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  reindexMemory,
  searchMemory,
  type SearchResultItem,
} from '../../src/features/search/search.service';
import { colors, spacing, radius, font } from '../../src/theme';

/**
 * Busca semântica (M6 — docs/19 §9). Usa Gemini embeddings no backend quando configurado.
 */
export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'semantic' | 'keyword'>('semantic');
  const [items, setItems] = useState<SearchResultItem[]>([]);
  const [provider, setProvider] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSearch = useCallback(async () => {
    const q = query.trim();
    if (q.length < 2) {
      setError('Digite ao menos 2 caracteres');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await searchMemory(q, mode);
      setItems(res.items);
      setProvider(res.provider);
    } catch (err) {
      setItems([]);
      setProvider(null);
      setError(err instanceof Error ? err.message : 'Falha na busca');
    } finally {
      setLoading(false);
    }
  }, [query, mode]);

  const onReindex = useCallback(async () => {
    setReindexing(true);
    setError(null);
    try {
      const res = await reindexMemory();
      setError(
        `Reindex: ${res.eventsIndexed} eventos + ${res.insightsIndexed} insights (${res.embedded} API / ${res.cached} cache)`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no reindex');
    } finally {
      setReindexing(false);
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.lead}>
        Pergunte em linguagem natural. Semântica usa Gemini Embeddings (grátis); keyword é
        busca por texto no Postgres.
      </Text>

      <TextInput
        style={styles.input}
        placeholder='Ex.: ansiedade antes de prova'
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={() => void runSearch()}
        returnKeyType="search"
      />

      <View style={styles.modes}>
        <Pressable
          style={[styles.modeChip, mode === 'semantic' && styles.modeActive]}
          onPress={() => setMode('semantic')}
        >
          <Text style={[styles.modeText, mode === 'semantic' && styles.modeTextActive]}>
            Semântica
          </Text>
        </Pressable>
        <Pressable
          style={[styles.modeChip, mode === 'keyword' && styles.modeActive]}
          onPress={() => setMode('keyword')}
        >
          <Text style={[styles.modeText, mode === 'keyword' && styles.modeTextActive]}>
            Keyword
          </Text>
        </Pressable>
        <Pressable style={styles.searchBtn} onPress={() => void runSearch()}>
          <Text style={styles.searchBtnText}>Buscar</Text>
        </Pressable>
      </View>

      <Pressable style={styles.reindex} onPress={() => void onReindex()} disabled={reindexing}>
        <Text style={styles.reindexText}>
          {reindexing ? 'Reindexando…' : 'Reindexar memória (Gemini)'}
        </Text>
      </Pressable>

      {provider ? <Text style={styles.meta}>provider: {provider}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => `${it.kind}:${it.id}`}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>
              Nenhum resultado ainda. Registre notas, rode o Demo e use Reindexar se ligou a
              chave agora.
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => {
                if (item.kind === 'insight') {
                  router.push(`/(app)/insight/${item.id}`);
                }
              }}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.kind}>{item.kind}</Text>
                <Text style={styles.score}>{(item.score * 100).toFixed(0)}%</Text>
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.snippet} numberOfLines={3}>
                {item.snippet}
              </Text>
              {item.occurredAt ? (
                <Text style={styles.time}>{new Date(item.occurredAt).toLocaleString()}</Text>
              ) : null}
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md },
  lead: {
    color: colors.textMuted,
    fontSize: font.size.sm,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
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
  modes: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  modeChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  modeText: { color: colors.text, fontSize: font.size.sm },
  modeTextActive: { color: colors.primaryText, fontWeight: '600' },
  searchBtn: {
    marginLeft: 'auto',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.sm,
  },
  searchBtnText: { color: colors.primaryText, fontWeight: '600' },
  reindex: { marginBottom: spacing.sm },
  reindexText: { color: colors.primary, fontSize: font.size.sm },
  meta: { color: colors.textMuted, fontSize: font.size.sm, marginBottom: 4 },
  error: { color: colors.danger, fontSize: font.size.sm, marginBottom: spacing.sm },
  list: { paddingBottom: spacing.xl, gap: spacing.sm },
  empty: { color: colors.textMuted, marginTop: spacing.lg, lineHeight: 20 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  kind: { color: colors.textMuted, fontSize: font.size.sm, textTransform: 'uppercase' },
  score: { color: colors.textMuted, fontSize: font.size.sm },
  title: { color: colors.text, fontWeight: '600', marginBottom: 4 },
  snippet: { color: colors.text, opacity: 0.85, lineHeight: 20 },
  time: { color: colors.textMuted, fontSize: font.size.sm, marginTop: 6 },
});
