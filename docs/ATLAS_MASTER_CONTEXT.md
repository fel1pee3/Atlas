# Atlas — Documento-Mestre de Contexto e Decisões (Single Source of Truth)

> **Status:** Vivo (living document) · **Versão:** 0.1 · **Última atualização:** 2026-07-20
> **Propósito:** Este é o documento canônico que fixa a tese, o vocabulário, as decisões
> arquiteturais e as fases de evolução do Atlas. Todos os outros documentos (`00`–`30`)
> **devem** ser consistentes com este. Em caso de conflito, este documento vence — até que
> seja explicitamente atualizado por um ADR (ver `24_ADRs.md`).

---

## 0. Como ler esta documentação

Esta documentação é escrita em três camadas simultâneas, porque o autor tem três objetivos:

1. **Construir** um produto real (fundador solo).
2. **Aprender** profundamente (nunca tratar nada como caixa-preta).
3. **Defender** o projeto (entrevista Big Tech, banca de mestrado, investidores).

Por isso, todo conceito técnico é explicado com a seguinte anatomia sempre que aparece pela
primeira vez:

- **O que é** (definição precisa)
- **Por que existe / que problema resolve**
- **Como funciona** (incluindo a matemática/mecânica quando relevante)
- **Como se implementa** (no nosso stack)
- **Alternativas** e **trade-offs**
- **Quando usar / quando NÃO usar**
- **Custo, escalabilidade, limitações, riscos**
- **Como será usado no Atlas** e **em qual fase entra**

---

## 1. Tese em uma frase

> **Atlas é uma Plataforma de Inteligência Pessoal (Personal Intelligence Platform) que
> constrói, de forma privada e local-first, um Modelo Computacional da Vida (Computational
> Model of Human Life — CMHL): uma representação estruturada e viva dos eventos, pessoas,
> lugares, hábitos, documentos e objetivos de uma pessoa, sobre a qual a IA atua apenas como
> um interpretador — nunca como o produto.**

### 1.1. O que Atlas NÃO é
- Não é um chatbot com memória.
- Não é um app de produtividade / to-do list.
- Não é um dashboard de "quantified self".
- Não é um assistente de voz.

### 1.2. O que Atlas É
- Uma **infraestrutura**: um núcleo computacional (o CMHL) sobre o qual dezenas de produtos
  podem ser construídos (memória, finanças, saúde, estudos, rotina...).
- Um **grafo temporal**: eventos ao longo do tempo + relações entre entidades.
- Um **motor de inferência explicável**: transforma dados dispersos em conhecimento
  ("dados → informação → conhecimento → sabedoria acionável").

### 1.3. O fosso competitivo (moat)
O diferencial **não** é a IA (qualquer um chama uma API de LLM). O fosso é o **CMHL
acumulado ao longo dos anos** — um ativo que:
- só o Atlas possui (dados unificados e cross-domain do usuário),
- melhora com o tempo (efeito de composição / data network effect de um usuário só),
- é caro de replicar (integrações + modelagem + confiança/privacidade).

---

## 2. Vocabulário canônico (glossário)

Estes termos têm significado fixo em TODA a documentação. Use exatamente estes nomes.

