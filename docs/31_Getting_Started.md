# 31 — Getting Started (Docs → Código)

> **Fase:** 🟢 MVP · **Marco atual:** **M6** (Busca semântica — pgvector + Gemini Embeddings) · **Leia antes:** [`20_MVP.md`](20_MVP.md) §2.4 · [`14_Vector_Search.md`](14_Vector_Search.md)
> **Objetivo:** colocar o Atlas rodando localmente e explicar a estrutura do código.

---

## 1. Marcos

| Marco | Status |
|---|---|
| M0–M5 | ✅ |
| **M6 Busca semântica** | ✅ |

### M6 — o que entrou

Busca em linguagem natural sobre o CMHL com **pgvector** + **Gemini Embeddings** (tier gratuito — **não** é chat/LLM):

- ✅ Tabelas `embeddings` + `embedding_cache` (vector 768, índice HNSW cosine)
- ✅ `EmbeddingProvider` abstrato + `GeminiEmbeddingProvider` (`gemini-embedding-001`)
- ✅ Indexação best-effort na ingestão de eventos e na geração de insights
- ✅ Cache por `sha256(conteúdo)` — não re-chama a API se o texto não mudou
- ✅ `GET /api/search?q=&mode=semantic|keyword` + `POST /api/search/reindex`
- ✅ Tela **Busca** no mobile (Hoje → Busca)

Modelo padrão: `gemini-embedding-001` com `outputDimensionality=768` (free tier no Gemini API). Chat Gemini/OpenAI **não** é usado no M6.

---

## 2. Ativar busca semântica (Gemini)

1. Crie uma API key em [Google AI Studio](https://aistudio.google.com/apikey)
2. No `.env` da raiz:

```env
EMBEDDING_PROVIDER=gemini
GEMINI_API_KEY=sua_chave_aqui
```

(`EMBEDDINGS_MODEL` / `EMBEDDINGS_DIMENSIONS` já têm default no código.)

3. Reinicie a API (`npm run dev:api`)
4. No app: **Busca → Reindexar memória** (para eventos/insights já existentes)
5. Pesquise algo como `ansiedade` ou `reunião` (notas/calendário Demo ajudam)

Sem chave (`EMBEDDING_PROVIDER=none`): app e insights continuam ok; use `mode=keyword` na busca ou ative o Gemini.

---

## 3. Como validar

```bash
npm run infra:up
cd apps/api && npx dotenv -e ../../.env -- prisma migrate deploy
npm run dev:api
# Expo: Hoje → Busca
```

Checklist:

1. Registrar uma nota manual (“fico nervoso na véspera da prova”)
2. Com Gemini ligado, buscar “ansiedade antes de exame” → deve achar a nota
3. Keyword mode acha por substring mesmo sem embeddings

---

## 4. Próximos passos

Pelo roadmap [`20`](20_MVP.md) / [`21`](21_Roadmap.md):

- **M7 — Privacidade MVP:** export/delete total (inclui embeddings)
- **M8 — Hardening**
- **V1:** conectores nativos reais; LLM só para redigir (opt-in)

---

### Resumo
O CMHL agora é **interrogável por significado** via Gemini Embeddings + pgvector, sem chatbot.
