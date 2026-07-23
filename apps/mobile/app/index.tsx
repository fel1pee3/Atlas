import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../src/state/auth.store';
import { colors, spacing, radius, font } from '../src/theme';

/**
 * Tela de entrada (login/registro). Comunica a promessa de privacidade
 * antes de pedir dados (docs/06_User_Journey.md, docs/19_UI_Screens.md).
 */
export default function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const login = useAuth((s) => s.login);
  const register = useAuth((s) => s.register);
  const error = useAuth((s) => s.error);

  async function submit() {
    setBusy(true);
    try {
      if (mode === 'login') await login(email.trim(), password);
      else await register(email.trim(), password);
    } catch {
      // erro já exposto pelo store
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.logo}>Atlas</Text>
        <Text style={styles.tagline}>Sua vida, compreendida. Seus dados, seus.</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Senha (mín. 8 caracteres)"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.button, busy && styles.buttonDisabled]}
          onPress={submit}
          disabled={busy}
        >
          <Text style={styles.buttonText}>
            {busy ? '...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </Text>
        </Pressable>

        <Pressable onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
          <Text style={styles.switch}>
            {mode === 'login' ? 'Não tem conta? Criar uma' : 'Já tem conta? Entrar'}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.privacy}>
        Local-first. Você pode exportar ou apagar tudo a qualquer momento.
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  logo: { color: colors.text, fontSize: font.size.xxl, fontWeight: font.weight.bold },
  tagline: { color: colors.textMuted, marginTop: spacing.sm, fontSize: font.size.md },
  form: { gap: spacing.md },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: font.size.md,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.primaryText, fontWeight: font.weight.semibold, fontSize: font.size.md },
  switch: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
  error: { color: colors.danger, fontSize: font.size.sm },
  privacy: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl, fontSize: font.size.sm },
});
