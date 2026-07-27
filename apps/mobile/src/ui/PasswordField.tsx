import { useState } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  type TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';
import { TextField } from './TextField';

type Props = Omit<TextInputProps, 'secureTextEntry'> & {
  /** Acessibilidade do botão mostrar/ocultar. */
  toggleAccessibilityLabel?: string;
};

/** Campo de senha com olho para mostrar/ocultar. */
export function PasswordField({
  toggleAccessibilityLabel = 'Mostrar ou ocultar senha',
  style,
  ...props
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.wrap}>
      <TextField
        {...props}
        secureTextEntry={!visible}
        style={[styles.input, style]}
      />
      <Pressable
        onPress={() => setVisible((v) => !v)}
        style={styles.toggle}
        accessibilityRole="button"
        accessibilityLabel={toggleAccessibilityLabel}
        hitSlop={8}
      >
        <Ionicons
          name={visible ? 'eye-off-outline' : 'eye-outline'}
          size={22}
          color={colors.textMuted}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    paddingRight: spacing.xl + spacing.md,
  },
  toggle: {
    position: 'absolute',
    right: spacing.md,
    height: '100%',
    justifyContent: 'center',
  },
});
