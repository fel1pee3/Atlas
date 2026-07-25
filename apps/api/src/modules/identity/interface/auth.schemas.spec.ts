import { LoginSchema, RefreshSchema, RegisterSchema } from './auth.schemas';

describe('Auth Zod schemas', () => {
  describe('RegisterSchema', () => {
    it('aceita e-mail/senha válidos', () => {
      const parsed = RegisterSchema.parse({
        email: 'user@atlas.test',
        password: 'senha-segura',
      });
      expect(parsed.email).toBe('user@atlas.test');
    });

    it('rejeita senha curta', () => {
      expect(() =>
        RegisterSchema.parse({ email: 'user@atlas.test', password: '123' }),
      ).toThrow();
    });

    it('rejeita e-mail inválido', () => {
      expect(() =>
        RegisterSchema.parse({ email: 'nao-email', password: 'senha-segura' }),
      ).toThrow();
    });
  });

  describe('LoginSchema', () => {
    it('aceita login mínimo', () => {
      expect(
        LoginSchema.parse({ email: 'a@b.com', password: 'x' }).email,
      ).toBe('a@b.com');
    });
  });

  describe('RefreshSchema', () => {
    it('exige refreshToken com tamanho mínimo', () => {
      expect(() => RefreshSchema.parse({ refreshToken: 'short' })).toThrow();
      expect(
        RefreshSchema.parse({ refreshToken: '1234567890abcdef' }).refreshToken,
      ).toHaveLength(16);
    });
  });
});
