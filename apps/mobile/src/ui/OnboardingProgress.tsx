import { View, StyleSheet } from 'react-native';
import { colors } from '../theme';

type Props = {
  total: number;
  current: number;
};

/** Dots de progresso do onboarding (saúde → agenda → lugares). */
export function OnboardingProgress({ total, current }: Props) {
  return (
    <View style={styles.row} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total - 1, now: current }}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.dot, i === current ? styles.dotActive : styles.dotIdle]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 6,
    borderRadius: 999,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  dotIdle: {
    width: 6,
    backgroundColor: 'rgba(90, 107, 122, 0.3)',
  },
});
