import { AuthFormScreen } from '../src/features/auth/AuthFormScreen';

/**
 * Entrar — rota explícita /login.
 */
export default function LoginScreen() {
  return <AuthFormScreen mode="login" />;
}
