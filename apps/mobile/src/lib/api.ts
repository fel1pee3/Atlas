import Constants from 'expo-constants';

/**
 * Cliente HTTP do Atlas (docs/17_API_Design.md).
 * - Base URL vem de app.json → extra.apiBaseUrl (ajuste p/ IP local em device físico).
 * - Injeta o access token e trata refresh transparente em 401.
 */
const BASE_URL: string =
  (Constants.expoConfig?.extra?.apiBaseUrl as string) ?? 'http://localhost:3333/api';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ProblemDetail {
  title: string;
  status: number;
  detail: string;
  traceId?: string;
  errors?: unknown;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly problem: ProblemDetail,
  ) {
    const suffix = problem.traceId ? ` [${problem.traceId}]` : '';
    super((problem.detail || problem.title) + suffix);
  }
}

type TokenProvider = () => string | null;
type RefreshHandler = () => Promise<string | null>;

let getAccessToken: TokenProvider = () => null;
let onNeedRefresh: RefreshHandler = async () => null;

/** Injeção a partir do store de auth (evita dependência circular). */
export function configureApi(opts: { getAccessToken: TokenProvider; onNeedRefresh: RefreshHandler }): void {
  getAccessToken = opts.getAccessToken;
  onNeedRefresh = opts.onNeedRefresh;
}

function parseBody(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { title: 'Resposta inválida', status: 0, detail: text.slice(0, 200) };
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  retryOn401 = true,
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new ApiError(0, {
      title: 'Rede',
      status: 0,
      detail: err instanceof Error ? err.message : 'Falha de rede',
    });
  }

  if (res.status === 401 && retryOn401) {
    const refreshed = await onNeedRefresh();
    if (refreshed) return request<T>(method, path, body, false);
  }

  const text = await res.text();
  const data = parseBody(text);

  if (!res.ok) {
    const problem =
      data && typeof data === 'object'
        ? (data as ProblemDetail)
        : { title: 'Erro', status: res.status, detail: text.slice(0, 200) };
    throw new ApiError(res.status, { ...problem, status: res.status });
  }
  return data as T;
}

export const api = {
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  get: <T>(path: string) => request<T>('GET', path),
  delete: <T>(path: string) => request<T>('DELETE', path),
  raw: request,
};

export const accountApi = {
  export: () => api.get<Record<string, unknown>>('/account/export'),
  delete: () => api.delete<{ deletedAt: string; userId: string }>('/account'),
  stats: () => api.get('/account/stats'),
};

export const authApi = {
  register: (email: string, password: string) =>
    api.post<AuthTokens>('/auth/register', { email, password }),
  login: (email: string, password: string) =>
    api.post<AuthTokens>('/auth/login', { email, password }),
  refresh: (refreshToken: string) =>
    api.post<AuthTokens>('/auth/refresh', { refreshToken }),
  logout: (refreshToken: string) => api.post<void>('/auth/logout', { refreshToken }),
};
