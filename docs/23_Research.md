# 23 — Research (Fundamentação Científica do Atlas)

> **Fase geral:** Fundacional (atemporal) · **Leia antes:** [`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md) · [`00_Project_Vision.md`](00_Project_Vision.md)
> **Documentos relacionados:** `11_Event_Model`, `12_AI_Architecture`, `13_Knowledge_Graph`, `14_Vector_Search`, `15_Privacy_Architecture`, `25_Risks`, `29_Future_Research`
> **Status:** Vivo · **Versão:** 0.1 · **Última atualização:** 2026-07-20
> **Fase de leitura:** 🔴 Pesquisa (fundamenta decisões que entram em 🟢→🟠)

---

## 0. Propósito deste documento

Este documento responde a uma pergunta que qualquer banca de mestrado, comitê de contratação
Big Tech ou investidor técnico fará: **"Isto é ciência ou é apenas engenharia com marketing?"**

A resposta do Atlas é: o produto é **engenharia disciplinada apoiada em décadas de pesquisa
acumulada** (lifelogging, PIM, recuperação de informação, grafos, IA explicável) — e, em alguns
pontos específicos, tem **potencial de contribuição científica original** (§13). Este documento
mapeia, área por área:

1. **Conceitos-chave** — o vocabulário e as ideias centrais.
2. **O que já foi resolvido** — sobre o que não precisamos pesquisar, apenas implementar bem.
3. **Lacunas (open problems)** — o que a academia ainda não resolveu.
4. **Como o Atlas se apoia / contribui** — onde consumimos pesquisa e onde poderíamos gerar.
5. **Potencial de publicação** — o que seria genuinamente novo.
6. **Métodos de avaliação** — como validar cientificamente que um insight é útil/correto.

> ⚠️ **Nota sobre citações.** Referenciamos obras **seminais amplamente conhecidas** e **linhas
> de pesquisa** consolidadas. Onde não há certeza absoluta sobre título/autor/ano exatos, o item
> é marcado como **[leitura recomendada / área]** em vez de fabricar uma citação precisa.
> Precisão > completude. As referências completas devem ser confirmadas antes de qualquer uso
> acadêmico formal.

### 0.1. Legenda de fases (ver [`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md) §4)

| Rótulo | Significado neste doc |
|---|---|
| 🟢 MVP | O Atlas já se apoia nesta área no MVP. |
| 🔵 V1 | Pós-lançamento imediato. |
| 🟡 V2 | Com usuários reais e tração. |
| 🟠 Escala | Milhares–milhões de usuários. |
| 🔴 Pesquisa | Fronteira; potencial de contribuição/publicação. |

### 0.2. Mapa das 10 áreas

| # | Área de pesquisa | Onde entra no Atlas | Fase |
|---|---|---|---|
| 1 | Lifelogging & Memory Augmentation | O conceito-mãe: capturar e reencontrar a vida | 🟢 |
| 2 | Personal Information Management (PIM) | Reencontro, refinding, keeping | 🟢 |
| 3 | Quantified Self | Sinais de saúde/comportamento como eventos | 🟢 |
| 4 | Context-Aware / Ubiquitous Computing | Sensores, contexto, inferência ambiente | 🟢🔵 |
| 5 | Knowledge Graphs | O grafo de entidades/relações do CMHL | 🟢🟡 |
| 6 | Information Retrieval, Embeddings & RAG | Busca semântica + explicabilidade | 🟢 |
| 7 | Causal Inference | Insights honestos: correlação ≠ causa | 🔴 |
| 8 | Human-AI Interaction & XAI | Como o insight é apresentado e confiável | 🟢🟡 |
| 9 | Behavior Change | Transformar insight em ação (Fogg) | 🔵🟡 |
| 10 | Privacy-Preserving ML | Federated learning, DP, on-device | 🟡🟠🔴 |

---

## 1. Lifelogging & Memory Augmentation

### 1.1. Conceitos-chave

**Lifelogging** é a prática de capturar continuamente, e de forma abrangente, dados da própria
vida (localização, fotos, saúde, atividade, comunicação) para posterior consulta e
reflexão. **Memory augmentation** é o objetivo correlato: usar computação para estender a memória
humana — não substituí-la, mas complementá-la (recuperar o "quando/onde/com quem").

Marcos seminais e linhas de pesquisa:

| Obra / linha | Contribuição essencial |
|---|---|
| **Vannevar Bush — "As We May Think" (1945, *The Atlantic*)** | O **Memex**: dispositivo hipotético que armazena livros/registros e cria **trilhas associativas** ("associative trails") entre eles. Prevê o hipertexto e a ideia de estender a memória por associação, não por hierarquia. |
| **Douglas Engelbart — "Augmenting Human Intellect" (1962)** [leitura recomendada] | Framework de *aumento* do intelecto humano por ferramentas — base filosófica de "aumentar, não substituir". |
| **Steve Mann (wearable computing / sousveillance)** [área] | Pioneiro em captura contínua vestível; noção de registro de vida em primeira pessoa. |
| **MyLifeBits — Gordon Bell & Jim Gemmell (Microsoft Research)** | Projeto que digitalizou uma vida inteira (documentos, e-mails, fotos, chamadas). Livro de divulgação: **"Total Recall" (2009)**. Mostrou viabilidade e os problemas reais de escala/busca. |
| **Cathal Gurrin et al. — lifelogging & retrieval** [área] | Trabalhos e *benchmarks* (ex.: tarefas de *lifelog retrieval* tipo NTCIR-Lifelog / Lifelog Search Challenge) sobre **como buscar** dentro de um lifelog. |

