import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, spacing } from '../theme';

const LINKS = [
  { label: 'Insights', href: '/(app)/insights' as const },
  { label: 'Busca', href: '/(app)/search' as const },
  { label: 'Saúde', href: '/(app)/health' as const },
  { label: 'Fontes', href: '/(app)/sources' as const },
  { label: 'Ajustes', href: '/(app)/settings' as const },
] as const;

const DRAWER_WIDTH = 240;

/**
 * Menu lateral direito — título + links (sem subtítulo por item).
 * Fecha tocando na área livre à esquerda.
 */
export function HomeMenu() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  const drawerWidth = Math.min(DRAWER_WIDTH, Math.round(windowWidth * 0.68));

  const animateTo = useCallback(
    (to: number, onEnd?: () => void) => {
      Animated.timing(progress, {
        toValue: to,
        duration: to === 1 ? 240 : 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) onEnd?.();
      });
    },
    [progress],
  );

  const openMenu = useCallback(() => {
    setVisible(true);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!visible) return;
    if (open) {
      progress.setValue(0);
      animateTo(1);
    } else {
      animateTo(0, () => setVisible(false));
    }
  }, [open, visible, animateTo, progress]);

  const go = useCallback(
    (href: (typeof LINKS)[number]['href']) => {
      close();
      requestAnimationFrame(() => router.push(href));
    },
    [close, router],
  );

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [drawerWidth, 0],
  });

  const scrimOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <>
      <Pressable
        onPress={openMenu}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Menu"
        accessibilityHint="Abre o menu de navegação"
        style={styles.trigger}
      >
        <Text style={styles.triggerText}>⋯</Text>
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={close}
        statusBarTranslucent
      >
        <View style={styles.root} accessibilityViewIsModal>
          {/* Toque fora: Pressable real (não animado) — anima só o véu visual */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel="Fechar menu"
          >
            <Animated.View
              pointerEvents="none"
              style={[styles.scrim, { opacity: scrimOpacity }]}
            />
          </Pressable>

          <Animated.View
            style={[
              styles.drawer,
              {
                width: drawerWidth,
                paddingTop: insets.top + spacing.md,
                paddingBottom: Math.max(insets.bottom, spacing.md),
                transform: [{ translateX }],
              },
            ]}
            accessibilityRole="menu"
          >
            <Text style={styles.title}>Menu</Text>
            <Text style={styles.titleHint}>Escolha uma seção</Text>

            <View style={styles.list}>
              {LINKS.map((link) => (
                <Pressable
                  key={link.href}
                  style={styles.row}
                  onPress={() => go(link.href)}
                  accessibilityRole="menuitem"
                  accessibilityLabel={link.label}
                >
                  <Text style={styles.rowLabel}>{link.label}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerText: {
    fontSize: 22,
    lineHeight: 24,
    color: colors.textMuted,
    fontFamily: font.family.serif,
    letterSpacing: 1,
  },
  root: {
    flex: 1,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(21, 32, 43, 0.22)',
  },
  drawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.bg,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontFamily: font.family.serifBold,
    fontSize: font.size.xl,
    color: colors.text,
    letterSpacing: -0.3,
  },
  titleHint: {
    fontFamily: font.family.sans,
    fontSize: font.size.sm,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  list: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  row: {
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    fontFamily: font.family.serif,
    fontSize: font.size.lg,
    color: colors.text,
    letterSpacing: -0.2,
  },
});
