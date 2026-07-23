# 25 — Risks (Registro de Riscos do Atlas)

> **Fase geral:** Fundacional (atemporal, revisão contínua) · **Leia antes:** [`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md) · [`00_Project_Vision.md`](00_Project_Vision.md)
> **Documentos relacionados:** `12_AI_Architecture`, `15_Privacy_Architecture`, `16_Security`, `24_ADRs`, `21_Roadmap`, `22_Business_Model`, `23_Research`
> **Status:** Vivo · **Versão:** 0.1 · **Última atualização:** 2026-07-20
> **Dono geral do registro:** Fundador (revisão mensal; ver §9)

---

## 0. Propósito e método

Este é o **registro de riscos canônico** do Atlas. Sua função é transformar medos difusos em
**itens gerenciáveis, medíveis e com dono**. Um risco que não está aqui não está sendo gerenciado.

Como fundador solo, o autor não tem um "comitê de risco" — este documento **é** o comitê. Ele
segue o princípio-mestre: *"Projete como um arquiteto sênior; pense como um fundador solo"*
([`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md) §3).

### 0.1. Anatomia de cada risco

Cada risco tem: **ID · descrição · categoria · probabilidade · impacto · exposição (P×I) ·
sinais de alerta (leading indicators) · mitigação · plano de contingência · dono · fase**.

### 0.2. Escalas

**Probabilidade (P):**

| Nível | Rótulo | Significado |
|---|---|---|
| 1 | Raro | Improvável no horizonte de 2 anos |
| 2 | Baixo | Pode acontecer, mas não esperado |
| 3 | Médio | Tão provável quanto não |
| 4 | Alto | Provavelmente acontecerá |
| 5 | Quase certo | Aconteceria sem mitigação ativa |

**Impacto (I):**

| Nível | Rótulo | Significado |
|---|---|---|
| 1 | Insignificante | Aborrecimento; sem efeito no projeto |
| 2 | Menor | Atraso pequeno / retrabalho localizado |
| 3 | Moderado | Atraso relevante / perda de usuários |
| 4 | Grave | Ameaça a um pilar do produto |
| 5 | Catastrófico | **Pode matar o projeto** |

**Exposição = P × I** (1–25). Faixas: **1–6 Baixo 🟢 · 8–12 Médio 🟡 · 15–25 Alto 🔴.**

### 0.3. Matriz de risco (probabilidade × impacto)

Cada célula lista os **IDs** de risco (ver seções por categoria). ↑ impacto, → probabilidade.

| I \ P | 1 Raro | 2 Baixo | 3 Médio | 4 Alto | 5 Quase certo |
|---|---|---|---|---|---|
| **5 Catastrófico** | | S-1 (vazamento) | P-3 (não-uso), M-1 (Big Tech) | AI-2 (causa espúria) | |
| **4 Grave** | L-1 (regulatório) | M-2 (APIs fecham), S-2 (LGPD) | T-3 (custo IA), F-1 (burnout) | AI-1 (alucinação), PR-1 (time-to-value) | F-2 (escopo) |
| **3 Moderado** | E-1 (escala prematura infra) | T-2 (sync), E-2 (perf) | T-1 (complexidade), T-4 (dívida), PR-2 (engajamento) | AI-3 (viés) | |
| **2 Menor** | | T-5 (lock-in fornecedor) | F-3 (bus factor) | | |
| **1 Insignificante** | | | | | |

> Leitura rápida: o **quadrante superior-direito** (alto P, alto I) é onde mora o perigo real.
> Os **Top 10** (§8) saem majoritariamente de lá.

### 0.4. Legenda de fases (ver [`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md) §4)

🟢 MVP · 🔵 V1 · 🟡 V2 · 🟠 Escala · 🔴 Pesquisa/Futuro.

---

## 1. Riscos Técnicos (T)

