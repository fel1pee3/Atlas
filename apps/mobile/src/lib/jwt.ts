/**
 * Decodifica payload JWT sem verificar assinatura (só leitura de `sub` no client).
 */
export function userIdFromAccessToken(token: string | null | undefined): string | null {
  if (!token) return null;
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const json = base64UrlDecode(part);
    const payload = JSON.parse(json) as { sub?: unknown };
    return typeof payload.sub === 'string' && payload.sub.length > 0 ? payload.sub : null;
  } catch {
    return null;
  }
}

function base64UrlDecode(input: string): string {
  const padded =
    input.replace(/-/g, '+').replace(/_/g, '/') +
    '='.repeat((4 - (input.length % 4)) % 4);
  if (typeof globalThis.atob === 'function') {
    return globalThis.atob(padded);
  }
  // Fallback Node / ambientes sem atob
  return Buffer.from(padded, 'base64').toString('utf8');
}
