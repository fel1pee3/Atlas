# 21 — Roadmap (Anos 1 a 10)

> **Fase geral:** Transversal (🟢→🔴) · **Leia antes:** [`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md) · [`00_Project_Vision.md`](00_Project_Vision.md) §9–§10
> **Documentos relacionados:** [`04_Product_Requirements.md`](04_Product_Requirements.md) · [`07_System_Architecture.md`](07_System_Architecture.md) · [`10_Database_Design.md`](10_Database_Design.md) · [`12_AI_Architecture.md`](12_AI_Architecture.md) · [`20_MVP.md`](20_MVP.md) · [`22_Business_Model.md`](22_Business_Model.md) · [`24_ADRs.md`](24_ADRs.md) · [`25_Risks.md`](25_Risks.md)
> **Status:** Vivo · **Versão:** 0.1 · **Última atualização:** 2026-07-20 · **Owner:** Fundador solo

---

### Resumo executivo

Este roadmap expande o macro-roadmap de 10 anos de [`00`](00_Project_Vision.md) §10 em um plano detalhado por horizonte — **Ano 1, Ano 2, Ano 3, Anos 4–5, Anos 6–10** — declarando, para cada um: **tema, objetivos, funcionalidades (com rótulo de fase), tecnologias que ENTRAM (com gatilho de entrada), métricas e riscos**.

A trajetória é **evolutiva e disciplinada por gatilhos, não por datas**: o Atlas vai de **app** (anos 1–2) → **plataforma** (anos 3–5) → **infraestrutura** (anos 6–10), adicionando complexidade técnica *só quando uma dor real a justifica*. A regra de ouro que atravessa todo o documento: **toda tecnologia tem uma fase de entrada e um gatilho explícito** — nada de Neo4j, Qdrant, GraphQL, on-device AI, microserviços ou multi-região "porque é moderno" ([`ATLAS_MASTER_CONTEXT`](ATLAS_MASTER_CONTEXT.md) §3).

O roadmap também rastreia **marcos de aprendizado do fundador** (objetivos P1–P3 de [`00`](00_Project_Vision.md) §6.3), porque o Atlas é simultaneamente um produto, uma tese e um projeto de crescimento técnico de carreira.

> ⚠️ **Nota sobre números:** todos os prazos, volumes de usuários e metas quantitativas são **estimativas direcionais** de um fundador solo, com raciocínio explícito. **Gatilhos > datas** ([`00`](00_Project_Vision.md) §10): a passagem de um horizonte ao seguinte é decidida por sinais reais (dor, tração, limite técnico), não pelo calendário.

---

## 1. Como ler este roadmap

- **Horizontes, não sprints:** cada seção é um *horizonte* com um tema-guia. Dentro dele, as features têm rótulo de fase (🟢🔵🟡🟠🔴).
- **Gatilho de entrada:** toda tecnologia nova só entra quando seu **gatilho** dispara. Isso torna o roadmap *reativo à realidade*, não a um plano rígido.
- **Encadeamento:** MVP → V1 → V2 → Escala → Pesquisa. Cada horizonte pressupõe o anterior *validado*, não apenas construído.
- **Sistema de fases** (de [`ATLAS_MASTER_CONTEXT`](ATLAS_MASTER_CONTEXT.md) §4):

| Rótulo | Nome | Gatilho de entrada |
|---|---|---|
| 🟢 **MVP** | Obrigatório | Provar a tese com o autor + poucos usuários |
| 🔵 **V1** | Pós-lançamento | Logo após o MVP funcionar ponta a ponta |
| 🟡 **V2** | Com usuários reais | Tração + dor real justificando complexidade |
| 🟠 **Escala** | Milhares–milhões | Limites de performance/custo forçam a mudança |
| 🔴 **Pesquisa** | Futuro | Ideias de fronteira; não implementar agora |

---

## 2. Ano 1 — *Prove a tese* (🟢 MVP)

> **Encadeamento:** este é o horizonte do [`20_MVP.md`](20_MVP.md). Aqui resumimos e situamos no arco de 10 anos.

### 2.1. Tema
Provar, via **dogfooding**, que um CMHL unificado e local-first gera **insight cross-domain real** a custo de IA ≈ 0.

### 2.2. Objetivos
- Fechar o **loop de valor** (conectar → timeline → insight → ação) para 1 usuário (o autor).
- Gerar **≥1 insight cross-domain** explicável e não óbvio (Objetivo O2, [`00`](00_Project_Vision.md) §6.1).
- Estabelecer **confiança arquitetural** (local-first, export/delete) desde o dia 1.
- **Aprendizado do fundador:** dominar event sourcing "lite", RN/Expo avançado, pgvector, pipeline heurístico.

### 2.3. Funcionalidades (com fase)

| Funcionalidade | Fase |
|---|---|
| Entrada manual (eventos, humor, gasto, notas) | 🟢 |
| Conector Health Connect / HealthKit | 🟢 |
| Conector Location | 🟢 |
| Conector Calendar (Google/Apple) | 🟢 |
| Timeline de eventos unificada | 🟢 |
| Busca semântica (pgvector) | 🟢 |
| Insights heurísticos/estatísticos (1–2 cross-domain) | 🟢 |
| Explicabilidade (evidências rastreáveis) | 🟢 |
| Export total + delete real | 🟢 |
| Onboarding (< 5 min ao 1º insight) | 🟢 |

### 2.4. Tecnologias que ENTRAM (com gatilho)

| Tecnologia | Gatilho | Nota |
|---|---|---|
| PostgreSQL + pgvector | Dia 1 (store primário + busca) | ADR-0004/0008 |
| Redis + BullMQ | Dia 1 (cache + jobs de ingestão/insight) | Workers no mesmo deploy |
| NestJS (modular monolith) | Dia 1 (backend) | ADR-0001 |
| React Native + Expo + SQLite/Drizzle | Dia 1 (cliente local-first) | ADR-0009 |
| API de embeddings + LLM (via `LLMProvider`) | Só quando agrega (LLM opt-in, fora do caminho crítico) | ADR-0006 |
| Docker Compose, AWS 1 região, GitHub Actions | Deploy do MVP | [`27_DevOps.md`](27_DevOps.md) |

### 2.5. Métricas
- **North Star:** *Insights acionados por semana* ≥ 1, sustentado.
- **Gate:** *Dogfooding streak* ≥ 30 dias.
- **Custo:** IA marginal/usuário/mês ≈ 0.

### 2.6. Riscos-chave
- Escopo excessivo (o maior risco). · Insight cross-domain não emergir. · Fadiga do fundador. (Detalhe em [`20`](20_MVP.md) §6 e [`25`](25_Risks.md).)

---

## 3. Ano 2 — *Produto amável* (🔵 V1)

### 3.1. Tema
Transformar o experimento pessoal num **produto que estranhos amam** — o Atlas deixa de ser "app do autor" e ganha uma **base de early adopters**.

### 3.2. Objetivos
- Sair do "n=1" para **dezenas–centenas de usuários** engajados.
- Introduzir **freemium** e a primeira monetização (ver [`22`](22_Business_Model.md)).
- Aumentar **profundidade de insights** (insights semanais, mais tipos cross-domain).
- Reduzir atrito de confiança (passkeys, melhor privacidade).
- **Aprendizado do fundador:** distribuição/GTM (build-in-public), suporte a usuários reais, hardening de produção.

### 3.3. Funcionalidades (com fase)

| Funcionalidade | Fase | Gatilho |
|---|---|---|
| Conector financeiro automático (Open Finance BR / agregadores) | 🔵 | MVP validou "gasto manual"; agora automatizar o domínio de maior valor cross-domain |
| Mais conectores densos (e-mail/metadados, saúde estendida, motion) | 🔵 | Dor de dado faltante reportada por usuários |
| **Insights semanais** (digest recorrente) + mais tipos cross-domain | 🔵 | Base de usuários pede regularidade |
| Notificações inteligentes (nudges baseados em insight) | 🔵 | Aumentar retenção sem virar spam |
| Passkeys / WebAuthn | 🔵 | Fricção/segurança de login com usuários reais |
| Freemium (tier grátis + assinatura) | 🔵 | Primeiros usuários dispostos a pagar |
| Melhorias de sync local↔nuvem (multi-device do mesmo usuário) | 🔵 | Usuário com 2 devices (telefone + tablet) |
| RAG básico para "conversar com sua vida" (LLM opt-in) | 🔵 | LLM barato + usuários querem perguntar em linguagem natural |

### 3.4. Tecnologias que ENTRAM (com gatilho)

| Tecnologia | Gatilho de entrada | Fase | Ref. |
|---|---|---|---|
| **Passkeys/WebAuthn** | Login com usuários reais exige menos fricção/mais segurança | 🔵 | [`16_Security.md`](16_Security.md) |
| **Open Finance / agregador financeiro** | Domínio financeiro precisa ser automático (era manual no MVP) | 🔵 | [`22`](22_Business_Model.md) |
| **OpenTelemetry + Grafana (observabilidade)** | Múltiplos usuários → precisa enxergar produção | 🔵/🟡 | [`27_DevOps.md`](27_DevOps.md) |
| **Billing (Stripe/loja)** | Monetização freemium ligada | 🔵 | [`22`](22_Business_Model.md) |
| **LLM no fluxo (RAG) com camada `LLMProvider`** | Usuários querem interrogar o CMHL; custo controlado por cache | 🔵 | [`12`](12_AI_Architecture.md) |

> **Ainda NÃO entram:** Neo4j, Qdrant, GraphQL, microserviços, multi-região. Sem gatilho ainda.

### 3.5. Métricas
- **Retenção D30/D90** dos early adopters.
- **% de usuários com ≥1 insight cross-domain** na 1ª semana.
- **Nº de domínios conectados por usuário** (proxy de valor do CMHL).
- **Conversão freemium → pago** (baseline; ver [`22`](22_Business_Model.md)).

### 3.6. Riscos
- Complexidade de onboarding de usuários não-técnicos. · Custo de suporte de fundador solo. · Custo de IA subindo com RAG (mitigar com cache/heurística). · Integração financeira frágil/regulada.

---

## 4. Ano 3 — *Inteligência real* (🟡 V2)

### 4.1. Tema
O Atlas passa de "registra e correlaciona" para **"entende relações"**. Entra o **grafo de conhecimento nativo** e a inferência de padrões madura — a fase em que a complexidade técnica finalmente se paga porque **há tração e dor real** ([`ATLAS_MASTER_CONTEXT`](ATLAS_MASTER_CONTEXT.md) §4).

### 4.2. Objetivos
- Insights **multi-hop** (ex.: "pessoa X → lugar Y → seu humor") impossíveis em SQL simples.
- Escalar busca semântica se o volume exigir.
- Amadurecer o RAG como núcleo da explicabilidade.
- **Aprendizado do fundador:** grafos nativos, modelagem de conhecimento, ML aplicado.

### 4.3. Funcionalidades (com fase)

| Funcionalidade | Fase | Gatilho |
|---|---|---|
| **Grafo de conhecimento nativo** (queries multi-hop) | 🟡 | Queries de grafo em SQL "doem" (lentas/complexas) — ADR-0007 |
| Inferência de padrões avançada (detecção de rotinas, anomalias, tendências) | 🟡 | Volume de dados por usuário suficiente para ML |
| RAG maduro (recuperação híbrida: vetor + grafo) | 🟡 | Explicabilidade exige contexto relacional |
| Insights preditivos leves (ex.: "você tende a X após Y") | 🟡 | Base estatística robusta acumulada |
| Event Sourcing + CQRS mais formais | 🟡 | Read models divergem/crescem; leitura e escrita precisam escalar separadamente |
| GraphQL BFF para o mobile | 🟡 | App precisa de queries flexíveis; REST fica verboso |

### 4.4. Tecnologias que ENTRAM (com gatilho)

| Tecnologia | Gatilho de entrada | Fase | Ref. |
|---|---|---|---|
| **Neo4j** (grafo nativo) | Queries multi-hop em Postgres (CTEs recursivas) ficam lentas/insustentáveis | 🟡 | ADR-0007, [`13_Knowledge_Graph.md`](13_Knowledge_Graph.md) |
| **Qdrant** (vector DB dedicado) | pgvector limita (>~1–5M vetores ou latência inaceitável) | 🟡 | ADR-0008, [`14_Vector_Search.md`](14_Vector_Search.md) |
| **GraphQL (BFF)** | Mobile precisa de flexibilidade de query; over/under-fetching do REST dói | 🟡 | ADR-0005, [`17_API_Design.md`](17_API_Design.md) |
| **CQRS/ES formais** | Escrita e leitura precisam escalar/evoluir independentemente | 🟡 | ADR-0002, [`09_Backend_Architecture.md`](09_Backend_Architecture.md) |
| **E2EE (onde aplicável)** | Dados sensíveis no servidor + demanda de confiança | 🟡 | [`15_Privacy_Architecture.md`](15_Privacy_Architecture.md) |
| **On-device AI (SLMs) — piloto** | Privacidade/custo justificam inferência local; NPUs maduras | 🟡 | [`12`](12_AI_Architecture.md) |

> **Decisão-âncora reafirmada:** o grafo *nasceu* no PostgreSQL no MVP; Neo4j só entra aqui, e **só se o gatilho disparar** (ADR-0007). O mesmo vale para Qdrant (ADR-0008).

### 4.5. Métricas
- **% de insights que usam relações multi-hop** (valor do grafo).
- **Latência de busca** dentro de SLA (justifica Qdrant ou não).
- **NPS de confiança/privacidade** ([`00`](00_Project_Vision.md) §11).
- **Retenção D90** e expansão de receita.

### 4.6. Riscos
- **Complexidade operacional** de manter 3 stores (Postgres+Neo4j+Qdrant) sozinho → mitigar automatizando ops e adiando o que não disparou gatilho. · Custo de IA crescente → on-device como válvula. · Migração de dados para o grafo.

---

## 5. Anos 4–5 — *Plataforma* (🟠 Escala)

### 5.1. Tema
O Atlas deixa de ser só um app e vira **plataforma**: terceiros constroem sobre o CMHL do usuário via **SDK/API**, com consentimento granular. O "sistema operacional de dados pessoais" ([`00`](00_Project_Vision.md) §9). Aqui os **limites de escala** (performance/custo) forçam mudanças arquiteturais.

### 5.2. Objetivos
- Abrir o **SDK/API pública** (plataforma) — ver modelo de negócio em [`22`](22_Business_Model.md).
- Escalar para **milhares–milhões** de usuários com custo unitário sob controle.
- Expandir de **B2C → B2B2C** (parceiros embutem inteligência pessoal).
- On-device AI em produção para dados sensíveis.
- **Aprendizado do fundador:** sistemas distribuídos, plataformas/ecossistemas, possivelmente **primeiras contratações** (fim do "solo" estrito).

### 5.3. Funcionalidades (com fase)

| Funcionalidade | Fase | Gatilho |
|---|---|---|
| **SDK/API de plataforma** (apps de terceiros sobre o CMHL) | 🟠 | Demanda de devs + CMHL estável e valioso |
| Consentimento granular por app/escopo (OAuth de dados pessoais) | 🟠 | Terceiros acessando dados → precisa de permissão fina |
| On-device AI em produção (inferência local para sensível) | 🟠 | Custo de IA em escala + exigência de privacidade | 
| Multi-região / multi-AZ | 🟠 | Base geográfica distribuída + SLA/latência |
| Marketplace de conectores/insights | 🟠 | Ecossistema quer estender fontes/insights |
| Ofertas B2B2C (parceiros white-label/embed) | 🟠 | Canais de distribuição empresariais |

### 5.4. Tecnologias que ENTRAM (com gatilho)

| Tecnologia | Gatilho de entrada | Fase | Ref. |
|---|---|---|---|
| **Microserviços (extração via strangler)** | Módulos do monolith viram gargalo/deploy independente necessário | 🟠 | ADR-0001, [`09`](09_Backend_Architecture.md) |
| **Kafka / streaming** | Ingestão em escala + processamento de eventos em tempo real | 🟠 | [`ATLAS_MASTER_CONTEXT`](ATLAS_MASTER_CONTEXT.md) §5.2 |
| **gRPC interno** | Comunicação serviço-a-serviço de baixa latência | 🟠 | ADR-0005 |
| **Multi-região (AWS)** | Distribuição geográfica + resiliência | 🟠 | [`27_DevOps.md`](27_DevOps.md) |
| **Data Lake (S3 + Parquet)** | Analytics/ML offline em escala | 🟠 | [`10_Database_Design.md`](10_Database_Design.md) §5.3 |
| **On-device AI (produção)** | Custo/privacidade em escala | 🟠 | [`12`](12_AI_Architecture.md) |
| **WorkManager nativo / background robusto** | Ingestão confiável em background em escala | 🟠/🟡 | [`08_Mobile_Architecture.md`](08_Mobile_Architecture.md) |

### 5.5. Métricas
- **Nº de apps/devs na plataforma** e chamadas de API.
- **Custo de infra por usuário ativo** (deve cair com escala + on-device).
- **Receita de plataforma (API/SDK)** vs. B2C ([`22`](22_Business_Model.md)).
- **Uptime/latência** por região.

### 5.6. Riscos
- **Perda de foco** (plataforma cedo demais). · Segurança/privacidade em ecossistema aberto. · Custo de infra distribuída. · Transição de fundador solo → time (cultura, delegação).

---

## 6. Anos 6–10 — *Infraestrutura* (🔴 Pesquisa / Fronteira)

### 6.1. Tema
O Atlas vira **infraestrutura padrão de Inteligência Pessoal**: **agentes pessoais** que agem em nome do usuário, com o CMHL como memória/contexto, e um **padrão aberto de portabilidade do "modelo de vida"** ([`00`](00_Project_Vision.md) §9).

### 6.2. Objetivos
- Agentes pessoais confiáveis e seguros (agir, não só sugerir).
- **Inferência causal** (vs. mera correlação) — fronteira científica.
- Padrão aberto de portabilidade do CMHL (interoperabilidade entre provedores).
- Valor científico: papers, contribuições de pesquisa ([`23_Research.md`](23_Research.md), [`29_Future_Research.md`](29_Future_Research.md)).

### 6.3. Funcionalidades (com fase)

| Funcionalidade | Fase | Gatilho |
|---|---|---|
| **Agentes pessoais** (agem no mundo em nome do usuário) | 🔴 | Confiança + segurança + CMHL maduro |
| **Inferência causal** (causa vs. correlação) | 🔴 | Base científica + dados longitudinais ricos |
| Padrão aberto de portabilidade do CMHL | 🔴 | Ecossistema/regulação demandam interoperabilidade |
| CRDTs para colaboração/multi-device conflituoso | 🔴 | Colaboração real com conflitos de merge frequentes |

### 6.4. Tecnologias que ENTRAM (com gatilho)

| Tecnologia | Gatilho de entrada | Fase | Ref. |
|---|---|---|---|
| **Frameworks de agentes + tool-use seguro** | Confiança e segurança suficientes para agir | 🔴 | [`29_Future_Research.md`](29_Future_Research.md) |
| **Motores de inferência causal** | Maturidade científica + dados longitudinais | 🔴 | [`23_Research.md`](23_Research.md) |
| **CRDTs** | Colaboração multi-device conflituosa | 🔴 | ADR-0003 |
| **Padrões abertos de portabilidade (spec)** | Interoperabilidade de mercado/regulatória | 🔴 | [`28_Open_Source_Strategy.md`](28_Open_Source_Strategy.md) |

### 6.5. Métricas
- **Ações de agente aceitas/revertidas** (confiança).
- **Validade causal** de insights (rigor científico).
- **Adoção do padrão aberto** por terceiros.

### 6.6. Riscos
- **Segurança de agentes** (agir errado no mundo real). · Regulação de IA autônoma. · Rigor científico da causalidade. · Manter a promessa de privacidade em sistemas autônomos.

---

## 7. Mapa de introdução de tecnologias ao longo do tempo

> Consolida "quando entra o quê e por qual gatilho". Este é o **contrato anti-complexidade-prematura** do Atlas ([`ATLAS_MASTER_CONTEXT`](ATLAS_MASTER_CONTEXT.md) §3, §5).

| Tecnologia | Entra em | Fase | Gatilho de entrada | ADR/Ref. |
|---|---|---|---|---|
| PostgreSQL | Ano 1 | 🟢 | Store primário desde o dia 1 | ADR-0004 |
| pgvector | Ano 1 | 🟢 | Busca semântica sem infra extra | ADR-0004/0008 |
| Redis + BullMQ | Ano 1 | 🟢 | Cache + filas de jobs | §5.2 master |
| NestJS (monolith) | Ano 1 | 🟢 | Backend modular | ADR-0001 |
| RN + Expo + SQLite | Ano 1 | 🟢 | Cliente local-first | ADR-0009 |
| LLM/embeddings (API, opt-in) | Ano 1 | 🟢 | Só quando agrega; heurística primeiro | ADR-0006 |
| Passkeys/WebAuthn | Ano 2 | 🔵 | Fricção/segurança de login real | [`16`](16_Security.md) |
| Open Finance (financeiro auto) | Ano 2 | 🔵 | Automatizar domínio antes manual | [`22`](22_Business_Model.md) |
| OpenTelemetry + Grafana | Ano 2 | 🔵/🟡 | Múltiplos usuários em produção | [`27`](27_DevOps.md) |
| RAG no fluxo | Ano 2 | 🔵 | Interrogar o CMHL; custo controlado | [`12`](12_AI_Architecture.md) |
| **Neo4j** | Ano 3 | 🟡 | Queries multi-hop em SQL doem | ADR-0007 |
| **Qdrant** | Ano 3 | 🟡 | pgvector limita (>~1–5M vetores/latência) | ADR-0008 |
| **GraphQL (BFF)** | Ano 3 | 🟡 | Flexibilidade de query no mobile | ADR-0005 |
| CQRS/ES formais | Ano 3 | 🟡 | Escrita/leitura escalam separadas | ADR-0002 |
| E2EE | Ano 3 | 🟡 | Dados sensíveis no servidor | [`15`](15_Privacy_Architecture.md) |
| **On-device AI (SLM)** | Ano 3 (piloto) → 4–5 (prod) | 🟡→🟠 | Custo/privacidade + NPUs maduras | [`12`](12_AI_Architecture.md) |
| **Microserviços** | Anos 4–5 | 🟠 | Módulos viram gargalo (strangler) | ADR-0001 |
| **Kafka / streaming** | Anos 4–5 | 🟠 | Ingestão/tempo real em escala | §5.2 master |
| gRPC interno | Anos 4–5 | 🟠 | Latência serviço-a-serviço | ADR-0005 |
| **Multi-região** | Anos 4–5 | 🟠 | Distribuição geográfica + SLA | [`27`](27_DevOps.md) |
| Data Lake (S3+Parquet) | Anos 4–5 | 🟠 | Analytics/ML offline em escala | [`10`](10_Database_Design.md) |
| Agentes / tool-use | Anos 6–10 | 🔴 | Confiança + segurança + CMHL maduro | [`29`](29_Future_Research.md) |
| Inferência causal | Anos 6–10 | 🔴 | Rigor científico + dados longitudinais | [`23`](23_Research.md) |
| CRDTs | Anos 6–10 | 🔴 | Colaboração conflituosa | ADR-0003 |
| Padrão aberto de portabilidade | Anos 6–10 | 🔴 | Interoperabilidade de mercado | [`28`](28_Open_Source_Strategy.md) |

---

## 8. Ligação clara MVP → V1 → V2 → Escala → Pesquisa

```
🟢 MVP (Ano 1)            🔵 V1 (Ano 2)           🟡 V2 (Ano 3)            🟠 Escala (4–5)          🔴 Pesquisa (6–10)
Prove a tese      →       Produto amável   →      Inteligência real →     Plataforma        →      Infraestrutura
─────────────            ──────────────           ────────────────        ─────────────            ────────────────
n=1 (autor)              dezenas–centenas         milhares                milhões                  padrão global
loop de valor            freemium + GTM           grafo + ML maduro       SDK/API + B2B2C          agentes + causalidade
Postgres/pgvector        + passkeys/RAG           + Neo4j/Qdrant/GraphQL  + microserviços/Kafka    + tool-use/CRDT
heurística>LLM           LLM opt-in no fluxo      on-device (piloto)      on-device (prod)         inferência causal
```

**Regra de transição:** só se avança de horizonte quando o anterior está **validado** (métrica-chave atingida), não apenas *construído*. Ex.: não se abre o SDK de plataforma (🟠) enquanto a V2 não provou insights relacionais valiosos.

---

## 9. Marcos de aprendizado do fundador (P1–P3 de [`00`](00_Project_Vision.md) §6.3)

O Atlas é também um **projeto de carreira e crescimento técnico**. Cada horizonte carrega um "currículo" implícito:

| Horizonte | Domínio técnico aprendido | Ativo de carreira gerado |
|---|---|---|
| Ano 1 (🟢) | Event sourcing "lite", RN/Expo avançado, pgvector, pipeline heurístico, local-first sync | Portfólio funcional + defesa Big Tech de cada decisão (P1) |
| Ano 2 (🔵) | GTM/build-in-public, billing, observabilidade, RAG, hardening de produção | Produto com usuários reais + narrativa pública |
| Ano 3 (🟡) | Grafos nativos (Neo4j), ML aplicado, CQRS/ES formais, GraphQL | Profundidade em IA aplicada + grafos (P2) |
| Anos 4–5 (🟠) | Sistemas distribuídos, plataformas/ecossistemas, on-device AI, liderança inicial de time | Potencial de startup + transição de solo → líder técnico (P3) |
| Anos 6–10 (🔴) | Agentes, inferência causal, padrões abertos | Potencial de paper + contribuição científica (P3) |

> **Anti-objetivo transversal:** nunca tratar tecnologia como caixa-preta ([`ATLAS_MASTER_CONTEXT`](ATLAS_MASTER_CONTEXT.md) §0). Cada tecnologia introduzida no roadmap deve ser aprendida a fundo — o que dita, inclusive, o *ritmo* de introdução (nunca duas tecnologias novas grandes ao mesmo tempo).

---

## 10. Ligações

- **Escopo do primeiro horizonte:** [`20_MVP.md`](20_MVP.md)
- **Decisões formais por trás de cada gatilho:** [`24_ADRs.md`](24_ADRs.md)
- **Riscos por horizonte, consolidados:** [`25_Risks.md`](25_Risks.md)
- **Monetização por fase:** [`22_Business_Model.md`](22_Business_Model.md)
- **Arquitetura que evolui com o roadmap:** [`07_System_Architecture.md`](07_System_Architecture.md), [`09`](09_Backend_Architecture.md), [`10`](10_Database_Design.md), [`12`](12_AI_Architecture.md)

> **Mantra do roadmap:** *evolução, não revolução. Cada tecnologia entra quando — e só quando — uma dor real a chama. Gatilhos governam; datas apenas orientam.*
