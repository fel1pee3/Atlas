export type PasswordRuleId =
  | 'length'
  | 'lower'
  | 'upper'
  | 'digit'
  | 'special';

export type PasswordRule = {
  id: PasswordRuleId;
  label: string;
  test: (password: string) => boolean;
};

/** Regras de senha no cadastro (espelha a API). */
export const PASSWORD_RULES: PasswordRule[] = [
  { id: 'length', label: 'Pelo menos 8 caracteres', test: (p) => p.length >= 8 },
  { id: 'lower', label: 'Uma letra minúscula', test: (p) => /[a-z]/.test(p) },
  { id: 'upper', label: 'Uma letra maiúscula', test: (p) => /[A-Z]/.test(p) },
  { id: 'digit', label: 'Um número', test: (p) => /\d/.test(p) },
  {
    id: 'special',
    label: 'Um símbolo (ex.: ! @ #)',
    test: (p) => /[^A-Za-z0-9]/.test(p),
  },
];

export function passwordMeetsAllRules(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}