### T-1 — Complexidade prematura / over-engineering
- **Descrição:** adotar microserviços, Kafka, Neo4j, Qdrant, CRDTs "porque é moderno", matando a
  velocidade de um dev solo. É o **anti-objetivo nº 1** ([`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md) §3).
- **P:** 3 · **I:** 3 · **Exposição:** 9 🟡
- **Sinais de alerta:** PRs que introduzem infra sem "fase de entrada" definida; ADR ausente para
  decisão nova; tempo de setup do ambiente subindo; "vou só adicionar o Kafka".
- **Mitigação:** disciplina de fases (🟢→🔴); toda tecnologia precisa de **gatilho de entrada** e
  **ADR** ([`24_ADRs`](24_ADRs.md)); lema *make it work → right → scalable*; "boring tech por padrão".
- **Contingência:** se já introduzido, reverter (decisões reversíveis) e registrar aprendizado.
- **Dono:** Fundador · **Fase:** 🟢

### T-2 — Complexidade de sincronização (local-first sync)
- **Descrição:** o sync engine próprio (push/pull por `updated_at` + fila de mutações) gera
  conflitos, duplicações ou perda de dados multi-device.
- **P:** 2 · **I:** 3 · **Exposição:** 6 🟢
- **Sinais de alerta:** bugs de dados duplicados/divergentes; usuários relatando "sumiu"; fila de
  mutações crescendo sem drenar.
- **Mitigação:** começar simples (ADR-0003), um device primário no MVP; testes de sync; eventos
  imutáveis + idempotência facilitam reconciliação.
- **Contingência:** WatermelonDB (🟡) se sync pesar; CRDTs só como 🔴 pesquisa se houver
  colaboração conflituosa real.
- **Dono:** Fundador · **Fase:** 🟢→🟡

### T-3 — Custo de IA descontrolado
- **Descrição:** chamadas a LLM/embeddings tornam o custo marginal por usuário imprevisível,
  inviabilizando o modelo de negócio ([`22_Business_Model`](22_Business_Model.md)).
- **P:** 3 · **I:** 4 · **Exposição:** 12 🟡
- **Sinais de alerta:** custo de IA/usuário/mês subindo; % de insights via LLM crescendo;
  cache-hit de embeddings caindo; picos de tokens.
- **Mitigação:** **"heurística antes de neurônio"** ([`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md) §5.4);
  cache agressivo por hash de conteúdo; modelo barato p/ maioria, forte só p/ síntese; abstração
  `LLMProvider`; teto de custo por usuário; medir T2 ([`00_Project_Vision`](00_Project_Vision.md) §6.2).
- **Contingência:** on-device AI (🟡) para dados sensíveis/volumosos; rebaixar features caras.
- **Dono:** Fundador · **Fase:** 🟢 · **Ver:** [`12_AI_Architecture`](12_AI_Architecture.md)

### T-4 — Dívida técnica acumulada (solo)
- **Descrição:** velocidade solo cria atalhos que se acumulam e travam a evolução.
- **P:** 3 · **I:** 3 · **Exposição:** 9 🟡
- **Sinais de alerta:** medo de mexer em módulos; cobertura de teste caindo; tempo de feature
  subindo; TODOs antigos.
- **Mitigação:** Clean Arch + DDD por módulo (fronteiras claras); testes no núcleo
  ([`26_Testing`](26_Testing.md)); refactor contínuo (fase *make it right*); ADRs para o irreversível.
- **Contingência:** "semana de dívida" periódica; congelar features até estabilizar.
- **Dono:** Fundador · **Fase:** 🟢+

### T-5 — Lock-in de fornecedor (LLM/cloud/APIs)
- **Descrição:** dependência de um provedor de LLM/cloud que muda preço, política ou encerra.
- **P:** 2 · **I:** 2 · **Exposição:** 4 🟢
- **Sinais de alerta:** provider anunciando mudanças; código acoplado a SDK proprietário.
- **Mitigação:** abstração `LLMProvider` (troca fácil, ADR-0006); boring tech portável (Postgres,
  Redis); IaC/Docker; dados exportáveis.
- **Contingência:** trocar provider via camada de abstração; multi-provider.
- **Dono:** Fundador · **Fase:** 🟢

---

## 2. Riscos de Produto (PR)

### PR-1 — Time-to-value longo (não há "insight em minutos")
- **Descrição:** o usuário não recebe valor na primeira sessão (viola O1) porque precisa conectar
  muitas fontes antes de qualquer insight → churn imediato.
