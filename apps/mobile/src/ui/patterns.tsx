import type { ReactNode } from 'react';
import { View, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors, font, spacing } from '../theme';
import { Title, Body, Caption, Label } from './Typography';

/** Cabeçalho de página no padrão da home (título serif + lead). */
export function PageHeader({
  title,
  lead,
  style,
}: {
  title: string;
  lead?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.pageHeader, style]}>
      <Title style={styles.pageTitle}>{title}</Title>
      {lead ? <Caption style={styles.pageLead}>{lead}</Caption> : null}
    </View>
  );
}

/** Título de seção (como “Timeline”). */
export function SectionTitle({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <Title style={[styles.sectionTitle, style]}>{children}</Title>;
}

export function Ledger({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.ledger, style]}>{children}</View>;
}

export function LedgerRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.ledgerRow, last && styles.ledgerRowLast]}>
      <Caption style={styles.ledgerLabel}>{label}</Caption>
      <Label style={styles.ledgerValue}>{value}</Label>
    </View>
  );
}

/** Item de listagem no padrão da timeline (kind + meta + corpo). */
export function EntryRow({
  kind,
  meta,
  children,
  onPress,
  trailing,
}: {
  kind: string;
  meta?: string;
  children: ReactNode;
  onPress?: () => void;
  trailing?: string;
}) {
  const content = (
    <View style={styles.entry}>
      <View style={styles.entryMeta}>
        <Caption style={styles.entryKind}>{kind}</Caption>
        {meta ? <Caption style={styles.entryTime}>{meta}</Caption> : null}
        {trailing ? <Caption tone="primary">{trailing}</Caption> : null}
      </View>
      {typeof children === 'string' ? (
        <Body style={styles.entryBody}>{children}</Body>
      ) : (
        children
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button">
        {content}
      </Pressable>
    );
  }
  return content;
}

export function Hairline() {
  return <View style={styles.hairline} />;
}

export const pagePad = {
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.sm,
  paddingBottom: spacing.xl,
} as const;

const styles = StyleSheet.create({
  pageHeader: { marginBottom: spacing.lg },
  pageTitle: {
    fontSize: font.size.xxl,
    fontFamily: font.family.serifBold,
    letterSpacing: -0.6,
    marginBottom: 4,
  },
  pageLead: {
    fontSize: font.size.sm,
    lineHeight: 20,
    maxWidth: 340,
  },
  sectionTitle: {
    fontSize: font.size.xl,
    fontFamily: font.family.serif,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  ledger: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingVertical: spacing.md - 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  ledgerRowLast: {},
  ledgerLabel: {
    fontSize: font.size.sm,
    color: colors.textMuted,
    fontFamily: font.family.sans,
  },
  ledgerValue: {
    fontSize: font.size.lg,
    fontFamily: font.family.serif,
    color: colors.text,
    letterSpacing: -0.2,
    flexShrink: 1,
    textAlign: 'right',
  },
  entry: {
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  entryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  entryKind: {
    fontFamily: font.family.sansMedium,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontSize: 11,
  },
  entryTime: {
    color: colors.textMuted,
    fontSize: font.size.sm,
  },
  entryBody: {
    fontSize: font.size.md,
    lineHeight: 22,
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderStrong,
  },
});
