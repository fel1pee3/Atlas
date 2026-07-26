import { useState } from 'react';
import { View, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { EVENT_SOURCES, EVENT_TYPES } from '@atlas/shared';
import { addEvent } from '../../src/features/events/events.service';
import { colors, spacing, font } from '../../src/theme';
import { Screen, TextField, Button, Caption, PageHeader } from '../../src/ui';

type Kind = 'note' | 'mood' | 'expense';

function parseAmount(raw: string): number | null {
  let normalized = raw.trim().replace(/\s/g, '').replace(/R\$/gi, '');
  if (!normalized) return null;

  const hasComma = normalized.includes(',');
  const hasDot = normalized.includes('.');
  if (hasComma && hasDot) {
    normalized = normalized.replace(/\./g, '').replace(',', '.');
  } else if (hasComma) {
    normalized = normalized.replace(',', '.');
  }

  const value = Number(normalized);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

/**
 * Entrada manual (docs/20_MVP.md §2.2).
 */
export default function AddEventScreen() {
  const router = useRouter();
  const [kind, setKind] = useState<Kind>('note');
  const [text, setText] = useState('');
  const [mood, setMood] = useState(3);
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const occurredAt = new Date().toISOString();
    try {
      if (kind === 'note') {
        const trimmed = text.trim();
        if (!trimmed) {
          Alert.alert('Nota vazia', 'Escreva algo antes de registrar.');
          return;
        }
        await addEvent({
          type: EVENT_TYPES.MANUAL_NOTE,
          source: EVENT_SOURCES.MANUAL,
          occurredAt,
          payload: { text: trimmed },
        });
      } else if (kind === 'mood') {
        await addEvent({
          type: EVENT_TYPES.MANUAL_MOOD,
          source: EVENT_SOURCES.MANUAL,
          occurredAt,
          payload: { score: mood },
        });
      } else {
        const parsed = parseAmount(amount);
        if (parsed === null) {
          Alert.alert('Valor inválido', 'Informe um valor numérico (ex.: 12,50).');
          return;
        }
        await addEvent({
          type: EVENT_TYPES.MANUAL_EXPENSE,
          source: EVENT_SOURCES.MANUAL,
          occurredAt,
          payload: { amount: parsed, currency: 'BRL' },
        });
      }
      router.back();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen safe={false} padded style={styles.container}>
      <PageHeader title="Registrar" lead="Nota, humor ou gasto — fica no aparelho primeiro." />

      <View style={styles.tabs}>
        {(['note', 'mood', 'expense'] as Kind[]).map((k) => (
          <Pressable
            key={k}
            style={[styles.tab, kind === k && styles.tabOn]}
            onPress={() => setKind(k)}
          >
            <Caption style={kind === k ? styles.tabOnText : styles.tabText}>
              {k === 'note' ? 'Nota' : k === 'mood' ? 'Humor' : 'Gasto'}
            </Caption>
          </Pressable>
        ))}
      </View>

      {kind === 'note' && (
        <TextField
          multiline
          placeholder="O que aconteceu?"
          value={text}
          onChangeText={setText}
        />
      )}

      {kind === 'mood' && (
        <View style={styles.moodRow}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable
              key={n}
              style={[styles.moodDot, mood === n && styles.moodDotOn]}
              onPress={() => setMood(n)}
            >
              <Caption style={mood === n ? styles.moodOnText : styles.moodText}>{n}</Caption>
            </Pressable>
          ))}
        </View>
      )}

      {kind === 'expense' && (
        <TextField
          placeholder="Valor (R$)"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />
      )}

      <Button label="Registrar" onPress={() => void save()} busy={busy} style={styles.save} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: spacing.md, gap: spacing.lg },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  tab: {
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -StyleSheet.hairlineWidth,
  },
  tabOn: { borderBottomColor: colors.primary },
  tabText: { color: colors.textMuted, fontFamily: font.family.sansMedium },
  tabOnText: { color: colors.primary, fontFamily: font.family.sansSemi },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  moodDot: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  moodDotOn: { borderBottomColor: colors.primary, borderBottomWidth: 2 },
  moodText: {
    fontSize: font.size.lg,
    color: colors.textMuted,
    fontFamily: font.family.serif,
  },
  moodOnText: {
    fontSize: font.size.lg,
    color: colors.primary,
    fontFamily: font.family.serifBold,
  },
  save: { marginTop: spacing.sm },
});
