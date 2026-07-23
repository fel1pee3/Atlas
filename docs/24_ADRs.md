# 24 — Architecture Decision Records (ADRs)

> **Leia antes:** [`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md) · **Relacionados:** todos os docs de arquitetura (07–17).

---

## O que é um ADR (e por que usamos)

Um **Architecture Decision Record** é um documento curto e imutável que registra **uma** decisão
arquitetural significativa: o **contexto**, a **decisão**, as **alternativas** e as
**consequências**. Formato inspirado em Michael Nygard.

**Por que:** decisões arquiteturais são caras de reverter e fáceis de esquecer *por que* foram
tomadas. Meses depois, "por que não usamos microserviços?" tem resposta escrita. Para um
**fundador solo**, o ADR é a memória de longo prazo do próprio projeto — e a prova, numa
entrevista/banca, de que cada escolha foi **deliberada, não acidental**.

**Regras:**
- ADR é **imutável**. Mudou de ideia? Crie um novo ADR que **supersede** o antigo (marque como
  `Superseded by ADR-XXXX`).
- Status: `Proposed` → `Accepted` → (`Superseded`/`Deprecated`).
- Escopo: só decisões **estruturais/reversibilidade cara**. Não registre escolha de nome de
  variável.

### Template

```
# ADR-XXXX: <título>
Status: Accepted | Proposed | Superseded by ADR-YYYY
Data: AAAA-MM-DD
## Contexto
## Decisão
## Alternativas consideradas
## Consequências (positivas / negativas / neutras)
## Fase / gatilho de reavaliação
```

---

## ADR-0001: Modular Monolith (NestJS) em vez de microserviços
**Status:** Accepted · **Data:** 2026-07-20 · **Fase:** 🟢

**Contexto.** Fundador solo, zero usuários, objetivo de velocidade + qualidade. Microserviços
trazem overhead operacional (N deploys, contratos versionados, tracing distribuído, sagas).

**Decisão.** Backend como **monólito modular** NestJS com fronteiras de bounded context claras
e comunicação interna por ports + event bus in-process.

**Alternativas.** (a) Microserviços — rejeitado: custo sem benefício sem escala. (b) Monólito
sem módulos — rejeitado: vira "big ball of mud".

**Consequências.** ➕ Deploy/debug/transações simples; dev rápido. ➖ Escala junto (mitigável
com réplicas stateless). ➖ Requer disciplina de fronteiras.

**Gatilho de reavaliação.** 🟠 Escala: extrair módulo específico via *Strangler Fig* quando
houver gargalo **medido**. Ver `07` §3, `09`.

---

## ADR-0002: Event Sourcing "lite" em vez de ES/CQRS completo
**Status:** Accepted · **Data:** 2026-07-20 · **Fase:** 🟢

**Contexto.** O domínio do Atlas **é** eventos da vida (timeline). ES natural, mas ES completo
(event store, versionamento, sagas, CQRS obrigatório) é complexo demais para o MVP.

**Decisão.** Tabela `events` **append-only** (fonte da verdade) + **read models** derivados por
workers. Sem framework de ES, sem CQRS estrito.

**Alternativas.** (a) CRUD tradicional — rejeitado: perde auditoria/reprocessamento, mal casa
com o produto. (b) ES completo — rejeitado: overkill/risco no MVP.

**Consequências.** ➕ Auditável, reprocessável, explicável; base do produto. ➖ Precisa cuidar de
idempotência e eventos tardios.

**Gatilho.** 🟡 CQRS/ES formais quando leituras exigirem modelos dedicados/escala independente.
Ver `09` §6, `11`.

---

## ADR-0003: Local-first com sync engine próprio simples (não CRDT)
**Status:** Accepted · **Data:** 2026-07-20 · **Fase:** 🟢

**Contexto.** Privacidade e offline são pilares. Sincronização device↔cloud é necessária. CRDTs
resolvem conflitos multi-device elegantemente, mas são complexos.

**Decisão.** Sync incremental próprio: push/pull por `updated_at` + fila de mutações offline +
resolução last-write-wins com relógio/versão simples + tombstones para deleção.

**Alternativas.** (a) CRDTs (Yjs/Automerge) — adiado: complexidade alta; MVP tem 1 device/usuário
predominante. (b) Sem offline (só online) — rejeitado: fere local-first.

**Consequências.** ➕ Simples, suficiente p/ 1–2 devices. ➖ Conflitos multi-device concorrentes
mal resolvidos (aceitável no MVP).

**Gatilho.** 🔴 Pesquisa/🟡: CRDTs se colaboração/multi-device concorrente virar dor. Ver `08`.

---

## ADR-0004: PostgreSQL como store primário; pgvector para busca semântica
**Status:** Accepted · **Data:** 2026-07-20 · **Fase:** 🟢

**Contexto.** Precisamos de relacional + documentos flexíveis + vetores + grafo-lite + FTS.
Múltiplos bancos = múltipla operação para solo dev.

**Decisão.** **Um** PostgreSQL fazendo tudo: JSONB (eventos), pgvector (embeddings), CTE
recursiva (grafo-lite), FTS (busca lexical). Redis só p/ cache/filas.

**Alternativas.** (a) Poliglota desde o dia 1 (Postgres+Neo4j+Qdrant) — rejeitado: complexidade
prematura. (b) MongoDB — rejeitado: perde integridade/relacional cross-domain.

**Consequências.** ➕ 1 banco p/ operar/backup; poderoso. ➖ Não é ótimo em grafo profundo nem em
vetores em escala (aceitável até o gatilho).

**Gatilho.** Ver ADR-0007 (Neo4j) e ADR-0008 (Qdrant). Ver `10`.

---

## ADR-0005: REST + OpenAPI no MVP; GraphQL/gRPC adiados
**Status:** Accepted · **Data:** 2026-07-20 · **Fase:** 🟢

**Contexto.** Um cliente (mobile) + um backend. Autor domina REST.

**Decisão.** **REST** com contrato **OpenAPI** (gera tipos/cliente). Sync via endpoints REST.

**Alternativas.** (a) GraphQL — adiado: valor real (over/under-fetching) aparece com múltiplas
telas/clientes. (b) gRPC — adiado: útil entre serviços (não temos).

**Consequências.** ➕ Simples, cacheável, domínio do autor. ➖ Over/under-fetching eventual
(tolerável no MVP).

**Gatilho.** 🟡 GraphQL BFF para mobile; 🟠 gRPC entre serviços extraídos. Ver `17`.

---

## ADR-0006: LLM via API com camada de abstração; heurística antes de LLM
**Status:** Accepted · **Data:** 2026-07-20 · **Fase:** 🟢

**Contexto.** Mercado de LLM muda rápido; custo é sensível; IA não deve ser lock-in.

**Decisão.** `LLMProvider`/`EmbeddingProvider` como interfaces; provedores concretos trocáveis.
Subir a "escada de inteligência" (regras→estatística→…→LLM) usando o degrau mais barato.

**Alternativas.** (a) Casar com 1 provedor — rejeitado: lock-in/risco. (b) Self-host LLM no MVP —
rejeitado: custo/complexidade.

**Consequências.** ➕ Trocável, barato, explicável. ➖ Abstração custa um pouco de indireção.

**Gatilho.** 🟡 On-device; 🟠 pipelines de ML próprios. Ver `12`.

---

## ADR-0007: Grafo de conhecimento em PostgreSQL primeiro; Neo4j na V2
**Status:** Accepted · **Data:** 2026-07-20 · **Fase:** 🟢 → 🟡

**Contexto.** O CMHL tem relações (grafo). Neo4j é ótimo para grafo, mas é +1 banco a operar.

**Decisão.** Grafo-lite em `entities`+`relationships` no Postgres, com CTEs recursivas. Neo4j só
quando travessias profundas/pathfinding doerem.

**Alternativas.** (a) Neo4j desde o MVP — rejeitado: complexidade prematura. (b) Só relacional
para sempre — rejeitado: não escala para grafo profundo.

**Consequências.** ➕ Zero infra extra no MVP. ➖ CTEs ficam lentas/complexas em 3+ hops.

**Gatilho.** 🟡 Neo4j quando queries multi-hop/pathfinding forem lentas ou frequentes. Ver `13`.

---

## ADR-0008: Qdrant adiado até pgvector limitar
**Status:** Accepted · **Data:** 2026-07-20 · **Fase:** 🟢 → 🟡

**Contexto.** Busca semântica é core. pgvector (HNSW) resolve bem em volumes moderados.

**Decisão.** pgvector no MVP. Qdrant só quando volume/latência/filtragem justificarem infra
dedicada.

**Alternativas.** (a) Qdrant/Pinecone/Weaviate desde já — rejeitado: prematuro. (b) FAISS
on-device — considerado p/ 🟡 (privacidade).

**Consequências.** ➕ Sem infra extra. ➖ Teto de escala/latência do pgvector.

**Gatilho.** 🟡 métricas de latência p95 da busca degradando ou milhões de vetores. Ver `14`.

---

## ADR-0009: React Native + Expo como cliente único
**Status:** Accepted · **Data:** 2026-07-20 · **Fase:** 🟢

**Contexto.** Precisamos de iOS+Android; autor domina RN; velocidade importa.

**Decisão.** **React Native + Expo** (dev client/prebuild), TypeScript, OTA via EAS Update.

**Alternativas.** (a) Flutter — rejeitado: nova linguagem/curva. (b) Nativo 2x — rejeitado:
inviável p/ solo. (c) KMP — rejeitado: imaturo p/ UI/curva.

**Consequências.** ➕ 1 codebase, dev rápido, OTA. ➖ Módulos nativos exigem config plugins;
alguns limites (widgets, background) exigem código nativo pontual.

**Gatilho.** 🟡 módulos nativos dedicados quando um recurso exigir. Ver `08`.

---

## ADR-0010: Privacidade local-first como restrição arquitetural inegociável
**Status:** Accepted · **Data:** 2026-07-20 · **Fase:** 🟢 (atemporal)

**Contexto.** O produto pede permissão para ver a vida inteira do usuário. Sem confiança, não há
produto. Um vazamento é fatal.

**Decisão.** Local-first (device é fonte primária), minimização, opt-in de IA, export/delete
totais, criptografia em trânsito/repouso, roadmap E2EE. Privacidade restringe todas as demais
decisões.

**Alternativas.** (a) Cloud-first com dados em claro — rejeitado: risco existencial/ético. 

**Consequências.** ➕ Confiança = moat; conformidade LGPD/GDPR facilitada. ➖ Algumas features de
IA no servidor ficam mais difíceis (mitigado por opt-in/on-device).

**Gatilho.** 🟡 E2EE; 🟡 on-device para dados sensíveis. Ver `15`, `16`.

---

## ADR-0011: Hospedagem pragmática e reversível (PaaS permitido no MVP)
**Status:** Accepted · **Data:** 2026-07-20 · **Fase:** 🟢 → 🟡

**Contexto.** O Master Context §5.5 fixava AWS (1 região) como infra do MVP. Porém, para um
**fundador solo** priorizando velocidade e custo baixo, plataformas PaaS (Fly.io, Railway,
Render) entregam Postgres + Redis + deploy contínuo com **fração do esforço operacional** de
montar ECS/RDS/ElastiCache. A infra do MVP não é diferencial competitivo — é custo a minimizar.

**Decisão.** Permitir **PaaS (Fly.io/Railway/Render) OU AWS** no MVP, à escolha do autor, como
decisão **reversível**. O backend é Docker + 12-factor (config via env), portanto **portável**
entre PaaS e AWS sem reescrita. Consolidar em **AWS** quando surgir necessidade de controle fino
(VPC, RLS gerenciado, compliance, multi-AZ/região) ou economia em escala.

**Alternativas.** (a) AWS desde o dia 1 — não rejeitada, mas não obrigatória: mais controle, porém
mais tempo/complexidade para solo dev. (b) Servidor único “na unha” (VPS + Docker) — viável e
barato, mas exige mais operação manual (backups, TLS, monitoramento).

**Consequências.** ➕ Menor tempo até produção; custo inicial menor; foco no produto. ➖ Menos
controle fino; possível migração futura (mitigada pela portabilidade Docker/12-factor). ➖ Risco de
lock-in leve do PaaS (mitigado por manter tudo containerizado e IaC quando entrar Terraform 🟡).

**Gatilho de reavaliação.** 🟡 Migrar/consolidar em AWS quando: compliance exigir VPC/isolamento,
custo de PaaS ultrapassar o de AWS em escala, ou for preciso multi-AZ/região. Ver `27` §ambientes/cloud.

---

## Índice de decisões e superseção

| ADR | Decisão | Status | Fase | Reavaliar em |
|---|---|---|---|---|
| 0001 | Monólito modular | Accepted | 🟢 | 🟠 |
| 0002 | ES "lite" | Accepted | 🟢 | 🟡 |
| 0003 | Sync próprio (não CRDT) | Accepted | 🟢 | 🟡/🔴 |
| 0004 | PostgreSQL primário + pgvector | Accepted | 🟢 | 🟡 |
| 0005 | REST + OpenAPI | Accepted | 🟢 | 🟡 |
| 0006 | LLM via API + abstração | Accepted | 🟢 | 🟡 |
| 0007 | Grafo em Postgres → Neo4j | Accepted | 🟢→🟡 | 🟡 |
| 0008 | pgvector → Qdrant | Accepted | 🟢→🟡 | 🟡 |
| 0009 | React Native + Expo | Accepted | 🟢 | 🟡 |
| 0010 | Privacidade local-first | Accepted | 🟢 | atemporal |
| 0011 | Hospedagem pragmática (PaaS ou AWS) | Accepted | 🟢→🟡 | 🟡 |

> **Como adicionar um ADR:** copie o template, numere sequencialmente, escreva o contexto/decisão
> honestamente (inclusive o que você NÃO sabe), e linke do doc de arquitetura relevante.

---

### Resumo executivo
Os ADRs registram as **11 decisões estruturais** do Atlas, todas guiadas pelo mesmo princípio:
**máxima capacidade de engenharia que um fundador solo consegue sustentar hoje, com costuras
para evoluir amanhã**. Cada decisão tem alternativas avaliadas e um **gatilho de reavaliação**
por fase — transformando "escolhas por hábito" em **escolhas defensáveis** diante de qualquer
engenheiro sênior ou banca.
