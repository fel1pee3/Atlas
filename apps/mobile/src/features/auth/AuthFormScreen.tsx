import { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../state/auth.store';
import { colors, spacing, font } from '../../theme';
import {
  Screen,
  BrandLockup,
  Caption,
  TextField,
  PasswordField,
  Button,
  Body,
} from '../../ui';
import { PASSWORD_RULES, passwordMeetsAllRules } from './password-rules';

type Mode = 'login' | 'register';

type Props = {
  mode: Mode;
};

/**
 * Formulário de autenticação — login e registro em telas separadas.
 */
export function AuthFormScreen({ mode }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const status = useAuth((s) => s.status);
  const login = useAuth((s) => s.login);
  const register = useAuth((s) => s.register);
  const error = useAuth((s) => s.error);
  const clearError = useAuth((s) => s.clearError);

  function clearErrors() {
    setLocalError(null);
    clearError();
  }

  const isLogin = mode === 'login';

  const ruleStates = useMemo(
    () => PASSWORD_RULES.map((rule) => ({ ...rule, ok: rule.test(password) })),
    [password],
  );

  async function submit() {
    setLocalError(null);

    if (!isLogin) {
      if (!passwordMeetsAllRules(password)) {
        setLocalError('Escolha uma senha que atenda a todos os requisitos.');
        return;
      }
      if (password !== confirm) {
        setLocalError('As senhas não coincidem.');
        return;
      }
    }

    setBusy(true);
    try {
      if (isLogin) await login(email.trim(), password);
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

  const shownError = localError ?? error;

  return (
    <Screen padded={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <BrandLockup markSize={28} style={styles.brand} />
          <Caption style={styles.tagline}>
            {isLogin
              ? 'Entre para continuar a sua timeline.'
              : 'Crie sua conta. Seus dados ficam sob o seu controle.'}
          </Caption>
        </View>

        <View style={styles.form}>
          <TextField
            placeholder="E-mail"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              clearErrors();
            }}
            testID="auth-email"
            accessibilityLabel="E-mail"
          />
          <PasswordField
            placeholder={isLogin ? 'Senha' : 'Senha'}
            autoComplete={isLogin ? 'password' : 'new-password'}
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              clearErrors();
            }}
            testID="auth-password"
            accessibilityLabel="Senha"
          />

          {!isLogin ? (
            <>
              <PasswordField
                placeholder="Confirmar senha"
                autoComplete="new-password"
                value={confirm}
                onChangeText={(v) => {
                  setConfirm(v);
                  clearErrors();
                }}
                testID="auth-password-confirm"
                accessibilityLabel="Confirmar senha"
                toggleAccessibilityLabel="Mostrar ou ocultar confirmação de senha"
              />
              <View style={styles.rules} accessibilityRole="summary">
                <Caption style={styles.rulesTitle}>Sua senha precisa ter:</Caption>
                {ruleStates.map((rule) => (
                  <Caption
                    key={rule.id}
                    style={[styles.rule, rule.ok ? styles.ruleOk : styles.rulePending]}
                  >
                    {rule.ok ? '✓' : '○'} {rule.label}
                  </Caption>
                ))}
              </View>
            </>
          ) : null}

          {shownError ? (
            <View style={styles.errorBox} accessibilityLiveRegion="polite">
              <Caption style={styles.errorText}>{shownError}</Caption>
            </View>
          ) : null}

          <Button
            label={isLogin ? 'Entrar' : 'Criar conta'}
            onPress={() => void submit()}
            busy={busy}
            testID="auth-submit"
          />

          <Pressable
            onPress={() => router.replace(isLogin ? '/register' : '/login')}
            style={styles.switchRow}
            accessibilityRole="button"
            testID="auth-switch-mode"
          >
            <Body tone="muted" style={styles.switchText}>
              {isLogin ? 'Ainda não tem conta? ' : 'Já tem conta? '}
              <Text style={styles.switchLink}>{isLogin ? 'Criar conta' : 'Entrar'}</Text>
            </Body>
          </Pressable>
        </View>

        <Caption style={styles.privacy}>
          Seus dados ficam no aparelho e na sua conta. Você pode exportar ou apagar tudo quando
          quiser.
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
  brand: { marginBottom: spacing.sm },
  tagline: {
    fontSize: font.size.sm,
    lineHeight: 20,
    maxWidth: 300,
  },
  form: { gap: spacing.md },
  errorBox: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    backgroundColor: 'rgba(196, 92, 92, 0.10)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(196, 92, 92, 0.35)',
  },
  errorText: {
    color: colors.danger,
    lineHeight: 20,
    fontSize: font.size.sm,
  },
  rules: {
    gap: 4,
    paddingTop: spacing.xs,
  },
  rulesTitle: {
    marginBottom: 2,
    color: colors.textMuted,
  },
  rule: {
    fontSize: font.size.sm,
    lineHeight: 18,
  },
  ruleOk: {
    color: colors.success,
  },
  rulePending: {
    color: colors.textSoft,
  },
  switchRow: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  switchText: {
    fontSize: font.size.sm,
    textAlign: 'center',
  },
  switchLink: {
    fontFamily: font.family.sansSemi,
    color: colors.primary,
  },
  privacy: {
    marginTop: spacing.xl,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 320,
    alignSelf: 'center',
  },
});
