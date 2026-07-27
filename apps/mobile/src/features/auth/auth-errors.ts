import { ApiError, isAbortLikeError } from '../../lib/api';

export type AuthMode = 'login' | 'register';

/**
 * Mensagens de auth seguras e legíveis — sem traceId, sem jargão de API.
 * Login nunca revela se o e-mail existe; cadastro só orienta sem detalhes técnicos.
 */
export function humanizeAuthError(err: unknown, mode: AuthMode): string {
  if (isAbortLikeError(err)) {
    return 'A conexão demorou demais. Confira a internet e tente de novo.';
  }

  if (err instanceof ApiError) {
    const detail = (err.problem.detail || err.problem.title || '').toLowerCase();

    if (err.status === 0) {
      return 'Sem conexão com o servidor. Confira a internet e tente de novo.';
    }

    if (mode === 'login') {
      if (err.status === 401 || detail.includes('credencial')) {
        return 'E-mail ou senha incorretos. Confira e tente de novo.';
      }
      if (err.status === 400 || err.status === 422) {
        return 'Confira o e-mail e a senha e tente de novo.';
      }
      if (err.status >= 500) {
        return 'Não foi possível entrar agora. Tente de novo em instantes.';
      }
      return 'Não foi possível entrar. Tente de novo.';
    }

    // register
    if (
      err.status === 409 ||
      detail.includes('já cadastrado') ||
      detail.includes('already') ||
      detail.includes('existe')
    ) {
      return 'Este e-mail já tem conta. Entre com ele ou use outro e-mail.';
    }
    if (err.status === 400 || err.status === 422) {
      if (detail.includes('senha') || detail.includes('password')) {
        return 'A senha não atende aos requisitos. Ajuste e tente de novo.';
      }
      if (detail.includes('email') || detail.includes('e-mail')) {
        return 'Esse e-mail não parece válido. Confira e tente de novo.';
      }
      return 'Não foi possível criar a conta. Confira os dados e tente de novo.';
    }
    if (err.status >= 500) {
      return 'Não foi possível criar a conta agora. Tente de novo em instantes.';
    }
    return 'Não foi possível criar a conta. Tente de novo.';
  }

  return mode === 'login'
    ? 'Não foi possível entrar. Tente de novo.'
    : 'Não foi possível criar a conta. Tente de novo.';
}