| Termo | Definição canônica |
|---|---|
| **CMHL** | *Computational Model of Human Life*. O modelo estruturado da vida do usuário. É a soma de: Timeline de Eventos + Grafo de Conhecimento + Memória Semântica + Read Models/Agregações. |
| **Event (Evento)** | Fato imutável que aconteceu num instante (ou intervalo), atribuído a uma pessoa (`user_id`), com tipo, origem, timestamp e payload. Ex.: `sleep.recorded`, `location.visited`, `transaction.made`. É a **unidade atômica** do Atlas. |
| **Entity (Entidade)** | "Coisa" persistente referenciada por eventos: `Person`, `Place`, `Document`, `Habit`, `Goal`, `Organization`, `Topic`. Nós do grafo. |
| **Relationship (Relação)** | Aresta entre entidades/eventos no grafo (ex.: `Person —WORKS_AT→ Organization`, `Event —OCCURRED_AT→ Place`). |
| **Connector (Conector)** | Módulo que ingere dados de uma fonte (Health Connect, Google Calendar, extrato bancário, entrada manual) e os normaliza em Eventos. |
| **Insight** | Conhecimento derivado e **explicável** ("você dorme 40min a menos nas noites após treino tarde"). Sempre com evidência rastreável até os eventos que o originaram. |
| **Read Model / Projeção** | Visão materializada e otimizada para leitura, derivada dos eventos (ex.: agregação diária de sono). |
| **Snapshot** | Estado consolidado do CMHL (ou de uma projeção) num ponto no tempo, para acelerar leituras e queries históricas. |
| **Inference Pipeline** | Cadeia de processamento (regras → estatística → ML → LLM) que gera Insights a partir de Eventos. |
| **Local-first** | O dispositivo do usuário é a fonte primária de verdade; a nuvem é réplica/serviço opcional (ver §6). |

---

## 3. Perfil e restrições do time (contexto de decisão)

- **Time:** 1 pessoa (fundador-desenvolvedor). Sem investimento, sem prazo comercial.
- **Stack de domínio do autor:** React Native, TypeScript, NestJS, Node.js, PostgreSQL,
  Prisma, Docker, Redis, BullMQ, AWS, Git, GitHub Actions, REST, JWT, Clean Arch, DDD
  (intermediário), Mobile, SaaS multi-tenant.
- **Princípio-mestre:** *"Projete como um arquiteto sênior; pense como um fundador solo."*
- **Lema de execução:** *Make it work → Make it right → Make it scalable.*
- **Anti-objetivo:** **evitar complexidade prematura.** Nada de microserviços, Kafka, Neo4j
  ou Qdrant no MVP "porque é moderno". Toda tecnologia precisa de justificativa e de uma
  **fase de entrada** definida.

---

## 4. Sistema de fases (usado em TODA a documentação)

Toda funcionalidade e decisão técnica recebe **um** rótulo de fase:

| Rótulo | Nome | Gatilho de entrada |
|---|---|---|
| 🟢 **MVP** | Obrigatório | Necessário para provar a tese com o próprio autor + poucos usuários. |
| 🔵 **V1** | Pós-lançamento | Logo após o MVP funcionar de ponta a ponta. |
| 🟡 **V2** | Com usuários reais | Quando há tração e dor real justificando complexidade. |
| 🟠 **Escala** | Milhares–milhões | Quando limites de performance/custo forçam a mudança. |
| 🔴 **Pesquisa** | Futuro | Ideias de fronteira; não implementar agora. |

**Regra dura:** nunca colocar item de 🟡/🟠 dentro do 🟢 MVP.

---

## 5. Stack canônico por fase (DECISÕES FIXADAS)

> Justificativas completas em `07`, `09`, `10`, `12`; registro formal em `24_ADRs.md`.

### 5.1. Mobile (cliente principal)
| Camada | 🟢 MVP | Evolução |
|---|---|---|
| Framework | **React Native + Expo** (dev mais rápido, OTA, domínio do autor) | Ejetar módulos nativos só quando necessário |
| Linguagem | **TypeScript** | — |
| DB local | **Expo SQLite + Drizzle ORM** (offline-first) | WatermelonDB se sync ficar pesado (🟡) |
| Estado | **Zustand** + TanStack Query | — |
| Sync | **Sync engine próprio simples** (push/pull incremental por `updated_at` + fila de mutações) | CRDTs (🔴 pesquisa) se colaboração multi-device conflituosa |
| Sensores | Health Connect (Android), HealthKit (iOS), Location, Motion | Mais sensores (🔵/🟡) |
| Background | Expo Task Manager / BackgroundFetch | WorkManager nativo (🟡) |

