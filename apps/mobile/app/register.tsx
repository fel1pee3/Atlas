import { AuthFormScreen } from '../src/features/auth/AuthFormScreen';

/**
 * Criar conta — rota explícita /register.
 */
export default function RegisterScreen() {
  return <AuthFormScreen mode="register" />;
}
