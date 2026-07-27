import { z } from 'zod';

/** Senha forte no cadastro: 8+ · maiúscula · minúscula · número · símbolo. */
export const StrongPasswordSchema = z
  .string()
  .min(8, 'Senha deve ter ao menos 8 caracteres')
  .max(200)
  .regex(/[a-z]/, 'Senha deve ter uma letra minúscula')
  .regex(/[A-Z]/, 'Senha deve ter uma letra maiúscula')
  .regex(/\d/, 'Senha deve ter um número')
  .regex(/[^A-Za-z0-9]/, 'Senha deve ter um símbolo');

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: StrongPasswordSchema,
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const RefreshSchema = z.object({
  refreshToken: z.string().min(10),
});
export type RefreshInput = z.infer<typeof RefreshSchema>;