### 5.2. Backend
| Camada | 🟢 MVP | Evolução |
|---|---|---|
| Framework | **NestJS (Modular Monolith)** | Extração via *strangler* para serviços (🟠) |
| Arquitetura | **Clean Architecture + DDD** por módulo | — |
| Padrão de escrita | **Event Sourcing "lite"** (tabela append-only `events` + read models derivados) | Event Sourcing + CQRS formais (🟡) |
| Fila/Jobs | **Redis + BullMQ** (workers no mesmo deploy) | Workers separados; Kafka p/ streaming (🟠) |
| API | **REST (OpenAPI)** | GraphQL BFF p/ mobile (🟡); gRPC interno (🟠) |
| Auth | **JWT (access+refresh)** + OAuth p/ conectores | Passkeys/WebAuthn (🔵), E2EE (🟡) |

### 5.3. Dados
| Store | 🟢 MVP | Papel | Quando adicionar |
|---|---|---|---|
| **PostgreSQL** | ✅ | Verdade no servidor: eventos, entidades, read models, JSONB | Base desde o dia 1 |
| **pgvector** (extensão) | ✅ | Busca semântica (embeddings) sem infra extra | MVP — evita Qdrant cedo |
| **Redis** | ✅ | Cache + filas (BullMQ) | MVP |
| **Qdrant** | ❌ | Vector DB dedicado | 🟡 quando pgvector limitar (>~1–5M vetores/latência) |
| **Neo4j** | ❌ | Grafo nativo p/ queries multi-hop complexas | 🟡 quando queries de grafo em SQL doerem |
| **Data Lake (S3+Parquet)** | ❌ | Analytics/ML offline | 🟠 |

**Decisão-chave:** O grafo de conhecimento **começa dentro do PostgreSQL** (tabelas
`entities` + `relationships`, com CTEs recursivas / `ltree` quando útil). Neo4j é uma
**fase posterior**, não o MVP. (ADR-0007)

### 5.4. IA
| Componente | 🟢 MVP | Notas |
|---|---|---|
| Insights | **Regras + estatística primeiro; LLM só quando agrega** | "Heurística antes de neurônio" |
| LLM | **API externa** (modelo barato p/ maioria, modelo forte p/ síntese) | Abstração `LLMProvider` (troca fácil) |
| Embeddings | **API de embeddings** → armazenados em pgvector | Cache agressivo por hash de conteúdo |
| RAG | **RAG sobre o CMHL** (recupera eventos/insights relevantes → contexto) | Núcleo da explicabilidade |
| On-device AI | ❌ | 🟡/🟠 (privacidade + custo): modelos pequenos locais |
| Causalidade | ❌ | 🔴 pesquisa (inferência causal vs. correlação) |

### 5.5. Infra / DevOps
| Item | 🟢 MVP | Evolução |
|---|---|---|
| Container | **Docker + docker-compose** | — |
| Cloud | **Hospedagem única e barata, 1 região** — PaaS (Fly.io/Railway/Render) *ou* AWS (ECS Fargate / 1 EC2 + RDS + ElastiCache). Ver ADR-0011 | Consolidar em AWS quando exigir controle fino; Multi-AZ (🟡), multi-região (🟠) |
| CI/CD | **GitHub Actions** | — |
| Observabilidade | Logs estruturados (pino) + Sentry + health checks | OpenTelemetry tracing + Grafana (🟡) |

---

## 6. Postura de Privacidade (princípio inegociável)

Privacidade **não é feature, é arquitetura**. Ordem de prioridade:

1. **Local-first:** o dado nasce e pode viver no dispositivo. A nuvem é opcional/replicável.
2. **Data ownership:** exportação total (JSON/SQLite) e deleção real a qualquer momento.
3. **Minimização:** só coletar o que gera valor; conectores são opt-in granulares.
4. **Criptografia:** em trânsito (TLS) e em repouso; roadmap para **E2EE** (🟡) onde o
   servidor não consegue ler o conteúdo.
5. **Conformidade:** LGPD + GDPR *by design* (base legal, DSAR, DPIA). Ver `15`.
6. **IA com consentimento:** enviar dados a LLMs externos é **opt-in** e explicado; caminho
   para inferência on-device (🟡) para dados sensíveis.

---

## 7. Princípios de arquitetura (aplicados em todo lugar)