- **P:** 4 · **I:** 4 · **Exposição:** 16 🔴 **(Top 10)**
- **Sinais de alerta:** tempo até primeiro insight alto; abandono no onboarding; poucos conectores
  ativados na 1ª sessão; feedback "não entendi para que serve".
- **Mitigação:** O1/O2 como requisito ([`00_Project_Vision`](00_Project_Vision.md) §6.1); entrada
  manual + 1 conector rápido geram insight mesmo com poucos dados; onboarding que promete e
  entrega um insight cedo; ver [`06_User_Journey`](06_User_Journey.md).
- **Contingência:** insights "seed" com dados mínimos; templates; reduzir fricção de conexão.
- **Dono:** Fundador · **Fase:** 🟢

### PR-2 — "Vitamina, não analgésico" (baixo engajamento)
- **Descrição:** o Atlas é "bom ter" mas não resolve dor aguda → uso esporádico, retenção baixa.
  É o risco de produto **mais existencial** depois do time-to-value.
- **P:** 3 · **I:** 5 → tratado como **P:3 / I:5 = 15 🔴** **(Top 10)**
- **Sinais de alerta:** retenção D30/D90 baixa; North Star (insights acionados/semana) estagnado;
  sessões curtas e raras; NPS morno.
- **Mitigação:** focar em **insights acionáveis** (não gráficos — anti-QS, [`23_Research`](23_Research.md) §3);
  ligar insight → ação (behavior change, [`23_Research`](23_Research.md) §9); achar 1 caso de dor
  aguda (âncora) por persona ([`05_User_Personas`](05_User_Personas.md)); loops de valor semanais.
- **Contingência:** repivotar mensagem/nicho para uma dor mais aguda; feature "analgésica" âncora.
- **Dono:** Fundador · **Fase:** 🟢🔵

### PR-3 — Produto não é usado nem pelo próprio autor (dogfooding falha)
- **Descrição:** se o fundador não usa diariamente, a tese (prove com o próprio autor) falha.
- **P:** 3 · **I:** 5 · **Exposição:** 15 🔴 **(Top 10)**
- **Sinais de alerta:** dias sem abrir o app; insights que o próprio autor ignora; "construo mas
  não uso".
- **Mitigação:** dogfooding é critério de MVP ([`00_Project_Vision`](00_Project_Vision.md) §10, Ano 1);
  construir primeiro o que o autor mais quer responder; medir uso próprio como sinal nº 1.
- **Contingência:** parar e redesenhar o loop de valor até o autor usar sem esforço.
- **Dono:** Fundador · **Fase:** 🟢

---

## 3. Riscos de Mercado (M)

### M-1 — Big Tech comoditiza (Apple/Google/Microsoft embutem algo similar)
- **Descrição:** uma plataforma embute "inteligência pessoal" no OS, tornando o Atlas redundante
  para o grande público.
- **P:** 3 · **I:** 5 · **Exposição:** 15 🔴 **(Top 10)**
- **Sinais de alerta:** anúncios de "AI memory/recall" em keynotes; novas APIs de "personal
  context"; features de resumo de vida no OS.
- **Mitigação:** fossos que Big Tech tem **conflito estrutural** para copiar: **cross-domain real**
  (eles têm silos e ads), **privacidade/neutralidade** (local-first, sem ads — [`00_Project_Vision`](00_Project_Vision.md) §12),
  **portabilidade** entre ecossistemas. Ser o "Suíço" neutro entre plataformas.
- **Contingência:** dobrar em nicho underserved + privacidade extrema (E2EE, on-device); posição
  B2B2C/SDK onde Big Tech não vai ([`22_Business_Model`](22_Business_Model.md)).
- **Dono:** Fundador · **Fase:** 🔵🟡

### M-2 — Plataformas fecham APIs de dados
- **Descrição:** Health Connect/HealthKit, Open Banking/PIX, Google/Microsoft Graph restringem ou
  encerram acesso → ingestão inviabilizada.
