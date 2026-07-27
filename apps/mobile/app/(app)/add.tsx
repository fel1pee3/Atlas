import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { EVENT_SOURCES, EVENT_TYPES } from '@atlas/shared';
import { addEvent } from '../../src/features/events/events.service';
import { colors, spacing, font } from '../../src/theme';
import { Screen, TextField, Button, Caption, PageHeader } from '../../src/ui';

type Kind = 'note' | 'mood' | 'expense';

/** Digits-only → centavos (ex.: "1" = 1 centavo). */
function digitsToCents(digits: string): number {
  const clean = digits.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  if (!clean) return 0;
  // Limite razoável (~R$ 99.999.999,99)
  const clipped = clean.slice(0, 10);
  return Number(clipped);
}

/** Centavos → "12.345,67" (pt-BR). */
function formatCentsBrl(cents: number): string {
  const value = cents / 100;
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function centsFromMaskedInput(raw: string): number {
  return digitsToCents(raw.replace(/\D/g, ''));
}

/**
 * Entrada manual (docs/20_MVP.md §2.2).
 */
export default function AddEventScreen() {
  const router = useRouter();
  const [kind, setKind] = useState<Kind>('note');
  const [text, setText] = useState('');
  const [mood, setMood] = useState(3);
  /** Valor do gasto em centavos (máscara começa pelos centavos). */
  const [amountCents, setAmountCents] = useState(0);
  const [busy, setBusy] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setFieldError(null);
    const occurredAt = new Date().toISOString();
    try {
      if (kind === 'note') {
        const trimmed = text.trim();
        if (!trimmed) {
          setFieldError('Escreva algo antes de registrar.');
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
        if (amountCents <= 0) {
          setFieldError('Informe um valor maior que zero.');
          return;
        }
        await addEvent({
          type: EVENT_TYPES.MANUAL_EXPENSE,
          source: EVENT_SOURCES.MANUAL,
          occurredAt,
          payload: { amount: amountCents / 100, currency: 'BRL' },
        });
      }
      router.back();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen safe={false} padded style={styles.container}>
      <PageHeader
        title="Registrar"
        lead="Nota, humor ou gasto — fica no aparelho primeiro."
        style={styles.header}
      />

      <View style={styles.tabs}>
        {(['note', 'mood', 'expense'] as Kind[]).map((k) => (
          <Pressable
            key={k}
            style={[styles.tab, kind === k && styles.tabOn]}
            onPress={() => {
              setKind(k);
              setFieldError(null);
              if (k !== 'expense') setAmountCents(0);
            }}
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
          onChangeText={(v) => {
            setText(v);
            if (fieldError) setFieldError(null);
          }}
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
          placeholder="R$ 0,00"
          keyboardType="number-pad"
          value={`R$ ${formatCentsBrl(amountCents)}`}
          onChangeText={(raw) => {
            setAmountCents(centsFromMaskedInput(raw));
            if (fieldError) setFieldError(null);
          }}
          accessibilityLabel="Valor em reais"
        />
      )}

      {fieldError ? (
        <Caption tone="danger" accessibilityLiveRegion="polite">
          {fieldError}
        </Caption>
      ) : null}

      <Button label="Registrar" onPress={() => void save()} busy={busy} style={styles.save} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: spacing.md, gap: spacing.md },
  header: { marginBottom: 0 },
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
