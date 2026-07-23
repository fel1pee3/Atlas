import { Injectable, Logger } from '@nestjs/common';
import { loadEnv } from '../../../shared/config/env';
import { EmbeddingProvider, EmbeddingTask } from '../domain/embedding.provider';

/**
 * Google Gemini Embeddings — tier gratuito (docs Gemini API pricing).
 * Modelo padrão: gemini-embedding-001 + outputDimensionality=768.
 * Não usa chat/LLM — só embedContent.
 */
@Injectable()
export class GeminiEmbeddingProvider extends EmbeddingProvider {
  private readonly logger = new Logger(GeminiEmbeddingProvider.name);
  private readonly apiKey: string;
  private readonly model: string;
  readonly dimensions: number;
  readonly modelId: string;

  constructor() {
    super();
    const env = loadEnv();
    this.apiKey = env.GEMINI_API_KEY;
    this.model = env.EMBEDDINGS_MODEL;
    this.dimensions = env.EMBEDDINGS_DIMENSIONS;
    this.modelId = `${this.model}:${this.dimensions}`;
  }

  isEnabled(): boolean {
    return Boolean(this.apiKey);
  }

  async embed(text: string, task: EmbeddingTask): Promise<number[]> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY ausente');
    }

    const taskType = task === 'query' ? 'RETRIEVAL_QUERY' : 'RETRIEVAL_DOCUMENT';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:embedContent`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.apiKey,
      },
      body: JSON.stringify({
        model: `models/${this.model}`,
        content: { parts: [{ text }] },
        taskType,
        outputDimensionality: this.dimensions,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      this.logger.warn(`Gemini embed falhou (${res.status}): ${body.slice(0, 400)}`);
      throw new Error(`Gemini embeddings HTTP ${res.status}`);
    }

    const json = (await res.json()) as {
      embedding?: { values?: number[] };
    };
    const values = json.embedding?.values;
    if (!values?.length) {
      throw new Error('Resposta Gemini sem embedding.values');
    }
    if (values.length !== this.dimensions) {
      this.logger.warn(
        `Dimensão inesperada: got ${values.length}, expected ${this.dimensions}`,
      );
    }

    // Gemini recomenda normalizar quando outputDimensionality < nativo (3072).
    return l2Normalize(values);
  }
}

function l2Normalize(values: number[]): number[] {
  let sumSq = 0;
  for (const v of values) sumSq += v * v;
  const norm = Math.sqrt(sumSq);
  if (norm === 0) return values;
  return values.map((v) => v / norm);
}
