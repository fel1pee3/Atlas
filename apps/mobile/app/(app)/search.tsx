import { useCallback, useState } from 'react';
import { View, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import {
  reindexMemory,
  searchMemory,
  type SearchResultItem,
} from '../../src/features/search/search.service';
import { eventKindLabel, formatEventWhen } from '../../src/lib/humanize';
import { colors, spacing, font } from '../../src/theme';
import {
  Screen,
  TextField,
  Button,
  Body,
  Caption,
  PageHeader,
  EntryRow,
  Hairline,
  pagePad,
} from '../../src/ui';

function resultKindLabel(item: SearchResultItem): string {
  if (item.kind === 'insight') return 'Insight';
  return eventKindLabel(item.type ?? item.title);
}

function resultTitle(item: SearchResultItem): string {
  if (item.kind === 'insight') return item.title;
  // API às vezes manda o type técnico como title — preferir o trecho legível.
  const looksTechnical = item.title.includes('.') || item.title === (item.type ?? '');
  if (looksTechnical && item.snippet.trim()) return item.snippet;
  return item.title;
}

/**
 * Busca semântica (M6 — docs/19 §9).
 */
export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'semantic' | 'keyword'>('semantic');
  const [items, setItems] = useState<SearchResultItem[]>([]);
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
    } catch (err) {
      setItems([]);
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
    <Screen padded={false} safe={false}>
      <View style={styles.container}>
        <PageHeader
          title="Busca"
          lead="Pergunte em linguagem natural ou busque por palavras na timeline e nos insights."
        />

        <TextField
          placeholder="Ex.: ansiedade antes de prova"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => void runSearch()}
          returnKeyType="search"
        />

        <View style={styles.modes}>
          <Pressable
            style={[styles.mode, mode === 'semantic' && styles.modeOn]}
            onPress={() => setMode('semantic')}
          >
            <Caption style={mode === 'semantic' ? styles.modeOnText : styles.modeText}>
              Semântica
            </Caption>
          </Pressable>
          <Pressable
            style={[styles.mode, mode === 'keyword' && styles.modeOn]}
            onPress={() => setMode('keyword')}
          >
            <Caption style={mode === 'keyword' ? styles.modeOnText : styles.modeText}>
              Palavras
            </Caption>
          </Pressable>
          <Button label="Buscar" onPress={() => void runSearch()} style={styles.searchBtn} />
        </View>

        <Button
          variant="ghost"
          label={reindexing ? 'Atualizando…' : 'Atualizar índice'}
          onPress={() => void onReindex()}
          disabled={reindexing}
        />

        {error ? (
          <Caption tone={error.startsWith('Reindex:') || error.startsWith('Índice:') ? 'muted' : 'danger'}>
            {error.startsWith('Reindex:')
              ? error.replace(
                  /^Reindex: (\d+) eventos \+ (\d+) insights \(.+\)$/,
                  'Índice: $1 registros e $2 insights atualizados.',
                )
              : error}
          </Caption>
        ) : null}

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(it) => `${it.kind}:${it.id}`}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Body tone="muted" style={styles.empty}>
                Nenhum resultado ainda. Registre notas, conecte fontes e reindexe se precisar.
              </Body>
            }
            renderItem={({ item }) => {
              const title = resultTitle(item);
              const showSnippet =
                item.kind === 'insight' ||
                (item.snippet.trim().length > 0 && item.snippet.trim() !== title);
              return (
                <EntryRow
                  kind={resultKindLabel(item)}
                  meta={
                    item.occurredAt
                      ? formatEventWhen(item.occurredAt)
                      : `${(item.score * 100).toFixed(0)}%`
                  }
                  onPress={
                    item.kind === 'insight'
                      ? () => router.push(`/(app)/insight/${item.id}`)
                      : undefined
                  }
                >
                  <Body style={styles.itemTitle}>{title}</Body>
                  {showSnippet ? (
                    <Caption numberOfLines={3}>{item.snippet}</Caption>
                  ) : null}
                </EntryRow>
              );
            }}
            ItemSeparatorComponent={() => <Hairline />}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...pagePad, gap: spacing.sm },
  modes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  mode: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'transparent',
  },
  modeOn: { borderBottomColor: colors.primary },
  modeText: { color: colors.textMuted },
  modeOnText: {
    color: colors.primary,
    fontFamily: font.family.sansSemi,
  },
  searchBtn: { marginLeft: 'auto', minHeight: 40, paddingVertical: 8 },
  list: { paddingBottom: spacing.xl, flexGrow: 1 },
  empty: { marginTop: spacing.lg, lineHeight: 20 },
  itemTitle: {
    fontFamily: font.family.serif,
    fontSize: font.size.lg,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  time: { marginTop: 4 },
});
