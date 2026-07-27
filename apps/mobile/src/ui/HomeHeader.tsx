import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, spacing } from '../theme';
import { HomeMenu } from './HomeMenu';

/**
 * Header da home — mesma margem horizontal da timeline (spacing.lg),
 * para o wordmark alinhar com “Hoje” e a lista.
 */
export function HomeHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        <Text style={styles.brand} accessibilityRole="header">
          Atlas
        </Text>
        <HomeMenu />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.bg,
  },
  row: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontFamily: font.family.serif,
    fontSize: font.size.lg,
    color: colors.text,
  },
});
