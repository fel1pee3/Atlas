jest.mock('../../lib/api', () => {
  class ApiError extends Error {
    status: number;
    problem: { title: string; status: number; detail: string; traceId?: string };
    constructor(
      status: number,
      problem: { title: string; status: number; detail: string; traceId?: string },
    ) {
      super(problem.detail || problem.title);
      this.name = 'ApiError';
      this.status = status;
      this.problem = problem;
    }
  }
  return {
    ApiError,
    isAbortLikeError: (err: unknown) => {
      if (!(err instanceof Error)) return false;
      const m = err.message.toLowerCase();
      return m.includes('abort') || m.includes('timeout após');
    },
  };
});

import { ApiError } from '../../lib/api';
import { humanizeAuthError } from './auth-errors';

describe('humanizeAuthError', () => {
  it('login 401 sem revelar se o e-mail existe e sem traceId', () => {
    const err = new ApiError(401, {
      title: 'Unauthorized',
      status: 401,
      detail: 'Credenciais inválidas.',
      traceId: 'fh87h4373h8abc',
    });
    const msg = humanizeAuthError(err, 'login');
    expect(msg).toBe('E-mail ou senha incorretos. Confira e tente de novo.');
    expect(msg).not.toMatch(/fh87|trace|Unauthorized/i);
  });

  it('cadastro com e-mail já usado orienta a entrar', () => {
    const err = new ApiError(409, {
      title: 'Conflict',
      status: 409,
      detail: 'E-mail já cadastrado.',
      traceId: 'abc123',
    });
    expect(humanizeAuthError(err, 'register')).toBe(
      'Este e-mail já tem conta. Entre com ele ou use outro e-mail.',
    );
  });

  it('rede sem jargão técnico', () => {
    const err = new ApiError(0, {
      title: 'Rede',
      status: 0,
      detail: 'Network request failed',
    });
    expect(humanizeAuthError(err, 'login')).toBe(
      'Sem conexão com o servidor. Confira a internet e tente de novo.',
    );
  });
});