- **P:** 2 · **I:** 4 · **Exposição:** 8 🟡
- **Sinais de alerta:** mudanças de ToS; deprecação de endpoints; endurecimento de review de app.
- **Mitigação:** **valor mesmo com poucas fontes**; **entrada manual** sempre disponível;
  local-first reduz dependência; diversificar conectores; ([`00_Project_Vision`](00_Project_Vision.md) §12).
- **Contingência:** import de arquivos/exports (CSV/JSON) como fallback; foco nas fontes estáveis.
- **Dono:** Fundador · **Fase:** 🟢🔵

---

## 4. Riscos de Privacidade & Segurança (S)

> Categoria de **maior impacto potencial**. O princípio é inegociável: *privacidade é arquitetura*
> ([`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md) §6, ADR-0010). Ver [`15_Privacy_Architecture`](15_Privacy_Architecture.md)
> e [`16_Security`](16_Security.md).

### S-1 — Vazamento de dados = morte do produto
- **Descrição:** exposição dos dados mais íntimos de um usuário (saúde, localização, finanças).
  Para um produto cuja **única moeda é confiança**, um vazamento é **fatal e irreversível**.
- **P:** 2 · **I:** 5 · **Exposição:** 10 🟡 (tratado como **Top 10** pela severidade catastrófica)
- **Sinais de alerta:** alertas do Sentry/segurança; acessos anômalos; dependências com CVE;
  segredos em código; pentest com achados altos.
- **Mitigação:** **local-first** (o dado nem precisa estar no servidor); **minimização**;
  criptografia em trânsito (TLS) e repouso; roadmap **E2EE** (🟡); superfície de servidor mínima;
  segredos gerenciados; dependências auditadas; ver [`16_Security`](16_Security.md).
- **Contingência:** plano de resposta a incidente (contenção, notificação LGPD/GDPR nos prazos,
  comunicação transparente ao usuário, rotação de chaves); *kill switch* de conectores.
- **Dono:** Fundador · **Fase:** 🟢+ · **Ver:** [`16_Security`](16_Security.md)

### S-2 — Não conformidade LGPD/GDPR (inclui dados de saúde)
- **Descrição:** falha em base legal, DSAR, deleção real, DPIA — especialmente para **dados
  sensíveis de saúde** (categoria especial na LGPD/GDPR). Multas e perda de confiança.
- **P:** 2 · **I:** 4 · **Exposição:** 8 🟡
- **Sinais de alerta:** ausência de fluxo de exportação/deleção; consentimento não granular;
  falta de registro de tratamento; transferência internacional sem base.
- **Mitigação:** **LGPD/GDPR by design** ([`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md) §6.5);
  exportação total + **deleção real** desde o dia 1 (O3); consentimento **opt-in granular** por
  conector; DPIA; envio a LLM externo é opt-in e explicado; ver [`15_Privacy_Architecture`](15_Privacy_Architecture.md).
- **Contingência:** consultoria jurídica pontual; congelar tratamento problemático até adequar.
- **Dono:** Fundador · **Fase:** 🟢

---

## 5. Riscos de Escalabilidade (E)

### E-1 — Escala prematura de infraestrutura
- **Descrição:** investir em multi-região/Qdrant/data lake antes de haver usuários que justifiquem
  → custo e complexidade sem retorno. (Espelho do T-1, no eixo de infra.)
