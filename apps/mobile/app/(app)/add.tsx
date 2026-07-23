import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { EVENT_SOURCES, EVENT_TYPES } from '@atlas/shared';
import { addEvent } from '../../src/features/events/events.service';
import { colors, spacing, radius, font } from '../../src/theme';

type Kind = 'note' | 'mood' | 'expense';

/**
 * Aceita "10", "10.50", "10,50", "1.234,56", "R$ 10,50".
 * Evita Number("10,50") === NaN → JSON null na timeline.
 */
function parseAmount(raw: string): number | null {
  let normalized = raw.trim().replace(/\s/g, '').replace(/R\$/gi, '');
  if (!normalized) return null;

  const hasComma = normalized.includes(',');
  const hasDot = normalized.includes('.');
  if (hasComma && hasDot) {
    // Formato BR com milhar: 1.234,56
    normalized = normalized.replace(/\./g, '').replace(',', '.');
  } else if (hasComma) {
    // Formato BR sem milhar: 10,50
    normalized = normalized.replace(',', '.');
  }
  // Só ponto → decimal internacional (10.50)

  const value = Number(normalized);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

/**
 * Entrada manual (docs/20_MVP.md §2.2). Fallback universal e gerador dos dados
 * subjetivos (humor) que nenhuma API fornece. Grava offline-first.
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
    <View style={styles.container}>
      <View style={styles.tabs}>
        {(['note', 'mood', 'expense'] as Kind[]).map((k) => (
          <Pressable
            key={k}
            style={[styles.tab, kind === k && styles.tabActive]}
            onPress={() => setKind(k)}
          >
            <Text style={[styles.tabText, kind === k && styles.tabTextActive]}>
              {k === 'note' ? 'Nota' : k === 'mood' ? 'Humor' : 'Gasto'}
            </Text>
          </Pressable>
        ))}
      </View>

      {kind === 'note' && (
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="O que aconteceu?"
          placeholderTextColor={colors.textMuted}
          multiline
          value={text}
          onChangeText={setText}
        />
      )}

      {kind === 'mood' && (
        <View style={styles.moodRow}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable
              key={n}
              style={[styles.moodDot, mood === n && styles.moodDotActive]}
              onPress={() => setMood(n)}
            >
              <Text style={[styles.moodText, mood === n && styles.moodTextActive]}>{n}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {kind === 'expense' && (
        <TextInput
          style={styles.input}
          placeholder="Valor (R$)"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />
      )}

      <Pressable style={[styles.button, busy && styles.buttonDisabled]} onPress={save} disabled={busy}>
        <Text style={styles.buttonText}>{busy ? '...' : 'Registrar'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg, gap: spacing.lg },
  tabs: { flexDirection: 'row', gap: spacing.sm },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.surfaceAlt, borderColor: colors.primary },
  tabText: { color: colors.textMuted },
  tabTextActive: { color: colors.text, fontWeight: font.weight.semibold },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: font.size.md,
  },
  multiline: { minHeight: 120, textAlignVertical: 'top' },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  moodDot: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodDotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  moodText: { color: colors.textMuted, fontSize: font.size.lg },
  moodTextActive: { color: colors.primaryText, fontWeight: font.weight.bold },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.primaryText, fontWeight: font.weight.semibold, fontSize: font.size.md },
});