1. **Evolutiva, em camadas** — cada fase resolve uma dor real, não hipotética.
2. **Event-centric** — o Evento é a unidade; tudo deriva dele (auditável, reprocessável).
3. **Explicabilidade > mágica** — todo Insight aponta para suas evidências.
4. **Módulos com fronteiras claras** — baixo acoplamento; um módulo poderia virar serviço.
5. **Boring tech por padrão** — PostgreSQL, Redis, NestJS; inovar só no que é diferencial.
6. **Custo consciente** — cada chamada de LLM/embedding tem custo; medir e cachear.
7. **Reversibilidade** — preferir decisões reversíveis; documentar as irreversíveis em ADR.

---

## 8. Índice de documentos

| # | Documento | Foco | Autor-âncora? |
|---|---|---|---|
| 00 | Project Vision | Visão, missão, roadmap 10 anos | ✅ |
| 01 | Problem Statement | O problema, evidências | |
| 02 | Market Research | Mercado, tendências | |
| 03 | Competitive Analysis | Concorrentes, tabela comparativa | |
| 04 | Product Requirements | Funcionalidades e priorização | |
| 05 | User Personas | Personas | |
| 06 | User Journey | Jornada do usuário | |
| 07 | System Architecture | Arquitetura geral | ✅ |
| 08 | Mobile Architecture | App RN/Expo, offline, sensores | |
| 09 | Backend Architecture | NestJS, DDD, CQRS/ES-lite | ✅ |
| 10 | Database Design | Postgres/pgvector/Neo4j/Qdrant | ✅ |
| 11 | Event Model | Timeline, eventos, snapshots | ✅ |
| 12 | AI Architecture | LLM, embeddings, RAG, custo | ✅ |
| 13 | Knowledge Graph | Grafo de conhecimento | |
| 14 | Vector Search | Embeddings, busca semântica | |
| 15 | Privacy Architecture | LGPD/GDPR, threat model | |
| 16 | Security | Auth, ataques, proteções | |
| 17 | API Design | REST/GraphQL/gRPC | |
| 18 | Design System | Cores, tipografia, motion | |
| 19 | UI Screens | Telas, estados, fluxos | |
| 20 | MVP | Escopo do MVP | |
| 21 | Roadmap | Anos 1–10 | |
| 22 | Business Model | Monetização | |
| 23 | Research | Papers relacionados | |
| 24 | ADRs | Architecture Decision Records | ✅ |
| 25 | Risks | Riscos | |
| 26 | Testing | Estratégia de testes | |
| 27 | DevOps | Docker, AWS, CI/CD, observabilidade | |
| 28 | Open Source Strategy | Governança, comunidade | |
| 29 | Future Research | Ideias de pesquisa | |
| 30 | Final Architecture | Consolidação | ✅ |

---

## 9. Decisões-âncora (resumo — ver ADRs para o registro formal)

- **ADR-0001:** Modular Monolith (NestJS) em vez de microserviços no MVP.
- **ADR-0002:** Event Sourcing "lite" (append-only + read models) em vez de ES/CQRS completo.
- **ADR-0003:** Local-first com sync engine próprio simples (não CRDT) no MVP.
- **ADR-0004:** PostgreSQL como store primário; pgvector para busca semântica no MVP.
- **ADR-0005:** REST + OpenAPI no MVP; GraphQL/gRPC adiados.
- **ADR-0006:** LLM via API com camada de abstração; heurística antes de LLM.
- **ADR-0007:** Grafo de conhecimento em PostgreSQL primeiro; Neo4j só na V2.
- **ADR-0008:** Qdrant adiado até pgvector limitar.
- **ADR-0009:** React Native + Expo como cliente único (iOS+Android) no MVP.
- **ADR-0010:** Privacidade local-first como restrição arquitetural inegociável.
- **ADR-0011:** Hospedagem pragmática e reversível — PaaS (Fly.io/Railway/Render) permitido no MVP como alternativa à AWS, consolidando em AWS quando houver necessidade de controle/escala.

_Fim do documento-mestre._
