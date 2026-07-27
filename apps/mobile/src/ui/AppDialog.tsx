import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing, shadow } from '../theme';
import { Button } from './Button';

export type AppDialogProps = {
  visible: boolean;
  title: string;
  message?: string;
  /** Se omitido, mostra só o botão de fechar (aviso). */
  confirmLabel?: string;
  cancelLabel?: string;
  /** Confirmação perigosa (apagar etc.). */
  destructive?: boolean;
  busy?: boolean;
  onConfirm?: () => void;
  onDismiss: () => void;
};

/**
 * Diálogo Atlas (scrim + cartão névoa) — substitui Alert nativo em confirmações e avisos.
 */
export function AppDialog({
  visible,
  title,
  message,
  confirmLabel = 'Continuar',
  cancelLabel = 'Cancelar',
  destructive = false,
  busy = false,
  onConfirm,
  onDismiss,
}: AppDialogProps) {
  const isConfirm = typeof onConfirm === 'function';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View style={styles.root} accessibilityViewIsModal>
        <Pressable
          style={styles.scrim}
          onPress={busy ? undefined : onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Fechar"
        />
        <View style={styles.card} accessibilityRole="alert">
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.actions}>
            {isConfirm ? (
              <>
                <Button
                  variant="ghost"
                  label={cancelLabel}
                  onPress={onDismiss}
                  disabled={busy}
                  style={styles.btn}
                />
                <Button
                  variant={destructive ? 'danger' : 'primary'}
                  label={confirmLabel}
                  onPress={onConfirm}
                  busy={busy}
                  style={styles.btn}
                />
              </>
            ) : (
              <Button label="Entendi" onPress={onDismiss} style={styles.btn} />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(21, 32, 43, 0.28)',
  },
  card: {
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    ...shadow.card,
  },
  title: {
    fontFamily: font.family.serifBold,
    fontSize: font.size.xl,
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: spacing.sm,
  },
  message: {
    fontFamily: font.family.sans,
    fontSize: font.size.md,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  btn: {
    alignSelf: 'stretch',
  },
});
