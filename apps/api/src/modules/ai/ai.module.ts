import { Module } from '@nestjs/common';
import { loadEnv } from '../../shared/config/env';
import { EmbeddingProvider } from './domain/embedding.provider';
import { GeminiEmbeddingProvider } from './infrastructure/gemini-embedding.provider';
import { NoneEmbeddingProvider } from './infrastructure/none-embedding.provider';

/**
 * Infra de IA opt-in (ADR-0006). MVP: só embeddings Gemini — sem chat/LLM.
 */
@Module({
  providers: [
    {
      provide: EmbeddingProvider,
      useFactory: (): EmbeddingProvider => {
        const env = loadEnv();
        if (env.EMBEDDING_PROVIDER === 'gemini') {
          return new GeminiEmbeddingProvider();
        }
        return new NoneEmbeddingProvider();
      },
    },
  ],
  exports: [EmbeddingProvider],
})
export class AiModule {}
