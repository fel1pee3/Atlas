# 20 — MVP (Minimum Viable Product)

> **Fase geral:** 🟢 MVP (Ano 1 — *Prove a tese*) · **Leia antes:** [`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md)
> **Documentos relacionados:** [`00_Project_Vision.md`](00_Project_Vision.md) · [`04_Product_Requirements.md`](04_Product_Requirements.md) · [`07_System_Architecture.md`](07_System_Architecture.md) · [`11_Event_Model.md`](11_Event_Model.md) · [`12_AI_Architecture.md`](12_AI_Architecture.md) · [`15_Privacy_Architecture.md`](15_Privacy_Architecture.md) · [`21_Roadmap.md`](21_Roadmap.md) · [`22_Business_Model.md`](22_Business_Model.md)
> **Status:** Vivo · **Versão:** 0.1 · **Última atualização:** 2026-07-20 · **Owner:** Fundador solo

---

### Resumo executivo

O MVP do Atlas tem **um único trabalho**: provar — para o próprio autor, usando o produto todo dia (*dogfooding*) — que um **Modelo Computacional da Vida (CMHL)** unificado e *local-first* consegue gerar **pelo menos um insight cross-domain real, explicável e não óbvio**, a um custo de IA quase zero. Tudo o que não serve diretamente a essa prova está **fora** do MVP.

Concretamente, o MVP entrega: (1) ingestão via **entrada manual + Health Connect/HealthKit + Location + Calendar**; (2) uma **timeline de eventos** unificada; (3) **busca semântica com pgvector**; (4) **1–2 insights cross-domain** gerados por **heurística/estatística — antes de qualquer LLM**; (5) **privacidade real** (export/delete total desde o dia 1); e (6) um **onboarding** que entrega o primeiro insight em minutos.

Ficam **fora** (por decisão-âncora, não por preguiça): Neo4j, Qdrant, dezenas de conectores, colaboração, agentes autônomos e LLM como peça central. O critério de "pronto" é comportamental: **o autor não consegue mais viver sem abrir o Atlas** e ele produziu ≥1 insight que mudou uma decisão. A métrica-mãe do MVP é *Insights acionados por semana* (North Star, ver [`00`](00_Project_Vision.md) §11), com pré-requisito duro de retenção do próprio fundador (dogfooding streak).

> ⚠️ **Nota sobre números:** onde aparecem custos, prazos ou volumes (ex.: "R$X/mês de IA", "6 semanas", "10k eventos"), são **estimativas de trabalho** de um fundador solo, com o raciocínio explícito. Trate-os como hipóteses a validar, não como compromissos.

---

## 1. Filosofia de MVP para um fundador solo

### 1.1. O que "MVP" significa (e não significa) aqui

MVP não é "versão pequena do produto final". É o **menor experimento que testa a hipótese mais arriscada**. Para o Atlas, a hipótese mais arriscada **não** é técnica ("consigo salvar eventos no Postgres?" — trivial), é **de valor**:

> **Hipótese central do MVP:** *unir domínios que hoje vivem em silos (sono, localização, agenda, gastos manuais) revela padrões que nenhum app isolado revela — e esses padrões são úteis o suficiente para mudar comportamento.*

Se essa hipótese for falsa, nenhuma quantidade de Neo4j, agentes ou UI bonita salva o projeto. Se for verdadeira, tudo o mais é questão de engenharia incremental. Por isso o MVP é desenhado **em torno da prova cross-domain**, não em torno de completude de features.

### 1.2. As três restrições que moldam cada decisão

| Restrição | Consequência de design |
|---|---|
| **Time = 1 pessoa** | Nada que exija operação 24/7, on-call, ou manutenção de múltiplos data stores. Boring tech (ver [`ATLAS_MASTER_CONTEXT`](ATLAS_MASTER_CONTEXT.md) §7). |
| **Sem investimento / sem prazo comercial** | O MVP pode ser lento, mas **não pode ser caro de rodar**. Custo marginal por usuário precisa tender a zero (heurística antes de LLM). |
| **O autor é o usuário #1** | *Dogfooding* é o método de validação primário. Se o autor não usa diariamente, o MVP falhou — independente de métricas externas. |

### 1.3. Dogfooding como método científico, não como slogan

O fundador solo tem uma vantagem rara: **é simultaneamente o cientista e o sujeito do experimento**. O Atlas explora isso deliberadamente.

- **O autor é o "usuário-de-um" perfeito:** tem anos de contexto de vida, sabe quais insights são verdadeiros vs. ruído, e sente a dor de fragmentação na pele.
- **Ciclo de feedback de horas, não de semanas:** ideia → implementa → usa no próprio dia → sabe se prestou. Nenhuma pesquisa de usuário substitui isso na fase 🟢.
- **Filtro anti-vaidade:** features que impressionam em demo mas não são usadas por quem as construiu são cortadas sem dó.

> **Regra de dogfooding:** toda feature do MVP precisa passar no teste *"eu, o autor, abriria o Atlas amanhã de manhã por causa disso?"*. Se a resposta é "não", ela não é MVP.

### 1.4. Por que "cross-domain + local-first" são os dois eixos inegociáveis da prova

A tese do Atlas (ver [`00`](00_Project_Vision.md) §4) repousa em quatro pilares, mas o MVP só precisa provar **os dois que ninguém mais provou**:

1. **Cross-domain** — o valor está nas *relações entre domínios*, não dentro de um domínio. Um app de sono mostra sono; o Atlas mostra *sono × treino × gasto × local*. Esse é o vácuo de mercado (ver [`03_Competitive_Analysis.md`](03_Competitive_Analysis.md)).
2. **Local-first** — a permissão para ver a vida inteira de alguém só é concedida a um sistema que o usuário controla. Local-first é o que torna o cross-domain *eticamente possível* (ver [`15`](15_Privacy_Architecture.md)).

As teses de "modelo estruturado > LLM" e "IA como commodity" são **demonstradas de graça** pelo próprio design (heurística antes de LLM), mas não são o foco da prova.

---

## 2. Escopo EXATO do MVP (🟢)

Tudo nesta seção é 🟢. Se algo não está aqui, não está no MVP.

### 2.1. Visão de conjunto (o loop de valor do MVP)

```
[Conectores] → [Eventos normalizados] → [Timeline + Busca] → [Insights heurísticos] → [Ação/decisão do usuário]
     ↑                                                                                          |
     └──────────────────── dogfooding: o autor ajusta o que conecta ──────────────────────────┘
```

O MVP é esse loop, fechado de ponta a ponta, para **uma pessoa**. Largura mínima, profundidade suficiente.

### 2.2. Conectores do MVP — recomendação e justificativa

**Recomendação:** exatamente **quatro** fontes de ingestão no MVP:

1. **Entrada manual** (fundacional)
2. **Health Connect (Android) / HealthKit (iOS)**
3. **Location** (localização/visitas)
4. **Calendar** (Google/Apple Calendar)

O critério de escolha de conector no MVP é uma função de três variáveis:

> `valor_cross_domain × facilidade_de_ingestão × densidade_temporal`

| Conector | Fase | Valor cross-domain | Facilidade | Densidade temporal | Por que ENTRA no MVP |
|---|---|---|---|---|---|
| **Entrada manual** | 🟢 | Alto (humor, gasto, notas — o "cola" subjetivo) | Trivial (form) | Média | É o **fallback universal** e o antídoto ao risco de APIs fecharem. Prova que o Atlas tem valor **mesmo sem integrações**. Gera os dados subjetivos (humor, energia) que nenhuma API dá. |
| **Health Connect / HealthKit** | 🟢 | Altíssimo (sono, passos, treino, FC) | Média (SDK maduro, permissões claras) | Alta (diária/contínua) | Domínio mais rico e **denso** disponível a um dev solo. Sono/atividade são a "espinha dorsal" de quase todo insight cross-domain sobre bem-estar. |
| **Location** | 🟢 | Alto (contexto de "onde", detecção de lugares) | Média (permissão sensível, mas API nativa) | Alta | Dá o **contexto espacial** que conecta domínios ("gasto no lugar X", "sono pior fora de casa"). Barato de captar, altíssimo poder explicativo. |
| **Calendar** | 🟢 | Alto (estrutura o tempo: trabalho, reuniões, eventos sociais) | Alta (OAuth + API estável) | Média-alta | Dá **semântica ao tempo**. Transforma "acordei às 6h" em "acordei às 6h num dia de 5 reuniões". A ponte entre vida objetiva e agenda. |

**Por que essas quatro e não outras:**

- **Cobrem os quatro eixos de contexto humano:** *corpo* (Health), *espaço* (Location), *tempo estruturado* (Calendar) e *subjetivo/qualquer coisa* (Manual). Com esses quatro, quase todo insight cross-domain interessante fica **expressável**.
- **Todas são nativas do dispositivo** (exceto Calendar, que é OAuth simples) → coerente com local-first e com a força de um dev mobile RN/Expo (ver [`ATLAS_MASTER_CONTEXT`](ATLAS_MASTER_CONTEXT.md) §5.1).
- **Nenhuma depende de scraping frágil ou de parcerias comerciais.** Todas têm APIs oficiais e consentidas ("por que agora", [`00`](00_Project_Vision.md) §8).

**Por que NÃO conectores financeiros (Open Banking/PIX) no MVP** — apesar de "gasto" ser o exemplo canônico de cross-domain: a integração bancária real (Open Finance BR) exige homologação, certificação e maturidade regulatória que um dev solo não sustenta no MVP. **Solução elegante:** cobrir o domínio *financeiro* via **entrada manual** ("gastei R$X em Y") no MVP, e promover para conector automático na 🔵 V1 (ver [`21`](21_Roadmap.md)). Assim o insight "sono × gasto" continua **possível** no MVP, só que com dado de gasto inserido à mão.

> 💡 **Estimativa de esforço (raciocínio):** cada conector nativo custa ~1 semana de dev solo (permissões + mapeamento de payloads + testes no device). Quatro conectores ≈ 3–4 semanas úteis, pois manual e Calendar são mais rápidos. Ver §5.

### 2.3. Modelo de evento e timeline (🟢)

Toda fonte normaliza para a **unidade atômica** do Atlas: o **Event** (ver definição canônica em [`ATLAS_MASTER_CONTEXT`](ATLAS_MASTER_CONTEXT.md) §2 e detalhe em [`11_Event_Model.md`](11_Event_Model.md)).

- **Escrita:** *Event Sourcing "lite"* — tabela `events` append-only + read models derivados (ADR-0002). Nada de ES/CQRS formal no MVP.
- **Estrutura mínima do evento:** `id`, `user_id`, `type` (ex.: `sleep.recorded`, `location.visited`, `calendar.event`, `manual.note`, `manual.expense`), `source`, `occurred_at`, `payload` (JSONB), `created_at`.
- **Timeline:** uma **visão unificada e cronológica** de todos os eventos, filtrável por domínio/tipo/período. É a materialização visível do CMHL — a primeira coisa que faz o autor sentir "isto é *minha vida* num lugar só".
- **Read models mínimos:** agregação diária por domínio (ex.: `daily_sleep`, `daily_activity`, `daily_places`) para alimentar timeline, busca e insights sem varrer o log inteiro.

**Por que timeline é 🟢 e não uma feature "bonita" opcional:** a timeline é a *prova de que a unificação aconteceu*. Sem ela, o cross-domain é abstrato; com ela, o autor **vê** sono, lugares e agenda lado a lado no mesmo dia. É o artefato que torna a tese tangível.

### 2.4. Busca (pgvector) (🟢)

Busca semântica sobre o CMHL usando **pgvector** — a extensão de vetores do PostgreSQL (ADR-0004, ADR-0008).

- **O que é:** embeddings (via API de embeddings, ver [`12`](12_AI_Architecture.md)) de eventos/notas/insights, armazenados em coluna `vector` no Postgres, consultados por similaridade (distância de cosseno) com índice **HNSW/IVFFlat**.
- **Por que pgvector e não Qdrant no MVP:** **zero infraestrutura extra**. Um único banco (Postgres) faz verdade transacional + busca vetorial. Qdrant só entra (🟡) quando pgvector limitar (>~1–5M vetores ou latência inaceitável) — o que **não acontece com um usuário** (ADR-0008).
- **Uso no MVP:** busca em linguagem natural ("quando fui à praia?", "notas sobre ansiedade") + recuperação de contexto (RAG) para explicar insights.
- **Controle de custo:** **cache agressivo de embeddings por hash de conteúdo** (não re-embeddar o que não mudou) — ver [`12`](12_AI_Architecture.md) e §2.6.

> 💡 **Estimativa (raciocínio):** com 1 usuário gerando ~50–200 eventos/dia, o CMHL acumula ~10k–70k eventos/ano. Embeddar só o que é textual/buscável (notas, títulos de calendário, lugares) → alguns milhares de vetores/ano. pgvector lida com isso com folga; Qdrant seria over-engineering (ADR-0008).

### 2.5. Primeiros insights — heurística/estatística ANTES de LLM (🟢)

Esta é a decisão que **define a alma técnica** do MVP: *"heurística antes de neurônio"* (ADR-0006, [`ATLAS_MASTER_CONTEXT`](ATLAS_MASTER_CONTEXT.md) §5.4).

**Pipeline de inferência do MVP (ordem obrigatória):**

```
1. Regras determinísticas  →  2. Estatística  →  3. (opcional) LLM só para redigir/explicar
```

- **Camada 1 — Regras:** limiares e detecções simples ("dormiu <6h", "gastou acima da média num sábado"). Baratas, explicáveis, 100% locais.
- **Camada 2 — Estatística:** correlações e comparações entre domínios (médias condicionais, diferença de grupos, correlação de Pearson/Spearman com tamanho de amostra e significância mínima). É aqui que nasce o **insight cross-domain**.
- **Camada 3 — LLM (opcional, opt-in):** **não descobre** o insight; apenas o **traduz** para linguagem natural agradável, quando o autor quiser. O insight já existe sem LLM.

**Os 1–2 insights cross-domain-alvo do MVP** (exemplos concretos que servem de meta de "pronto"):

| Insight-alvo | Domínios cruzados | Método (heurística/estatística) | Por que é a prova da tese |
|---|---|---|---|
| **"Você dorme ~X min a menos nas noites após treino tarde."** | Health (sono) × Health (treino) + hora | Comparação de médias condicionais: sono \| treino após 20h vs. sem treino tarde. Reportar Δ + n de noites. | Cruza dois sinais do mesmo domínio por *tempo* — insight impossível num app de sono puro. |
| **"Seus gastos sobem em dias com >4 reuniões."** ou **"Seu humor cai nos dias fora de casa por >10h."** | (Calendar × gasto manual) ou (Location × humor manual) | Correlação/diferença de grupos com n mínimo e limiar de efeito. | Cruza domínios *completamente diferentes* (agenda × dinheiro, ou espaço × subjetivo). É a demonstração pura do vácuo de mercado. |

> **Regra de explicabilidade (inegociável):** todo insight aponta para os eventos-evidência que o originaram (ver [`ATLAS_MASTER_CONTEXT`](ATLAS_MASTER_CONTEXT.md) §7.3). No MVP, "ver evidências" = listar as noites/dias/eventos que entraram no cálculo. Sem evidência, não é insight — é ruído perigoso.

**Por que estatística antes de ML/LLM:**
- **Custo:** roda no device/servidor sem tokens. Custo marginal ≈ 0.
- **Explicabilidade:** "média de 6h20 em 12 noites vs. 7h00 em 30 noites" é auditável; "o LLM achou" não é.
- **Honestidade:** com poucos dados, correlação frágil deve ser marcada como *hipótese*, não como verdade — algo que regras estatísticas fazem naturalmente e LLMs escondem.

### 2.6. Privacidade — export/delete (🟢)

Privacidade **é arquitetura, não feature** ([`ATLAS_MASTER_CONTEXT`](ATLAS_MASTER_CONTEXT.md) §6; detalhe em [`15`](15_Privacy_Architecture.md)). No MVP, isso se concretiza em:

- **Local-first funcional (T1):** o app é usável 100% offline (Expo SQLite + Drizzle). A nuvem é réplica opcional (ADR-0003, ADR-0010).
- **Export total:** exportação de todo o CMHL em formato aberto (JSON e/ou SQLite) a qualquer momento — o usuário sai com **tudo**.
- **Delete real:** deleção efetiva (não *soft delete* cosmético) de dados no device e no servidor, incluindo eventos, read models e embeddings.
- **Conectores opt-in granulares:** cada fonte é ligada/desligada individualmente; minimização de dados por padrão.
- **IA opt-in:** enviar qualquer dado a um LLM externo é **opt-in explícito**. Sem consentimento, o Atlas funciona só com heurística/estatística — e ainda gera insight.

**Por que isso é MVP e não V1:** confiança não se retrofita. A promessa central do produto é "seu modelo é seu"; adiar export/delete quebraria a tese de confiança ([`00`](00_Project_Vision.md) §4.4) e violaria LGPD/GDPR *by design*.

### 2.7. Onboarding (🟢)

O onboarding existe para cumprir o **Objetivo O1 — insight em minutos** ([`00`](00_Project_Vision.md) §6.1).

Fluxo mínimo:
1. **Boas-vindas + promessa de privacidade** (local-first explicado em uma tela).
2. **Conectar 1 fonte densa** (Health Connect/HealthKit) — permissão granular.
3. **Ingestão retroativa:** puxar histórico disponível (ex.: últimos 30–90 dias de sono/atividade) para ter **dados suficientes para um insight na 1ª sessão**.
4. **Primeiro "aha":** mostrar timeline populada + 1 observação heurística imediata (ex.: "sua média de sono nos últimos 30 dias foi 6h50").
5. **Convite ao dogfooding:** registrar 1 dado manual (humor de hoje) para semear o cross-domain.

> **Meta de onboarding:** do primeiro toque ao primeiro insight visível em **< 5 minutos**, sem exigir que o usuário "espere dias acumulando dados" — daí a importância da ingestão retroativa.

---

## 3. O que fica FORA do MVP (e por quê)

Cortar é a competência central do fundador solo. Cada item abaixo é **deliberadamente adiado** com fase e gatilho de entrada (ver [`21`](21_Roadmap.md)). **Regra dura:** nada de 🟡/🟠 dentro do 🟢 MVP ([`ATLAS_MASTER_CONTEXT`](ATLAS_MASTER_CONTEXT.md) §4).

| Fora do MVP | Fase | Gatilho de entrada | Por que NÃO agora |
|---|---|---|---|
| **Grafo nativo Neo4j** | 🟡 V2 | Quando queries de grafo multi-hop em SQL "doerem" (ADR-0007) | O grafo *começa no PostgreSQL* (tabelas `entities` + `relationships`, CTEs recursivas). Com 1 usuário e poucos hops, SQL basta. Neo4j é mais um data store para operar — custo que não se paga no MVP. |
| **Qdrant (vector DB dedicado)** | 🟡 | pgvector limitar (>~1–5M vetores/latência) (ADR-0008) | pgvector cobre 1 usuário com folga (§2.4). Adicionar Qdrant = +1 serviço, +1 fonte de bugs, zero benefício no MVP. |
| **Muitos conectores** (finanças auto, e-mail, mensagens, streaming, browser…) | 🔵/🟡 | Após os 4 conectores provarem o loop; por dor real de dado faltante | Cada conector é manutenção perpétua (APIs quebram). 4 conectores densos provam a tese; 20 conectores rasos só criam superfície de falha. |
| **Colaboração / multi-usuário / compartilhamento** | 🟡 | Demanda real de usuários + modelo de permissão maduro | O CMHL é *de um*. Colaboração multiplica complexidade de privacidade, sync e permissões — o oposto do foco. |
| **Agentes autônomos** (que agem em nome do usuário) | 🔴 Pesquisa | Confiança + segurança + CMHL maduro | Agir no mundo real exige garantias de segurança que nem o produto nem a confiança do usuário têm no MVP. Visão de anos 6–10 ([`00`](00_Project_Vision.md) §9). |
| **LLM como peça central / chatbot** | — (anti-objetivo) | — | O Atlas *não é* um chatbot com memória ([`ATLAS_MASTER_CONTEXT`](ATLAS_MASTER_CONTEXT.md) §1.1). LLM é interpretador opcional, nunca o produto. |
| **On-device AI (SLMs locais)** | 🟡/🟠 | Custo/privacidade justificarem + NPUs maduras | Heurística já resolve o MVP sem LLM. Modelos locais são otimização futura ([`12`](12_AI_Architecture.md)). |
| **CQRS/ES completo, microserviços, Kafka** | 🟠 Escala | Limites de performance/custo forçarem | Modular monolith + ES-lite bastam para 1→milhares (ADR-0001, ADR-0002). |
| **E2EE, passkeys/WebAuthn** | 🔵/🟡 | Base de usuários + dados sensíveis no servidor | JWT + TLS + criptografia em repouso cobrem o MVP; E2EE é evolução de confiança ([`15`](15_Privacy_Architecture.md)). |
| **Multi-região / multi-AZ** | 🟡/🟠 | Escala geográfica e SLA | 1 região AWS basta para 1 usuário (ADR + [`27_DevOps.md`](27_DevOps.md)). |

> **Princípio de corte:** *"Toda tecnologia precisa de justificativa e de uma fase de entrada."* ([`ATLAS_MASTER_CONTEXT`](ATLAS_MASTER_CONTEXT.md) §3). Se não há dor real hoje, é 🟡+.

---

## 4. Critérios de "pronto" e métricas de sucesso

### 4.1. Critérios de "pronto" (Definition of Done do MVP)

O MVP está "pronto" quando **todos** os critérios abaixo forem verdadeiros. Note que os critérios são majoritariamente **comportamentais** — o MVP é validado por uso, não por checklist de features.

| # | Critério | Como se mede |
|---|---|---|
| **D1** | O loop de valor (§2.1) fecha de ponta a ponta para 1 usuário | O autor conecta fontes → vê timeline → recebe insight → age. Demonstrável num fluxo único. |
| **D2** | Os **4 conectores** ingerem dados reais no device do autor | Eventos das 4 fontes aparecem normalizados na tabela `events` e na timeline. |
| **D3** | A busca semântica (pgvector) retorna resultados relevantes | Consultas em linguagem natural do autor retornam os eventos certos (avaliação qualitativa do autor). |
| **D4** | **≥1 insight cross-domain real, explicável e não óbvio** foi gerado por heurística/estatística | O insight aponta evidências; o autor confirma que é verdadeiro e que ele *não sabia* explicitamente. |
| **D5** | Export e delete totais funcionam | Export produz arquivo completo reimportável; delete remove de fato (device + servidor + embeddings). |
| **D6** | Onboarding entrega primeiro insight em < 5 min | Cronometrado num device limpo. |
| **D7** | **Custo de IA marginal por usuário/mês ≈ 0** no uso normal | Sem LLM no caminho crítico; embeddings cacheados. Ver [`12`](12_AI_Architecture.md). |
| **D8** (o teste real) | **O autor usa o Atlas diariamente por ≥30 dias sem obrigação** | *Dogfooding streak* ≥ 30 dias. |

### 4.2. Métrica de sucesso do MVP

- **Métrica-mãe (North Star, herdada de [`00`](00_Project_Vision.md) §11):** *Insights acionados por semana* — insight que o usuário marcou como útil **ou** que gerou uma ação/decisão.
  - **Meta MVP:** ≥ 1 insight acionado por semana, sustentado, para o autor.
- **Pré-requisito duro (gate):** **Dogfooding retention** — o autor abre e usa o Atlas ≥ 5 dias/semana por 4+ semanas. Se essa métrica cai, nenhuma outra importa: significa que o produto não é útil o bastante nem para quem o construiu.
- **Métrica de confiança (qualitativa):** o autor se sente confortável colocando dados sensíveis reais (não fake) porque confia no local-first + export/delete.

> **Anti-métricas (o que NÃO medimos no MVP):** número de features, número de conectores, "engajamento" por tempo de tela, downloads. São métricas de vaidade nesta fase. O MVP mede *compreensão real*, não atividade.

---

## 5. Sequência de construção (marco a marco)

Ordem otimizada para **fechar o loop de valor o quanto antes** e começar o dogfooding cedo — cada marco entrega algo *usável pelo autor*. Prazos em semanas são **estimativas de um fundador solo em tempo parcial** (raciocínio: ~10–15h úteis/semana; ajuste conforme a realidade).

| Marco | Semanas (est.) | Entrega | Por que nesta ordem |
|---|---|---|---|
| **M0 — Fundação** | 1–2 | Monorepo, Docker Compose (Postgres+pgvector+Redis), NestJS modular monolith, app RN/Expo com SQLite+Drizzle, esqueleto de auth (JWT) | Sem o esqueleto, nada roda. Boring tech primeiro (ADR-0001/0004/0009). |
| **M1 — Evento + Timeline + Manual** | 2–3 | Tabela `events` append-only, entrada **manual**, timeline unificada, read models diários | O menor loop possível já entrega valor: registrar e ver a vida numa linha do tempo. **Dogfooding começa aqui.** |
| **M2 — Health Connect/HealthKit** | 3–4 | Conector de saúde + ingestão retroativa (30–90 dias) | Domínio mais denso; enche a timeline com dados reais e retroativos → habilita insights logo. |
| **M3 — Insights heurísticos (intra-domínio)** | 4–5 | Pipeline regras+estatística; primeiros insights de sono/atividade + tela de evidências | Prova o motor de inferência explicável antes de complicar com cross-domain. |
| **M4 — Location + Calendar** | 5–6 | Conectores de localização e agenda (OAuth) | Adiciona os eixos *espaço* e *tempo estruturado* → destrava o cross-domain de verdade. |
| **M5 — Insight cross-domain (a prova)** | 6–7 | 1–2 insights cruzando domínios (§2.5) com evidências | **Este marco valida a tese.** É o momento de verdade do MVP. |
| **M6 — Busca semântica (pgvector)** | 7–8 | Embeddings + busca em linguagem natural + cache por hash | Torna o CMHL *interrogável*; base do RAG e da explicabilidade futura. |
| **M7 — Privacidade (export/delete) + Onboarding** | 8–9 | Export total, delete real, fluxo de onboarding < 5 min | Fecha a promessa de confiança e prepara o produto para o autor + poucos usuários. |
| **M8 — Endurecimento + dogfooding sério** | 9+ | Correções de uso real, observabilidade mínima (pino+Sentry), medição do North Star | O MVP "termina" no uso, não no código. 30 dias de dogfooding = gate D8. |

> 💡 **Estimativa total (raciocínio):** ~9 semanas de trabalho focado até o loop completo, +30 dias de dogfooding para validar. Em tempo parcial realista, planeje **3–5 meses** de calendário. Datas são direcionais; **gatilhos importam mais que datas** ([`00`](00_Project_Vision.md) §10).

**Regra de sequenciamento:** nunca construir dois marcos "à frente" sem ter usado o anterior por alguns dias. O dogfooding entre marcos é o que impede *over-engineering*.

---

## 6. Riscos do MVP

| Risco | Prob. (est.) | Impacto | Mitigação | Sinal de alerta |
|---|---|---|---|---|
| **Escopo excessivo (o maior risco do fundador solo)** | Alta | Fatal (nunca lança) | Disciplina de fases 🟢→🔴; cortar tudo que não serve à prova cross-domain; §3 como escudo | Adicionar Neo4j/agentes "porque seria legal" |
| **Insight cross-domain não aparece (tese falha)** | Média | Fatal (invalida o produto) | Escolher insights-alvo com base estatística sólida (§2.5); começar com dados densos (Health); marcar hipóteses fracas como hipóteses | Após meses de dados, nenhum padrão robusto emerge |
| **APIs de plataforma mudam/fecham** | Média | Médio | **Entrada manual** como fallback universal; local-first; valor mesmo com poucas fontes ([`00`](00_Project_Vision.md) §12) | Health Connect/Calendar quebram após update |
| **Custo de IA escapa** | Baixa (por design) | Médio | Heurística antes de LLM; cache de embeddings por hash; LLM opt-in fora do caminho crítico ([`12`](12_AI_Architecture.md)) | Fatura de embeddings/LLM cresce com uso |
| **Fadiga do fundador / abandono** | Média | Fatal | Marcos curtos e usáveis; dogfooding gera recompensa intrínseca cedo (M1); sem prazo comercial reduz pressão | Semanas sem commit; Atlas não é aberto pelo próprio autor |
| **Privacidade mal implementada (vazamento)** | Baixa | Fatal (destrói confiança) | Local-first, mínimo de dado no servidor, delete real, TLS + criptografia em repouso ([`15`](15_Privacy_Architecture.md)) | Dado sensível trafegando sem consentimento explícito |
| **Complexidade de sync local↔nuvem** | Média | Médio | Sync engine próprio *simples* (push/pull por `updated_at` + fila de mutações), não CRDT no MVP (ADR-0003) | Conflitos de merge frequentes / dados divergentes |
| **Qualidade de dados de sensores (ruído/lacunas)** | Média | Médio | Read models com tratamento de nulos; insights só com n mínimo; transparência sobre lacunas | Insights baseados em amostras minúsculas |

---

## 7. Ligações e próximos passos

- **Requisitos detalhados por feature:** [`04_Product_Requirements.md`](04_Product_Requirements.md)
- **Como o sistema se encaixa:** [`07_System_Architecture.md`](07_System_Architecture.md)
- **Modelo de evento / ES-lite:** [`11_Event_Model.md`](11_Event_Model.md)
- **Custo de IA / RAG / embeddings:** [`12_AI_Architecture.md`](12_AI_Architecture.md)
- **Export/delete, LGPD/GDPR:** [`15_Privacy_Architecture.md`](15_Privacy_Architecture.md)
- **O que vem depois do MVP:** [`21_Roadmap.md`](21_Roadmap.md)
- **Como isso vira negócio:** [`22_Business_Model.md`](22_Business_Model.md)

> **Mantra do MVP:** *o menor produto que prova que unir a vida gera sabedoria — usado todo dia por quem o construiu, a custo de IA quase zero, sem jamais deixar de ser do usuário.*