### 1.2. O que já foi resolvido

- **Viabilidade de captura**: sabemos que é possível capturar uma vida em dados (MyLifeBits provou).
- **Armazenamento não é mais o gargalo**: custo de storage caiu ordens de magnitude.
- **Captura passiva por sensores** é madura (Health Connect, HealthKit, GPS).

### 1.3. Lacunas (open problems)

1. **O problema não é capturar, é *dar sentido*.** MyLifeBits mostrou que uma vida capturada
   sem estrutura vira um "cemitério de dados" difícil de consultar. **Reencontro e síntese**
   continuam difíceis.
2. **Da recuperação à compreensão**: lifelogging clássico foca em *retrieval* ("ache a foto do
   dia X"). O salto para **inferência cross-domain** ("por que meu humor caiu naquela semana?")
   é pouco explorado com dados reais e longitudinais.
3. **Privacidade em lifelogging total** permanece um problema aberto e sério (§10).

### 1.4. Como o Atlas se apoia / contribui

- O Atlas é, na essência, um **Memex do século XXI**: as "trilhas associativas" de Bush são o
  nosso **grafo de conhecimento** (§5) e as arestas de causa/correlação (§7).
- Onde MyLifeBits parou (armazenar tudo, buscar mal), o Atlas avança com **estrutura
  event-centric** (ver [`11_Event_Model`](11_Event_Model.md)) + **RAG explicável** (§6): não só
  guardamos, **inferimos e explicamos**.
- Diferença deliberada: **não capturamos tudo indiscriminadamente** (anti-objetivo de
  privacidade, [`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md) §6). Coletamos o que gera
  valor, com consentimento granular.

### 1.5. Potencial de publicação 🔴

- Um **relato longitudinal (n=1 → n=poucos)** de um sistema de lifelogging *estruturado e
  local-first* que gera insights cross-domain acionáveis — algo que a literatura de lifelogging
  raramente combina com **event sourcing + grafo + RAG** num produto real.

---

## 2. Personal Information Management (PIM)

### 2.1. Conceitos-chave

**PIM** estuda como as pessoas **adquirem, organizam, mantêm, recuperam e usam** informação
pessoal (arquivos, e-mails, notas, contatos). Conceitos centrais:

- **Keeping** (decidir guardar), **Finding/Refinding** (reencontrar algo já visto),
  **Organizing** (estruturar), **Maintaining** (manter útil ao longo do tempo).
- **Refinding** ≠ finding: reencontrar o que você já sabe que existe é um problema distinto de
  busca aberta.
- **Information fragmentation**: a informação pessoal se espalha por silos (apps, dispositivos,
  formatos) — exatamente a dor central do Atlas ([`00_Project_Vision`](00_Project_Vision.md) §3).

Linhas seminais:

| Linha / obra | Contribuição |
|---|---|
| **William Jones — "Keeping Found Things Found" (2007)** [leitura recomendada] | Sistematiza o campo de PIM; cunha muito do vocabulário (keeping/finding/refinding). |
| **Ofer Bergman & Ruth Beyth-Marom — "The User-Subjective Approach"** [área] | Organização deve refletir a lógica subjetiva do usuário (projeto, contexto), não taxonomias impostas. |
| **Vannevar Bush (associação > hierarquia)** | Já em 1945: a mente trabalha por associação; sistemas de arquivo hierárquicos lutam contra isso. |

### 2.2. O que já foi resolvido

- **Diagnóstico da fragmentação** está bem estabelecido: sabemos *que* o problema existe e *por
  quê* (silos, múltiplos dispositivos, formatos).
- **Busca por texto** dentro de um silo é resolvida (indexação, IR — §6).

### 2.3. Lacunas

1. **Integração cross-silo** permanece o "santo graal" não resolvido — cada tentativa esbarra
   em APIs fechadas, incentivos comerciais e privacidade.
2. **Organização automática que respeita a lógica subjetiva** do usuário ainda é frágil.
3. **Manutenção ao longo de anos** (o que fica obsoleto, o que promover) é pouco estudada.

### 2.4. Como o Atlas se apoia / contribui

- O Atlas é, em termos de PIM, uma **camada de unificação cross-silo**: o CMHL é o "lugar único"
  que o PIM sempre prometeu e nunca entregou, porque agora existem **APIs consentidas** + **IA
  barata** (ver [`00_Project_Vision`](00_Project_Vision.md) §8, "Why now").
- **Refinding** vira busca semântica + temporal sobre eventos (§6, [`14_Vector_Search`](14_Vector_Search.md)).
- **User-subjective**: a organização emerge das **entidades/relações do próprio usuário** (grafo),
  não de uma taxonomia global.

### 2.5. Potencial de publicação 🔴

- **PIM local-first com IA**: demonstração de que a combinação "consentimento granular +
  on-device + LLM como intérprete" resolve parcialmente a fragmentação sem violar privacidade —
  contraponto direto ao modelo Big Tech centralizado.

---

## 3. Quantified Self (QS)

### 3.1. Conceitos-chave

**Quantified Self** ("autoconhecimento por números") é o movimento de rastrear métricas pessoais
(sono, passos, humor, gasto, produtividade) para autoconhecimento e mudança de comportamento.

- Origem do termo atribuída a **Gary Wolf e Kevin Kelly (Wired, ~2007)**.
- Ciclo típico: **track → reflect → act** (rastrear, refletir, agir).
- Ferramentas: wearables, apps de humor, planilhas.

### 3.2. O que já foi resolvido

- **Captura de métricas** é commodity (wearables, Health Connect/HealthKit).
- **Visualização** (gráficos, dashboards) é abundante.

### 3.3. Lacunas

1. **A "vala do QS"**: a maioria dos usuários **abandona** o rastreamento porque ele exige
   esforço e **não devolve compreensão** — só gráficos. (Fenômeno bem documentado na literatura
   de HCI sobre abandono de wearables [área].)
2. **Correlação cross-métrica** raramente é oferecida; quando é, sem rigor causal (§7).
3. **De número a ação**: o elo "insight → mudança de comportamento" é fraco (ver §9).

### 3.4. Como o Atlas se apoia / contribui

- O Atlas **consome** dados de QS como **eventos** ([`11_Event_Model`](11_Event_Model.md)), mas
  se define **contra** o QS clássico: *"Não seremos um clone de quantified self com gráficos
  bonitos e sem inferência"* ([`00_Project_Vision`](00_Project_Vision.md) §6.4).
- Nossa aposta é atacar diretamente a "vala do QS": **captura passiva** (menos esforço) +
  **inferência cross-domain explicável** (mais valor) → resolve o "track sem reflect".
- ⚠️ **Risco de produto associado**: o Atlas pode ser percebido como "só mais um QS" — ver o
  risco *"vitamina, não analgésico"* em [`25_Risks`](25_Risks.md).

### 3.5. Métodos de avaliação (ver §12)

- Medir **retenção** e **North Star = insights acionados/semana** ([`00_Project_Vision`](00_Project_Vision.md) §11)
  é, na prática, medir se escapamos da vala do QS.

---

## 4. Context-Aware Computing & Ubiquitous Computing

### 4.1. Conceitos-chave

- **Ubiquitous Computing (ubicomp)** — **Mark Weiser, "The Computer for the 21st Century"
  (*Scientific American*, 1991)**: a computação desaparece no ambiente; "as tecnologias mais
  profundas são as que desaparecem". Fundamento filosófico de sensores passivos.
- **Context-Aware Computing** — sistemas que usam **contexto** (quem, onde, quando, o que se faz)
  para adaptar comportamento. **Anind Dey & Gregory Abowd** [área] deram uma definição
  operacional influente de "contexto" e criaram *toolkits* de contexto.
- **Activity recognition** — inferir atividade (andando, dormindo, dirigindo) a partir de
  sensores (acelerômetro, GPS) [área].

### 4.2. O que já foi resolvido

- **Sensoriamento** em smartphones é maduro e padronizado (Motion, Location, Health APIs).
- **Reconhecimento de atividade básico** (passos, sono, tipo de deslocamento) é oferecido pelas
  próprias plataformas.

### 4.3. Lacunas

1. **Contexto de alto nível** ("está numa reunião estressante", "está procrastinando") é difícil
   e depende de fusão multimodal.
2. **Fusão de sensores privada e on-device** com bom custo/energia ainda é desafiadora.
3. **Inferência de intenção/estado interno** (humor, foco) a partir de sinais externos é área de
   fronteira e eticamente sensível.

### 4.4. Como o Atlas se apoia / contribui

- Os **Conectores** ([`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md) §2, glossário) são,
  em essência, o *sensing layer* do ubicomp: normalizam sinais em **Eventos**.
- 🟢 MVP usa reconhecimento de atividade **já pronto** das plataformas (não reimplementamos).
- 🔵/🟡 O Atlas pode inferir **contexto de alto nível** cruzando domínios (ex.: calendário +
  localização + frequência cardíaca → "reunião provavelmente estressante").
- Alinhamento com Weiser: a captura deve **desaparecer** (passiva); o valor aparece só na
  reflexão.

### 4.5. Potencial de publicação 🔴

- **Inferência de contexto de alto nível cross-domain** a partir de sinais commodity, com
  explicabilidade e local-first — combinação pouco explorada fora de laboratórios com hardware
  dedicado.

---

## 5. Knowledge Graphs (Grafos de Conhecimento)

### 5.1. Conceitos-chave

Um **knowledge graph (KG)** representa conhecimento como **entidades (nós)** e **relações
(arestas)**, frequentemente com tipos e propriedades. Dois grandes modelos:

- **RDF / triplas (sujeito–predicado–objeto)** e a **Web Semântica** (Tim Berners-Lee et al.);
  ontologias (OWL), SPARQL.
- **Property graphs** (nós/arestas com propriedades), popularizados por bancos como Neo4j; query
  via Cypher/Gremlin.
- **Google Knowledge Graph (2012)** popularizou o termo para o grande público.
- **Knowledge Graph Embeddings** (TransE, etc.) [área] — representar entidades/relações em espaço
  vetorial para *link prediction*.

### 5.2. O que já foi resolvido

- **Modelagem** de entidades/relações é madura; há padrões (RDF, property graph).
- **Consultas multi-hop** são resolvidas por bancos de grafo dedicados (Neo4j) e, em menor escala,
  por SQL recursivo.
- **Entity resolution** (mesma pessoa em fontes diferentes) tem técnicas conhecidas [área].

### 5.3. Lacunas

1. **Construção automática de KG a partir de dados pessoais ruidosos** e multimodais é difícil
   (extração de entidades/relações confiável).
2. **KG temporal** (relações que mudam no tempo — "trabalhou em X de 2020 a 2023") é menos
   maduro que KG estático.
3. **Manutenção/decay**: como o grafo envelhece, o que promover a "fato estável" vs. "evento".

### 5.4. Como o Atlas se apoia / contribui

- O CMHL **é** um knowledge graph temporal: `entities` + `relationships`
  ([`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md) §5.3; ver [`13_Knowledge_Graph`](13_Knowledge_Graph.md)).
- **Decisão de fase (ADR-0007)**: o grafo **começa no PostgreSQL** (tabelas + CTEs recursivas /
  `ltree`), 🟢 MVP; **Neo4j só na 🟡 V2** quando as queries multi-hop em SQL "doerem". Isto é
  ciência aplicada com disciplina de custo, não modismo.
- Contribuição potencial: **KG pessoal temporal** conectado a **event sourcing** — o grafo é
  *derivado* dos eventos e, portanto, reprocessável e auditável.

### 5.5. Potencial de publicação 🔴

- **Grafo de conhecimento pessoal derivado de um log de eventos append-only** (event-sourced KG),
  com garantias de rastreabilidade evidência→insight. É um ângulo pouco explorado (a maioria dos
  KGs não é event-sourced nem local-first).

---

## 6. Information Retrieval, Embeddings & RAG

### 6.1. Conceitos-chave

- **Information Retrieval (IR)** clássico: **TF-IDF**, **BM25** (Robertson & Spärck Jones) —
  ranqueamento léxico por relevância. Resolvido e robusto.
- **Word embeddings**: **word2vec (Mikolov et al., 2013)**, **GloVe (Pennington et al., 2014)** —
  palavras como vetores; semântica por geometria ("rei − homem + mulher ≈ rainha").
- **Sentence/document embeddings**: **Sentence-BERT (Reimers & Gurevych, 2019)** [confirmar] e
  modelos de embedding modernos — frases inteiras como vetores para busca semântica.
- **Approximate Nearest Neighbor (ANN)**: **HNSW (Malkov & Yashunin)** — busca vetorial rápida em
  grafos de navegação hierárquica; base de índices vetoriais modernos (incl. pgvector).
- **Retrieval-Augmented Generation (RAG)** — **Lewis et al., 2020** ("Retrieval-Augmented
  Generation for Knowledge-Intensive NLP Tasks", NeurIPS): recuperar documentos relevantes e
  fornecê-los como contexto ao gerador (LLM), em vez de depender só de parâmetros.

### 6.2. O que já foi resolvido

- **Busca léxica e semântica** são maduras; embeddings são **commodity** (APIs baratas).
- **ANN em milhões de vetores** é resolvido (HNSW); pgvector cobre bem a faixa inicial.
- **Pipeline RAG básico** (chunk → embed → retrieve → generate) é padrão de indústria.

### 6.3. Lacunas

1. **RAG sobre dados heterogêneos e estruturados** (eventos + grafo + texto), não só documentos,
   é menos maduro — "GraphRAG" e afins são área ativa [área].
2. **Chunking e recuperação temporal** ("o que era verdade naquela época") são pouco padronizados.
3. **Avaliação de RAG** (fidelidade, ausência de alucinação) é problema aberto — ver §12 e §8.
4. **Custo/latência** em escala pessoal e local ainda exigem engenharia (cache, on-device).

### 6.4. Como o Atlas se apoia / contribui

- **RAG é o coração da explicabilidade** do Atlas ([`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md) §5.4;
  ver [`12_AI_Architecture`](12_AI_Architecture.md)): recupera **eventos/insights** relevantes do
  CMHL → contexto → o LLM **interpreta**, sem inventar (todo insight aponta evidências).
- 🟢 MVP: embeddings via API → **pgvector**; cache agressivo por **hash de conteúdo** (custo
  consciente).
- Diferencial: nosso "corpus" não é texto genérico — é o **CMHL estruturado**. Isso permite
  **RAG híbrido** (vetor + filtros temporais + travessia de grafo), reduzindo alucinação.
- Ver [`14_Vector_Search`](14_Vector_Search.md) para índice, e [`12_AI_Architecture`](12_AI_Architecture.md)
  para o pipeline de inferência (regras → estatística → ML → LLM).

### 6.5. Potencial de publicação 🔴

- **RAG sobre um grafo temporal de eventos pessoais** com garantia de rastreabilidade
  (cada token de resposta ancorado num evento com `id`), medindo **taxa de alucinação** em
  domínio pessoal. Combinação nova e avaliável.

---

## 7. Causal Inference (Correlação vs. Causa) 🔴

> Esta é a área **mais crítica para a honestidade do produto**. Um insight que confunde
> correlação com causa não é apenas errado — é **perigoso** (pode induzir decisões de saúde/vida
> equivocadas). Ver o risco de IA "correlação espúria apresentada como causa" em
> [`25_Risks`](25_Risks.md).

### 7.1. Conceitos-chave

- **Correlação ≠ causa**: dois sinais podem se mover juntos por acaso, por **confundidor** (uma
  terceira variável causa ambos) ou por **causalidade reversa**.
- **Judea Pearl** — *do-calculus*, **DAGs causais**, hierarquia de causalidade (associação →
  intervenção → contrafactual). Divulgação: **"The Book of Why" (2018)**; técnico: *Causality*.
- **Rubin Causal Model / Potential Outcomes** (Donald Rubin) [área] — efeito causal como
  diferença entre desfechos potenciais; base de inferência causal estatística.
- **Confounding, colisores, viés de seleção** — armadilhas clássicas.
- **Granger causality** [área] — para séries temporais, "X ajuda a prever Y" (não é causa forte,
  mas é um sinal temporal útil).
- **Quasi-experimentos**: *difference-in-differences*, *interrupted time series*, *n-of-1
  trials* (ensaios de um único indivíduo) — muito relevantes para dados pessoais.

### 7.2. O que já foi resolvido

- **Framework teórico** (Pearl, Rubin) é sólido e amplamente aceito.
- **Detecção de correlação** e **testes de significância** são triviais de computar.
- **n-of-1 trials** têm metodologia estabelecida na medicina [área].

### 7.3. Lacunas

1. **Inferência causal observacional confiável** (sem randomização) permanece difícil e
   dependente de suposições fortes (ex.: "não há confundidor não observado").
2. **Causalidade em dados pessoais esparsos e ruidosos**, com muitos confundidores latentes, é
   especialmente traiçoeira.
3. **Comunicar incerteza causal ao usuário leigo** sem exagerar nem paralisar é problema de HCI
   aberto (interface com §8).

### 7.4. Como o Atlas se apoia / contribui

- **Postura de honestidade (design principle)**: no 🟢 MVP e 🔵 V1, o Atlas **fala em
  correlação e padrão temporal, nunca em causa provada**. Linguagem cuidadosa: *"nas noites após
  treino tarde, você **tende a** dormir 40min a menos"* — nunca *"treinar tarde **causa** menos
  sono"*.
- **Causalidade formal é 🔴 Pesquisa** ([`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md) §5.4):
  não implementar do-calculus no MVP.
- **Caminho viável e defensável**: oferecer ao usuário **micro-experimentos (n-of-1)** —
  "que tal, por 2 semanas, treinar cedo e vermos o efeito no sono?". Isso transforma correlação
  em **evidência intervencional pessoal** de forma cientificamente legítima e engajadora
  (conecta com §9, behavior change).
- Sempre exibir **força da evidência** (tamanho de amostra, período, possíveis confundidores).

### 7.5. Potencial de publicação 🔴 (o mais forte do Atlas)

- **Framework para insights causais honestos em lifelogging**: como (a) rebaixar correlações a
  hipóteses, (b) propor n-of-1 trials automáticos, (c) comunicar incerteza. Une **causal
  inference + HCI + XAI** — lacuna real e valiosa. Ver [`29_Future_Research`](29_Future_Research.md).

### 7.6. Métodos de avaliação (ver §12)

- **Detecção de confundidores conhecidos** em datasets sintéticos (ground truth causal).
- **Taxa de "sobre-afirmação causal"**: % de insights que afirmam causa quando só há correlação
  (meta: ~0%).

---

## 8. Human-AI Interaction & Explainable AI (XAI)

### 8.1. Conceitos-chave

- **Explainable AI (XAI)** — tornar decisões de modelos compreensíveis. Métodos post-hoc
  populares: **LIME (Ribeiro et al., 2016)**, **SHAP (Lundberg & Lee, 2017)**; programa
  **DARPA XAI** [área] impulsionou o campo.
- **Human-AI Interaction** — **"Guidelines for Human-AI Interaction" (Amershi et al., CHI 2019,
  Microsoft)** [confirmar]: 18 diretrizes (ex.: deixar claro o que o sistema pode fazer, mostrar
  incerteza, permitir correção).
- **Mixed-initiative interaction** — **Eric Horvitz (1999)** [área]: humano e IA colaboram, cada
  um tomando iniciativa quando faz sentido.
- **Calibração de confiança / trust in automation** — evitar tanto *over-trust* quanto
  *under-trust*; automação deve comunicar sua confiança [área].
- **Distinção**: **interpretabilidade** (o modelo é inerentemente compreensível) vs.
  **explicabilidade** (explicação post-hoc de um modelo opaco).

### 8.2. O que já foi resolvido

- **Métodos de explicação de features** (LIME/SHAP) são maduros para modelos tabulares.
- **Boas práticas de design de IA** estão codificadas (guidelines de HAI).

### 8.3. Lacunas

1. **Explicações fiéis vs. plausíveis**: explicações que *soam* boas podem não refletir o real
   raciocínio do modelo — risco em explicações geradas por LLM.
2. **Explicabilidade de LLMs** é imatura (por que o LLM disse X?).
3. **Calibração de confiança para usuários leigos** em domínio pessoal e emocional.

### 8.4. Como o Atlas se apoia / contribui

- **Explicabilidade é princípio de arquitetura**, não feature ([`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md) §7:
  *"Explicabilidade > mágica"*). Todo **Insight** aponta para os **Eventos** que o originaram —
  isso é **interpretabilidade por construção** (a explicação é a evidência real, não uma
  racionalização post-hoc).
- O Atlas adota, de fato, o espírito das guidelines de HAI: **mostrar incerteza** (§7),
  **permitir correção** (usuário marca insight como útil/errado → North Star), **deixar claro os
  limites**.
- **Anti-alucinação**: como o LLM só **interpreta** conteúdo recuperado (RAG, §6), a explicação
  é ancorada em dados verificáveis.

### 8.5. Potencial de publicação 🔴

- **Interpretabilidade por construção via event sourcing**: um estudo de HCI sobre confiança do
  usuário quando cada insight é rastreável até eventos atômicos, vs. insights de "caixa-preta".

### 8.6. Métodos de avaliação (ver §12)

- **Taxa de rastreabilidade**: % de insights com evidência clicável (meta: 100%).
- **Estudos de confiança calibrada**: usuários confiam mais nos insights corretos e menos nos
  incertos? (survey + comportamento).

---

## 9. Behavior Change (Mudança de Comportamento)

### 9.1. Conceitos-chave

- **Fogg Behavior Model (FBM)** — **B. J. Fogg (Stanford)**: **B = MAP** — comportamento acontece
  quando **Motivação**, **Habilidade (Ability)** e **Prompt (gatilho)** convergem no mesmo
  momento. Corolário: para mudar comportamento, torne-o **mais fácil** (não só motive mais).
  Livro de divulgação: **"Tiny Habits" (2019)**.
- **Transtheoretical Model / Stages of Change** — **Prochaska & DiClemente** [área]:
  pré-contemplação → contemplação → preparação → ação → manutenção.
- **COM-B / Behaviour Change Wheel** — **Michie et al.** [área]: Capability, Opportunity,
  Motivation → Behaviour.
- **Hooked / gatilhos–ação–recompensa–investimento** — Nir Eyal [área] (usado com **ética**: o
  Atlas quer hábito *saudável*, não vício por atenção — anti-objetivo de ads).

### 9.2. O que já foi resolvido

- **Modelos teóricos** de mudança de comportamento são consolidados e aplicáveis.
- **Táticas** (gatilhos, redução de fricção, tiny habits) são validadas empiricamente.

### 9.3. Lacunas

1. **Personalização** de intervenções (que gatilho funciona para *este* usuário) é difícil.
2. **Momento ótimo de intervenção (Just-In-Time Adaptive Interventions — JITAI)** [área] é área
   ativa e não resolvida.
3. **Mudança sustentada** (evitar recaída) permanece o maior desafio.

### 9.4. Como o Atlas se apoia / contribui

- O Atlas fecha o ciclo **track → reflect → act** que o QS (§3) deixa aberto: o **Insight** é o
  *prompt* do FBM, e sugestões de **micro-experimentos/tiny habits** aumentam a *ability*.
- 🔵/🟡 Fase de entrada: mudança de comportamento **não é MVP** — o MVP prova a *compreensão*;
  a *ação assistida* vem depois. Conecta com o North Star (*insights acionados/semana*).
- **JITAI** é caminho natural para o Atlas (tem contexto + sensores + timing) — mas 🔴 pesquisa,
  com cuidado ético para não virar "app viciante".
- ⚠️ Ligação com [`25_Risks`](25_Risks.md): risco de "vitamina, não analgésico" e risco ético de
  manipulação.

### 9.5. Potencial de publicação 🔴

- **JITAI dirigido por CMHL cross-domain**: usar contexto multi-domínio para escolher o momento e
  a forma da intervenção, com avaliação de eficácia via n-of-1 (une §7 + §9).

---

## 10. Privacy-Preserving Machine Learning

### 10.1. Conceitos-chave

- **Differential Privacy (DP)** — **Cynthia Dwork et al. (2006)**: garantia matemática de que a
  presença/ausência de um indivíduo nos dados quase não altera a saída (parâmetro ε). Base
  teórica rigorosa de privacidade.
- **Federated Learning (FL)** — **McMahan et al. (2017, Google)** [confirmar]: treinar um modelo
  compartilhado **sem** centralizar dados; só gradientes/atualizações saem do dispositivo (e
  podem ser protegidos com DP + agregação segura).
- **On-device / Edge AI** — inferência local em NPUs/SLMs; nada sai do aparelho.
- **Secure aggregation, homomorphic encryption, TEEs** [área] — técnicas complementares.
- **E2EE (end-to-end encryption)** — servidor não consegue ler o conteúdo.

### 10.2. O que já foi resolvido

- **DP** tem teoria madura e implementações; usada em produção por grandes empresas [área].
- **FL** tem frameworks de referência.
- **On-device inference** de modelos pequenos é viável hoje e melhora rápido (§8 do Vision, "Why now").

### 10.3. Lacunas

1. **Trade-off privacidade × utilidade**: DP forte degrada precisão; calibrar ε é difícil.
2. **FL para n=1 (um usuário, muitos dispositivos)** é diferente do FL clássico (muitos usuários).
3. **On-device com LLMs úteis** ainda é limitado por memória/energia (melhorando).
4. **E2EE + funcionalidade de servidor** (busca, insights) são difíceis de conciliar.

### 10.4. Como o Atlas se apoia / contribui

- **Privacidade é arquitetura, não feature** ([`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md) §6;
  ADR-0010). Ordem de defesa: **local-first → minimização → criptografia → E2EE → on-device AI**.
- Fases (ver [`15_Privacy_Architecture`](15_Privacy_Architecture.md)):
  - 🟢 MVP: **local-first**, TLS, criptografia em repouso, opt-in para envio a LLM externo.
  - 🟡 V2: **E2EE** onde o servidor não lê conteúdo; **on-device AI** para dados sensíveis.
  - 🔴 Pesquisa: **DP** em agregados/telemetria; **FL** entre dispositivos do mesmo usuário.
- **Insight-chave de escopo**: como o Atlas é primariamente **n=1** (o modelo é da pessoa,
  para a pessoa), muitos problemas de PPML multi-usuário **não se aplicam** — a defesa principal é
  **manter o dado no dispositivo**, o que é mais simples e mais forte que DP/FL centralizados.
- ⚠️ Ligação com [`25_Risks`](25_Risks.md): "vazamento = morte do produto" e conformidade
  LGPD/GDPR; e com [`16_Security`](16_Security.md).

### 10.5. Potencial de publicação 🔴

- **Arquitetura de inteligência pessoal privacy-first prática**: um relato de engenharia de como
  entregar insights úteis mantendo dados on-device — com análise de onde DP/FL agregam valor real
  vs. teatro de privacidade.

---

## 11. Síntese: onde o Atlas é engenharia e onde é pesquisa

| Área | O Atlas consome (engenharia) | O Atlas pode contribuir (pesquisa 🔴) |
|---|---|---|
| Lifelogging | Captura por sensores; storage | Lifelog **estruturado** event-sourced longitudinal |
| PIM | IR, refinding | Unificação cross-silo local-first com IA |
| Quantified Self | Ingestão de métricas | Escapar da "vala do QS" via inferência |
| Context-Aware | Sensing/activity recognition prontos | Contexto de alto nível cross-domain |
| Knowledge Graphs | Modelagem, SQL recursivo, Neo4j (🟡) | **KG temporal event-sourced** |
| IR/Embeddings/RAG | pgvector, HNSW, RAG padrão | **RAG sobre grafo temporal de eventos** |
| Causal Inference | Correlação, testes | **Insights causais honestos + n-of-1** ⭐ |
| HAI / XAI | Guidelines, evidência clicável | **Interpretabilidade por construção** |
| Behavior Change | Fogg, tiny habits | **JITAI dirigido por CMHL** |
| Privacy-Preserving ML | Local-first, E2EE, on-device | **PPML prático para n=1** |

⭐ = a linha com maior potencial de publicação original e maior importância ética.

---

## 12. Métodos de avaliação científica (como validar que um insight é útil/correto)

Um produto que afirma "gerar conhecimento" precisa **provar** que o conhecimento é (a) correto,
(b) útil e (c) confiável. Esta seção é a espinha metodológica do Atlas.

### 12.1. Dimensões e métricas

| Dimensão | Pergunta | Métrica(s) | Fase |
|---|---|---|---|
| **Correção estatística** | O padrão é real ou ruído? | Significância, tamanho de efeito, IC; validação em holdout temporal | 🔵 |
| **Honestidade causal** | Afirmamos causa sem prova? | Taxa de sobre-afirmação causal (meta ~0%); confundidores detectados | 🟡🔴 |
| **Rastreabilidade** | O insight aponta evidência? | % de insights com evidência clicável (meta 100%) | 🟢 |
| **Fidelidade do RAG** | O LLM inventou algo? | Taxa de alucinação (afirmações não ancoradas em eventos) | 🟢🔵 |
| **Utilidade percebida** | O usuário achou útil? | North Star: insights acionados/semana; 👍/👎 por insight | 🟢 |
| **Utilidade real (ação)** | Mudou comportamento? | Taxa de ação; resultado de n-of-1 trials | 🟡 |
| **Calibração de confiança** | Confiança bate com acerto? | Correlação entre confiança exibida e precisão real | 🟡 |

### 12.2. Protocolos concretos

1. **Backtesting temporal**: gerar o insight com dados até o instante *t*, verificar contra dados
   *t+Δ* (o padrão se sustenta no futuro?). Evita *overfitting* a coincidências passadas.
2. **Datasets sintéticos com ground-truth causal**: gerar dados onde a causa é conhecida, medir
   se o pipeline evita afirmar causalidade espúria (§7.6).
3. **n-of-1 trials**: para hipóteses causais, propor micro-experimento ao usuário; resultado é a
   validação intervencional (§7.4).
4. **Estudos com usuários (HCI)**: surveys de confiança/utilidade + análise comportamental
   (o usuário age sobre os insights corretos?).
5. **Red-teaming de alucinação**: prompts adversariais para tentar fazer o LLM afirmar coisas sem
   evidência; medir taxa de falha.
6. **Ablação**: comparar qualidade do insight com/sem grafo, com/sem RAG, heurística vs. LLM —
   justifica cada componente por custo/benefício ([`12_AI_Architecture`](12_AI_Architecture.md)).

### 12.3. Princípio metodológico-mestre

> **Nunca apresentar como conhecimento algo que não passaria por revisão.** Se um insight não
> tem evidência rastreável, não sobrevive a backtest, ou confunde correlação com causa — ele **não
> é exibido** (ou é exibido com rótulo explícito de incerteza). Isto operacionaliza o princípio
> *"Explicabilidade > mágica"* ([`00_Project_Vision`](00_Project_Vision.md) §5).

---

## 13. Resumo de oportunidades de publicação (roadmap de pesquisa)

Ordenado por força/originalidade (detalhamento em [`29_Future_Research`](29_Future_Research.md)):

1. ⭐ **Insights causais honestos em lifelogging** (§7): correlação→hipótese→n-of-1, com
   comunicação de incerteza. Une causal inference + HCI + XAI.
2. **RAG sobre grafo temporal de eventos pessoais** (§6): rastreabilidade e taxa de alucinação
   em domínio pessoal.
3. **Interpretabilidade por construção via event sourcing** (§8): estudo de confiança do usuário.
4. **Knowledge graph pessoal temporal event-sourced** (§5).
5. **JITAI dirigido por CMHL cross-domain** (§9).
6. **PPML prático para o cenário n=1** (§10).

---

## 14. Cross-links

- Tese e fases: [`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md), [`00_Project_Vision`](00_Project_Vision.md)
- Eventos e event sourcing: [`11_Event_Model`](11_Event_Model.md)
- IA, RAG, custo: [`12_AI_Architecture`](12_AI_Architecture.md)
- Grafo de conhecimento: [`13_Knowledge_Graph`](13_Knowledge_Graph.md)
- Busca vetorial: [`14_Vector_Search`](14_Vector_Search.md)
- Privacidade / segurança: [`15_Privacy_Architecture`](15_Privacy_Architecture.md), [`16_Security`](16_Security.md)
- Riscos (incl. IA, correlação espúria): [`25_Risks`](25_Risks.md)
- Pesquisa futura: [`29_Future_Research`](29_Future_Research.md)

---

### Resumo executivo

O Atlas está **firmemente ancorado em décadas de pesquisa consolidada** — do **Memex** de
Vannevar Bush (1945) e do **MyLifeBits** (Gordon Bell) ao **ubicomp** de Weiser, aos
**knowledge graphs**, ao **RAG** (Lewis et al., 2020) e à **inferência causal** de Pearl. Em cada
uma das 10 áreas, o que **já foi resolvido** vira engenharia disciplinada por fases, e as
**lacunas** apontam onde o Atlas pode **contribuir cientificamente**. A oportunidade de pesquisa
mais forte e eticamente importante é o **insight causal honesto** (correlação → hipótese → n-of-1
trial → comunicação de incerteza), que une causal inference, HCI e XAI. A honestidade é garantida
por um **método de avaliação explícito** (backtesting temporal, rastreabilidade 100%, taxa de
alucinação, n-of-1): *nada é apresentado como conhecimento se não sobreviveria a uma revisão.*