- **P:** 1 · **I:** 3 · **Exposição:** 3 🟢
- **Sinais de alerta:** provisionar infra "para o futuro"; otimizar antes de medir.
- **Mitigação:** fases de entrada explícitas ([`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md) §5.3);
  1 região, 1 deploy no MVP; medir antes de escalar.
- **Contingência:** desprovisionar; voltar ao stack mínimo.
- **Dono:** Fundador · **Fase:** 🟢

### E-2 — Limites de performance atingidos (pgvector/Postgres/grafo em SQL)
- **Descrição:** pgvector satura (latência/volume de vetores) ou queries de grafo em SQL ficam
  lentas ao crescer o CMHL de um usuário longevo.
- **P:** 2 · **I:** 3 · **Exposição:** 6 🟢
- **Sinais de alerta:** p95 de busca subindo; nº de vetores perto de ~1–5M; CTEs recursivas lentas.
- **Mitigação:** medir p95; índices adequados; snapshots/read models; gatilhos claros para migrar.
- **Contingência:** **Qdrant** (🟡, ADR-0008) quando pgvector limitar; **Neo4j** (🟡, ADR-0007)
  quando grafo em SQL doer; data lake S3+Parquet (🟠).
- **Dono:** Fundador · **Fase:** 🟡🟠 · **Ver:** [`10_Database_Design`](10_Database_Design.md), [`14_Vector_Search`](14_Vector_Search.md)

---

## 6. Riscos de Fundador Solo (F)

### F-1 — Burnout
- **Descrição:** exaustão do único recurso do projeto → o projeto para. Sem investimento e sem
  prazo, o risco é **arrastar-se até apagar**.
- **P:** 3 · **I:** 4 · **Exposição:** 12 🟡 **(Top 10)**
- **Sinais de alerta:** queda de commits/energia; ciclo de sono/humor piorando (ironicamente,
  mensurável no próprio Atlas); perda de motivação; adiamento crônico.
- **Mitigação:** ritmo sustentável; escopo por fases (fazer pouco e bem); celebrar marcos;
  dogfooding torna o trabalho recompensador (o autor é usuário nº 1); metas atemporais reduzem
  pressão de prazo.
- **Contingência:** pausar sem culpa; reduzir escopo ao núcleo; buscar co-fundador/comunidade
  (ver [`28_Open_Source_Strategy`](28_Open_Source_Strategy.md)).
- **Dono:** Fundador · **Fase:** 🟢+

### F-2 — Escopo excessivo (scope creep)
- **Descrição:** a **visão é enorme** (infraestrutura de 10 anos); a tentação de construir demais
  cedo é o modo de falha mais provável de um fundador solo.
- **P:** 5 · **I:** 4 · **Exposição:** 20 🔴 **(Top 10 — nº 1 de exposição bruta)**
- **Sinais de alerta:** MVP inchando; itens 🟡/🟠 aparecendo no 🟢; "só mais essa feature"; nenhum
  lançamento à vista.
- **Mitigação:** **regra dura**: nunca 🟡/🟠 dentro do 🟢 ([`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md) §4);
  MVP mínimo e brutal ([`20_MVP`](20_MVP.md)); disciplina de fases; este registro como freio.
- **Contingência:** cortar escopo até caber; congelar backlog; "definition of done" do MVP fixa.
- **Dono:** Fundador · **Fase:** 🟢

### F-3 — Bus factor = 1
- **Descrição:** todo o conhecimento e acesso está numa pessoa; doença/perda de acesso interrompe
  tudo e ninguém consegue continuar.
- **P:** 3 · **I:** 2 · **Exposição:** 6 🟢 (mas de severidade alta se materializado)
- **Sinais de alerta:** documentação desatualizada; segredos só na cabeça do autor; sem backups.
- **Mitigação:** **esta documentação** (00–30) é a principal mitigação; ADRs registram o "porquê";
  backups de dados e segredos (gerenciador de segredos); código versionado; IaC.
- **Contingência:** runbook de continuidade; herança digital de acessos; open source (28) amplia
  o fator ônibus.
- **Dono:** Fundador · **Fase:** 🟢+

---

## 7. Riscos Legais/Regulatórios (L) e de IA (AI)

### L-1 — Mudança regulatória (IA, dados de saúde, dados pessoais)
- **Descrição:** novas regras (ex.: regulação de IA, regras de dados de saúde, mudanças na
  LGPD/GDPR) impõem obrigações caras a um dev solo.
- **P:** 1 · **I:** 4 · **Exposição:** 4 🟢
- **Sinais de alerta:** projetos de lei/consultas públicas; guidance de autoridades; concorrentes
  ajustando termos.
- **Mitigação:** privacidade/local-first já excede a maioria das exigências (adequação
  antecipada); arquitetura minimiza dados no servidor; acompanhar guidance.
- **Contingência:** ajustar termos/DPIA; restringir features reguladas por jurisdição.
- **Dono:** Fundador · **Fase:** 🔵🟡

