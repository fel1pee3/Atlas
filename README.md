# Atlas — Personal Intelligence Platform

> Uma plataforma de **Inteligência Pessoal** que constrói, de forma privada e *local-first*,
> um **Modelo Computacional da Vida** (Computational Model of Human Life — CMHL): uma
> representação estruturada e viva dos eventos, pessoas, lugares, hábitos, documentos e
> objetivos de uma pessoa. A IA é apenas um **interpretador** desse modelo — nunca o produto.

<p align="center"><em>"Não registramos sua vida. Nós a compreendemos."</em></p>

---

## O que é o Atlas em 30 segundos

Hoje seus dados vivem isolados: o Google sabe onde você esteve, o banco sabe seus gastos, o
Health Connect sabe seu sono, o calendário sabe seus compromissos. **Nenhuma plataforma
entende você como um todo.** O Atlas unifica esses sinais dispersos em um único modelo capaz
de **inferir relações** (ex.: *dormir pouco → menos atividade física → queda de
produtividade → mais delivery → mais gasto*) e transformar dados em **conhecimento acionável
e explicável**.

O Atlas nasce como um **app** (React Native), mas é projetado como uma **infraestrutura**:
um núcleo (o CMHL) sobre o qual dezenas de produtos podem crescer — memória inteligente,
inteligência financeira, assistente de saúde, planejamento de rotina, agentes.

---

## Como navegar esta documentação

> **Comece por:** [`docs/ATLAS_MASTER_CONTEXT.md`](docs/ATLAS_MASTER_CONTEXT.md) — a fonte
> única de verdade (tese, glossário, stack por fase, decisões-âncora). Todos os documentos
> abaixo são consistentes com ele.

### Sistema de fases
Toda decisão é rotulada: 🟢 MVP · 🔵 V1 · 🟡 V2 · 🟠 Escala · 🔴 Pesquisa.

### Trilhas de leitura sugeridas
- **Investidor / recrutador:** `00` → `01` → `02` → `03` → `22` → `21`.
- **Engenheiro sênior / entrevista:** `07` → `09` → `10` → `11` → `12` → `24` → `30`.
- **Pesquisador / banca:** `00` → `12` → `13` → `23` → `29`.
- **Você (construindo o MVP):** `20` → `07` → `08` → `09` → `10` → `11` → `12`.

### Documentos

| # | Documento | Descrição |
|---|---|---|
| — | [Master Context](docs/ATLAS_MASTER_CONTEXT.md) | **Fonte única de verdade** |
| 00 | [Project Vision](docs/00_Project_Vision.md) | Visão, missão, tese, roadmap de 10 anos |
| 01 | [Problem Statement](docs/01_Problem_Statement.md) | O problema e suas evidências |
| 02 | [Market Research](docs/02_Market_Research.md) | Mercado, tamanho, tendências |
| 03 | [Competitive Analysis](docs/03_Competitive_Analysis.md) | Concorrentes e diferenciação |
| 04 | [Product Requirements](docs/04_Product_Requirements.md) | Funcionalidades e priorização |
| 05 | [User Personas](docs/05_User_Personas.md) | Personas |
| 06 | [User Journey](docs/06_User_Journey.md) | Jornada do usuário |
| 07 | [System Architecture](docs/07_System_Architecture.md) | Arquitetura geral |
| 08 | [Mobile Architecture](docs/08_Mobile_Architecture.md) | App, offline, sensores |
| 09 | [Backend Architecture](docs/09_Backend_Architecture.md) | NestJS, DDD, ES-lite |
| 10 | [Database Design](docs/10_Database_Design.md) | Modelagem de dados |
| 11 | [Event Model](docs/11_Event_Model.md) | Timeline, eventos, snapshots |
| 12 | [AI Architecture](docs/12_AI_Architecture.md) | LLM, embeddings, RAG, custo |
| 13 | [Knowledge Graph](docs/13_Knowledge_Graph.md) | Grafo de conhecimento |
| 14 | [Vector Search](docs/14_Vector_Search.md) | Busca semântica |
| 15 | [Privacy Architecture](docs/15_Privacy_Architecture.md) | LGPD/GDPR, threat model |
| 16 | [Security](docs/16_Security.md) | Auth, ataques, proteções |
| 17 | [API Design](docs/17_API_Design.md) | REST/GraphQL/gRPC |
| 18 | [Design System](docs/18_Design_System.md) | Cores, tipografia, motion |
| 19 | [UI Screens](docs/19_UI_Screens.md) | Telas e fluxos |
| 20 | [MVP](docs/20_MVP.md) | Escopo do MVP |
| 21 | [Roadmap](docs/21_Roadmap.md) | Anos 1–10 |
| 22 | [Business Model](docs/22_Business_Model.md) | Monetização |
| 23 | [Research](docs/23_Research.md) | Papers relacionados |
| 24 | [ADRs](docs/24_ADRs.md) | Architecture Decision Records |
| 25 | [Risks](docs/25_Risks.md) | Riscos |
| 26 | [Testing](docs/26_Testing.md) | Estratégia de testes |
| 27 | [DevOps](docs/27_DevOps.md) | Docker, AWS, CI/CD, observabilidade |
| 28 | [Open Source Strategy](docs/28_Open_Source_Strategy.md) | Comunidade e governança |
| 29 | [Future Research](docs/29_Future_Research.md) | Ideias de pesquisa |
| 30 | [Final Architecture](docs/30_Final_Architecture.md) | Consolidação |
| 31 | [Getting Started](docs/31_Getting_Started.md) | Ponte docs → código (como rodar) |

---

## Princípios

- **Local-first & privacy-first** — seus dados são seus; a nuvem é opcional.
- **Event-centric** — o Evento é a unidade atômica; tudo deriva dele.
- **Explicabilidade > mágica** — todo insight aponta para suas evidências.
- **Arquitetura evolutiva** — *Make it work → Make it right → Make it scalable.*
- **Boring tech por padrão** — inovar apenas no diferencial (o CMHL).

## Stack (MVP)

React Native + Expo · TypeScript · NestJS (Modular Monolith) · PostgreSQL + pgvector ·
Redis + BullMQ · Docker · AWS · GitHub Actions.

## Código (monorepo)

O código vive num monorepo (npm workspaces). Ver [`docs/31_Getting_Started.md`](docs/31_Getting_Started.md)
para rodar localmente.

```
packages/shared   # @atlas/shared — modelo de Evento + validação Zod
apps/api          # @atlas/api    — NestJS (Clean Arch + DDD), Prisma, JWT
apps/mobile       # @atlas/mobile — Expo (expo-router), SQLite/Drizzle, local-first
```

```bash
cp .env.example .env && npm run infra:up   # Postgres+pgvector + Redis (requer Docker rodando)
npm install
npm run prisma:migrate -w @atlas/api -- --name init
npm run dev:api                            # backend em http://localhost:3333/api
```

## Status

🏗️ **Fase atual:** 🟢 MVP — Marco **M0 (Fundação) concluído** (backend compila e passa nos
testes; app Expo local-first estruturado). Próximo: fechar o **M1** (sync pull + read models) e
iniciar o **M2** (Health Connect/HealthKit). Ver [`docs/31_Getting_Started.md`](docs/31_Getting_Started.md).
Fundador solo.

## Licença

A definir — ver [`docs/28_Open_Source_Strategy.md`](docs/28_Open_Source_Strategy.md).
