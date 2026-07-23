import { z } from 'zod';

/**
 * Validação de configuração no boot (falha rápido). Ver docs/09_Backend_Architecture.md §9.
 * Nunca lemos process.env espalhado pelo código — só através deste objeto tipado.
 */
const EnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    API_PORT: z.coerce.number().int().positive().default(3333),

    DATABASE_URL: z.string().url(),

    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.coerce.number().int().positive().default(6379),

    JWT_ACCESS_SECRET: z.string().min(16),
    JWT_REFRESH_SECRET: z.string().min(16),
    JWT_ACCESS_TTL: z.coerce.number().int().positive().default(900),
    JWT_REFRESH_TTL: z.coerce.number().int().positive().default(2_592_000),

    /** none | gemini — embeddings M6. Ver docs/14. */
    EMBEDDING_PROVIDER: z.enum(['none', 'gemini']).default('none'),
    GEMINI_API_KEY: z.string().optional().default(''),
    EMBEDDINGS_MODEL: z.string().default('gemini-embedding-001'),
    /** Dimensão do vetor (deve bater com migration vector(N)). */
    EMBEDDINGS_DIMENSIONS: z.coerce.number().int().positive().default(768),
  })
  .superRefine((env, ctx) => {
    if (env.EMBEDDING_PROVIDER === 'gemini' && !env.GEMINI_API_KEY.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['GEMINI_API_KEY'],
        message: 'obrigatória quando EMBEDDING_PROVIDER=gemini',
      });
    }
  });

export type Env = z.infer<typeof EnvSchema>;

let cached: Env | null = null;

export function loadEnv(): Env {
  if (cached) return cached;
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Configuração inválida (.env):\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}
