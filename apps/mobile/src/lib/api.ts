import Constants from 'expo-constants';

/**
 * Cliente HTTP do Atlas (docs/17_API_Design.md).
 * - Base URL vem de app.json → extra.apiBaseUrl.
 * - Injeta access token e refresh em 401.
 * - Timeout evita spinner eterno; abort do RN vira mensagem clara (não "fetch canceled").
 */
const BASE_URL: string =
  (Constants.expoConfig?.extra?.apiBaseUrl as string) ?? 'http://localhost:3333/api';

const DEFAULT_TIMEOUT_MS = 25_000;
const BATCH_TIMEOUT_MS = 60_000;
const LONG_TIMEOUT_MS = 60_000;

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
    // Mensagem sem traceId — IDs ficam só em `problem` (logs/debug), não na UI.
    super(problem.detail || problem.title || 'Erro');
    this.name = 'ApiError';
  }
}

export type RequestOptions = {
  timeoutMs?: number;
  retryOn401?: boolean;
};

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

/** React Native costuma emitir "Fetch request has been canceled" em vez de AbortError. */
export function isAbortLikeError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  if (err.name === 'AbortError') return true;
  const m = err.message.toLowerCase();
  return (
    m.includes('abort') ||
    m.includes('cancel') ||
    m.includes('timeout após') ||
    m.includes('rede lenta')
  );
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  opts: RequestOptions = {},
): Promise<T> {
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retryOn401 = opts.retryOn401 ?? true;
  const token = getAccessToken();
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    if (isAbortLikeError(err)) {
      throw new ApiError(0, {
        title: 'Rede',
        status: 0,
        detail: `Timeout após ${timeoutMs}ms`,
      });
    }
    throw new ApiError(0, {
      title: 'Rede',
      status: 0,
      detail: err instanceof Error ? err.message : 'Falha de rede',
    });
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 401 && retryOn401) {
    const refreshed = await onNeedRefresh();
    if (refreshed) return request<T>(method, path, body, { ...opts, retryOn401: false });
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
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('POST', path, body, opts),
  get: <T>(path: string, opts?: RequestOptions) => request<T>('GET', path, undefined, opts),
  delete: <T>(path: string, opts?: RequestOptions) => request<T>('DELETE', path, undefined, opts),
  raw: request,
  timeouts: {
    default: DEFAULT_TIMEOUT_MS,
    batch: BATCH_TIMEOUT_MS,
    long: LONG_TIMEOUT_MS,
  },
};

export const accountApi = {
  export: () =>
    api.get<Record<string, unknown>>('/account/export', { timeoutMs: api.timeouts.long }),
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
