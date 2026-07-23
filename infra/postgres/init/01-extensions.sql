-- =============================================================================
-- Atlas — inicialização do PostgreSQL (executado 1x na criação do volume)
-- Ver docs/10_Database_Design.md §4.2
-- =============================================================================

-- gen_random_uuid() para chaves primárias UUID
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Busca semântica (embeddings) sem infra extra no MVP (ADR-0004/0008)
CREATE EXTENSION IF NOT EXISTS vector;
