import { TextInput, StyleSheet, type TextInputProps } from 'react-native';
import { colors, font, radius, spacing } from '../theme';

export function TextField(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textSoft}
      {...props}
      style={[styles.input, props.multiline && styles.multiline, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: font.size.md,
    fontFamily: font.family.sans,
  },
  multiline: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
});
