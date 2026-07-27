import { userIdFromAccessToken } from './jwt';

function fakeJwt(sub: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ sub })).toString('base64url');
  return `${header}.${payload}.sig`;
}

describe('userIdFromAccessToken', () => {
  it('lê sub do JWT', () => {
    expect(userIdFromAccessToken(fakeJwt('user-123'))).toBe('user-123');
  });

  it('retorna null se inválido', () => {
    expect(userIdFromAccessToken(null)).toBeNull();
    expect(userIdFromAccessToken('not-a-jwt')).toBeNull();
  });
});
