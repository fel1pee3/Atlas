import { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../src/state/auth.store';
import { colors, spacing, font } from '../src/theme';
import { Screen, Brand, Caption, TextField, Button } from '../src/ui';

/**
 * Login/registro em /login (rota explícita).
 */
export default function LoginScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const status = useAuth((s) => s.status);
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

  if (status === 'loading' || status === 'authenticated') {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Brand>Atlas</Brand>
          <Caption style={styles.tagline}>Sua vida, compreendida. Seus dados, seus.</Caption>
        </View>

        <View style={styles.form}>
          <TextField
            placeholder="E-mail"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            testID="auth-email"
            accessibilityLabel="E-mail"
          />
          <TextField
            placeholder="Senha (mín. 8 caracteres)"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            testID="auth-password"
            accessibilityLabel="Senha"
          />

          {error ? <Caption tone="danger">{error}</Caption> : null}

          <Button
            label={mode === 'login' ? 'Entrar' : 'Criar conta'}
            onPress={() => void submit()}
            busy={busy}
            testID="auth-submit"
          />

          <Button
            variant="ghost"
            label={mode === 'login' ? 'Não tem conta? Criar uma' : 'Já tem conta? Entrar'}
            onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
            testID="auth-switch-mode"
          />
        </View>

        <Caption style={styles.privacy}>
          Local-first. Você pode exportar ou apagar tudo a qualquer momento.
        </Caption>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  header: { marginBottom: spacing.xxl },
  tagline: {
    marginTop: spacing.sm,
    fontSize: font.size.sm,
    lineHeight: 20,
  },
  form: { gap: spacing.md },
  privacy: { marginTop: spacing.xl, lineHeight: 18 },
});
