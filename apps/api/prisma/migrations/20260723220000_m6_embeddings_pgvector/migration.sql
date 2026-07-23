-- M6: busca semântica com pgvector (docs/10, docs/14, ADR-0004).
-- Dimensão fixa 768 (gemini-embedding-001 + outputDimensionality).

CREATE EXTENSION IF NOT EXISTS vector;

-- Embeddings indexados por dono (evento | insight)
CREATE TABLE "embeddings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "owner_type" TEXT NOT NULL,
    "owner_id" UUID NOT NULL,
    "content_hash" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "embedding" vector(768) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "embeddings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "embeddings_owner_type_owner_id_model_key"
    ON "embeddings"("owner_type", "owner_id", "model");

CREATE INDEX "embeddings_user_id_content_hash_model_idx"
    ON "embeddings"("user_id", "content_hash", "model");

CREATE INDEX "embeddings_user_id_idx" ON "embeddings"("user_id");

ALTER TABLE "embeddings"
    ADD CONSTRAINT "embeddings_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Índice ANN (cosine) — docs/14 HNSW
CREATE INDEX "embeddings_embedding_hnsw_idx"
    ON "embeddings"
    USING hnsw ("embedding" vector_cosine_ops);

-- Cache de vetores reutilizável entre owners com o mesmo texto
CREATE TABLE "embedding_cache" (
    "content_hash" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "embedding" vector(768) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "embedding_cache_pkey" PRIMARY KEY ("content_hash", "model")
);
