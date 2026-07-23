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
  errors?: unknown;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly problem: ProblemDetail,
  ) {
    super(problem.detail || problem.title);
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

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  retryOn401 = true,
): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && retryOn401) {
    const refreshed = await onNeedRefresh();
    if (refreshed) return request<T>(method, path, body, false);
  }

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    throw new ApiError(res.status, data as ProblemDetail);
  }
  return data as T;
}

export const api = {
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  get: <T>(path: string) => request<T>('GET', path),
  raw: request,
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