### AI-1 — Alucinação do LLM
- **Descrição:** o LLM afirma algo falso sobre a vida do usuário (evento que não ocorreu, número
  errado) → destrói a confiança no núcleo do produto.
- **P:** 4 · **I:** 4 · **Exposição:** 16 🔴 **(Top 10)**
- **Sinais de alerta:** insights sem evidência clicável; usuários reportando "isso nunca
  aconteceu"; taxa de alucinação em red-team subindo.
- **Mitigação:** **RAG sobre o CMHL** — o LLM só **interpreta** conteúdo recuperado, não inventa
  ([`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md) §5.4); **rastreabilidade 100%** (todo
  insight aponta eventos, [`23_Research`](23_Research.md) §8, §12); heurística/estatística antes de
  LLM; red-teaming de alucinação.
- **Contingência:** suprimir insights não ancorados; rebaixar LLM a papel menor; verificação
  factual automática contra eventos.
- **Dono:** Fundador · **Fase:** 🟢 · **Ver:** [`12_AI_Architecture`](12_AI_Architecture.md)

### AI-2 — Correlação espúria apresentada como causa
- **Descrição:** o Atlas afirma "X **causa** Y" quando só há correlação/confundidor → o usuário
  toma **decisões de vida/saúde erradas**. É o risco de IA **eticamente mais grave**.
- **P:** 4 · **I:** 5 · **Exposição:** 20 🔴 **(Top 10 — risco ético nº 1)**
- **Sinais de alerta:** linguagem causal ("causa", "faz com que") em insights; ausência de
  aviso de incerteza; usuários agindo sobre correlações fracas.
- **Mitigação:** **postura de honestidade** ([`23_Research`](23_Research.md) §7): no MVP/V1 falar
  em **correlação e tendência**, nunca causa; exibir **força da evidência** (amostra, período,
  confundidores); causalidade formal é 🔴 pesquisa; oferecer **n-of-1 trials** para transformar
  hipótese em evidência; meta de **taxa de sobre-afirmação causal ~0%** ([`23_Research`](23_Research.md) §12).
- **Contingência:** revisão de todo template de linguagem de insight; desativar categoria de
  insight problemática.
- **Dono:** Fundador · **Fase:** 🟢🔴 · **Ver:** [`23_Research`](23_Research.md) §7

### AI-3 — Viés (bias) e insights injustos/nocivos
- **Descrição:** o modelo reflete vieses (culturais, de gênero, de saúde) e produz insights
  enviesados, estigmatizantes ou nocivos (ex.: julgamentos sobre humor, corpo, hábitos).
- **P:** 4 · **I:** 3 · **Exposição:** 12 🟡 **(Top 10)**
- **Sinais de alerta:** feedback negativo em categorias sensíveis; padrões de 👎 concentrados;
  linguagem julgadora nos outputs.
- **Mitigação:** tom não-julgador por design; evitar categorias sensíveis sem base;
  human-in-the-loop (usuário corrige, marca útil/errado); guidelines de HAI ([`23_Research`](23_Research.md) §8);
  avaliação de fairness em amostras.
- **Contingência:** filtros/guardrails de conteúdo; remover categorias problemáticas.
- **Dono:** Fundador · **Fase:** 🔵🟡

---

## 8. Top 10 riscos priorizados

Ordenados por **exposição** (com peso extra para severidade catastrófica/ética):

| # | ID | Risco | Cat. | P×I | Nível | Dono |
|---|---|---|---|---|---|---|
| 1 | **F-2** | Escopo excessivo (scope creep) | Fundador | 20 | 🔴 | Fundador |
| 2 | **AI-2** | Correlação espúria apresentada como causa | IA/Ética | 20 | 🔴 | Fundador |
| 3 | **AI-1** | Alucinação do LLM | IA | 16 | 🔴 | Fundador |
| 4 | **PR-1** | Time-to-value longo | Produto | 16 | 🔴 | Fundador |
| 5 | **M-1** | Big Tech comoditiza | Mercado | 15 | 🔴 | Fundador |
| 6 | **PR-2** | "Vitamina, não analgésico" | Produto | 15 | 🔴 | Fundador |
| 7 | **PR-3** | Falha de dogfooding | Produto | 15 | 🔴 | Fundador |
| 8 | **T-3** | Custo de IA descontrolado | Técnico | 12 | 🟡 | Fundador |
| 9 | **F-1** | Burnout | Fundador | 12 | 🟡 | Fundador |
| 10 | **AI-3** | Viés nos insights | IA | 12 | 🟡 | Fundador |

> **Menção honrosa (fora do Top 10 por probabilidade, mas de impacto catastrófico):**
> **S-1 — Vazamento de dados** (P×I=10, mas I=5 fatal). Deve ser tratado com a seriedade de um
> Top 3 apesar da baixa probabilidade — a assimetria de dano justifica investimento contínuo em
> [`16_Security`](16_Security.md).

### 8.1. Padrão revelado pelo Top 10

Os riscos dominantes **não são de tecnologia**, e sim de **disciplina (F-2), honestidade da IA
(AI-2, AI-1) e valor ao usuário (PR-1/2/3)**. Isto confirma a tese do projeto: a IA é commodity;
o difícil é **foco, confiança e utilidade real**.

---

## 9. Governança do risco (cadência e ligações)

### 9.1. Rotina de revisão

| Cadência | Ação |
|---|---|
| **Mensal** | Revisar Top 10; atualizar P/I; checar leading indicators; registrar novos riscos. |
| **Por decisão grande** | Todo ADR ([`24_ADRs`](24_ADRs.md)) deve listar os riscos que cria/mitiga. |
| **Por incidente** | Post-mortem sem culpa → vira mitigação/contingência aqui. |
| **Por fase** | Ao entrar em 🔵/🟡/🟠, reavaliar riscos de escala, mercado e conformidade. |

### 9.2. Ligações com outros documentos (conforme solicitado)

- **[`15_Privacy_Architecture`](15_Privacy_Architecture.md)** — mitiga **S-1, S-2, AI-2** (privacidade
  by design, LGPD/GDPR, dados de saúde, consentimento granular, deleção real).
- **[`16_Security`](16_Security.md)** — mitiga **S-1, T-5** (auth, ataques, segredos, resposta a
  incidente, E2EE roadmap).
- **[`12_AI_Architecture`](12_AI_Architecture.md)** — mitiga **T-3, AI-1, AI-2, AI-3** (heurística
  antes de LLM, cache/custo, RAG anti-alucinação, abstração de provider).
- **[`24_ADRs`](24_ADRs.md)** — mitiga **T-1, T-4, E-1, F-3** (decisões registradas, reversíveis,
  fases de entrada, "porquê" preservado). Toda ADR referencia os riscos que endereça.
- Reforços: **[`23_Research`](23_Research.md)** (§7 causal, §8 XAI, §12 avaliação) fundamenta as
  mitigações de **AI-1/AI-2/AI-3**; **[`20_MVP`](20_MVP.md)** e **[`21_Roadmap`](21_Roadmap.md)**
  operacionalizam o combate a **F-2/PR-1**; **[`22_Business_Model`](22_Business_Model.md)** a **T-3/M-1**.

---

### Resumo executivo

Este registro converte os medos do Atlas em **riscos gerenciáveis com dono, sinais de alerta,
mitigação e contingência**, organizados por categoria e por uma **matriz probabilidade × impacto**.
A conclusão estratégica é clara: os maiores riscos **não são técnicos**, mas de **disciplina de
escopo (F-2)**, **honestidade da IA (AI-2 "causa espúria" e AI-1 alucinação)** e **valor real ao
usuário (time-to-value, vitamina-vs-analgésico, dogfooding)**. O risco de **vazamento (S-1)** é de
probabilidade baixa mas impacto **fatal**, e recebe tratamento de topo por assimetria de dano. As
mitigações se apoiam nos pilares já fixados no [`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md)
(fases, local-first, heurística-antes-de-LLM, RAG explicável) e se conectam formalmente a
[`15`](15_Privacy_Architecture.md), [`16`](16_Security.md), [`12`](12_AI_Architecture.md) e
[`24`](24_ADRs.md). Revisão mensal do Top 10 é a rotina de governança.
