# 02 — Market Research (Pesquisa de Mercado)

> **Fase geral:** Fundacional (atemporal) · **Leia antes:** [`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md), [`00_Project_Vision.md`](00_Project_Vision.md), [`01_Problem_Statement.md`](01_Problem_Statement.md)
> **Documentos relacionados:** [`03_Competitive_Analysis.md`](03_Competitive_Analysis.md), [`05_User_Personas.md`](05_User_Personas.md), [`21_Roadmap.md`](21_Roadmap.md), [`22_Business_Model.md`](22_Business_Model.md), [`25_Risks.md`](25_Risks.md)
> **Status:** Vivo · **Versão:** 0.1 · **Última atualização:** 2026-07-20

---

## 0. Aviso metodológico (leia antes de qualquer número)

> **Todos os números deste documento são estimativas / ordens de grandeza, não fatos
> verificados.** Este é um documento interno de raciocínio, não um relatório de banco de
> investimento. Sempre que aparecer um valor (`~US$ X bi`), leia-o como *"nossa melhor
> estimativa de ordem de grandeza, derivada do raciocínio explícito ao lado"*, e não como um
> dado auditado. Onde possível, cruzamos **duas abordagens independentes** (top-down e
> bottom-up); quando elas divergem muito, isso é um *sinal de incerteza*, não um erro a
> esconder.

**Por que fazemos assim.** Números de mercado inventados e apresentados como fato são a forma
mais rápida de perder credibilidade numa banca de mestrado, numa entrevista Big Tech ou numa
sala de VC. A postura de honestidade intelectual do [`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md)
§0 exige o contrário: mostrar o **raciocínio**, as **premissas** e as **faixas de incerteza**.
Um raciocínio transparente e falsificável vale mais que um número preciso e infundado.

**Como validar depois.** Cada premissa marcada com 🔎 é uma hipótese a checar com fontes
primárias (relatórios de indústria, filings, dados públicos de usuários) antes de usar
externamente. Este doc é o esqueleto lógico; os números finais entram após verificação.

---

## 1. Definição do mercado (o que estamos medindo)

Antes de dimensionar, é preciso definir **qual mercado**. Isto é decisivo: a mesma empresa
pode ser "um app de US$ 100M" ou "uma plataforma de US$ 100B" dependendo do recorte. O Atlas
vive na interseção de vários mercados adjacentes.

### 1.1. Mercados adjacentes que o Atlas toca

| Mercado adjacente | O que é | Relação com o Atlas |
|---|---|---|
| **Personal AI / assistentes** | IA que age/responde em nome/sobre o usuário | Atlas é a *camada de contexto* (o modelo), não o assistente |
| **Quantified Self / wearables** | Hardware+software de dados de saúde/atividade | Atlas *ingere* esses dados; não compete no hardware |
| **PKM / "second brain"** | Gestão de conhecimento pessoal (Notion, Obsidian) | Atlas é o "PKM que pensa" e ingere automaticamente |
| **Personal finance mgmt (PFM)** | Agregadores financeiros | Finanças é *um domínio* do CMHL |
| **Privacy-tech / data ownership** | Ferramentas local-first/soberania de dados | Postura arquitetural do Atlas |
| **Journaling / mental wellness** | Diários, humor, mindfulness | Fonte de sinal subjetivo do CMHL |

**Implicação.** O Atlas **não é** nenhum desses mercados isoladamente — é uma **nova categoria**
na interseção: *Personal Intelligence Platform*. Criar categoria é oportunidade (sem concorrente
direto) e risco (mercado precisa ser educado; ver "risco de categoria" em [`25_Risks.md`]).

### 1.2. Recorte do mercado-alvo do Atlas

Para dimensionar de forma útil, definimos o alvo primário como:

> **Indivíduos que já demonstram disposição a pagar por software de autoconhecimento/dados
> pessoais (wearables, PKM pago, apps de finanças/journaling pagos) e que valorizam
> privacidade** — o beachhead das personas 🔥🔥🔥 do [`01_Problem_Statement.md`](01_Problem_Statement.md) §4.

Este recorte é deliberadamente estreito para o SOM (quem alcançamos de verdade cedo) e largo
para o TAM (todos que poderiam se beneficiar).

---

## 2. TAM / SAM / SOM — metodologia

**O que são (definições canônicas).**

- **TAM (Total Addressable Market):** receita anual total *se* 100% de todos que poderiam usar
  o produto o usassem e pagassem. É o "tamanho do oceano" — teto teórico.
- **SAM (Serviceable Addressable Market):** a fatia do TAM que o *nosso* produto, no *nosso*
  recorte (geografia, plataforma, segmento, idioma), consegue de fato servir.
- **SOM (Serviceable Obtainable Market):** a fatia do SAM que conseguimos *realisticamente
  capturar* em um horizonte dado (ex.: 3 anos), dada nossa capacidade (fundador solo,
  distribuição, concorrência).

**Por que TAM/SAM/SOM importam.** Alinham ambição (TAM justifica investir/estudar) com realismo
(SOM é a meta operacional). Um erro clássico é confundir TAM com plano: "o mercado é US$ 500B"
não paga contas; SOM sim.

**As duas metodologias (sempre cruzar as duas):**

| Abordagem | Como funciona | Força | Fraqueza |
|---|---|---|---|
| **Top-down** | Parte de um mercado grande e aplica % de fatia | Rápida, mostra ambição | Fácil de inflar; "1% de um mercado gigante" é falácia |
| **Bottom-up** | Nº de usuários × preço × frequência | Ancorada na realidade unitária | Precisa de premissas de aquisição realistas |

**Regra:** confiar mais no **bottom-up** para metas operacionais; usar o **top-down** só para
enquadrar a ambição. Quando divergem, investigar a premissa que causa a diferença.

---

## 3. TAM — dimensionamento (ordens de grandeza sinalizadas)

### 3.1. Top-down

**Raciocínio (todas as premissas são 🔎 estimativas ilustrativas):**

- 🔎 Existem na ordem de **~5 bilhões** de usuários de smartphone no mundo.
- 🔎 Uma fração pequena — digamos **ordem de centenas de milhões** — já são "consumidores de
  software de dados pessoais" (pagam por *alguma* forma: wearable com assinatura, PKM pago,
  app de finanças/journaling premium, IA pessoal paga).
- 🔎 Se o ARPU (receita média por usuário/ano) de uma assinatura de Inteligência Pessoal ficar
  na ordem de **~US$ 60–240/ano** (equivalente a ~US$ 5–20/mês, faixa comum nesses adjacentes).

**Conta ilustrativa de TAM (ordem de grandeza, NÃO fato):**

```
TAM ≈ (usuários potencialmente pagantes) × (ARPU anual)
    ≈ (~200–400 milhões)               × (~US$ 60–240)
    ≈ ordem de dezenas de bilhões de US$/ano  (faixa muito ampla → alta incerteza)
```

Ou seja: **ordem de grandeza de dezenas de bilhões de dólares/ano**, com incerteza de pelo
menos 3–5×. O ponto não é o número exato, mas: *é grande o suficiente para justificar uma
empresa de escala, e não é implausivelmente enorme a ponto de ser suspeito.*

### 3.2. Bottom-up (validação cruzada)

Somamos os mercados adjacentes onde já há **dinheiro trocando de mãos** por fatias do problema
(cada linha é 🔎 ordem de grandeza):

| Adjacente | Racional de ordem de grandeza | Contribuição ao TAM |
|---|---|---|
| Wearables + assinaturas (Oura/Whoop/etc.) | Dezenas de milhões de aparelhos + assinaturas recorrentes | Bilhões/ano |
| PKM pago (Notion, Obsidian Sync, etc.) | Dezenas de milhões de usuários, fração paga | Bilhões/ano |
| Apps de finança pessoal premium | Grande base, ARPU baixo-médio | Bilhões/ano |
| Journaling / mental wellness pago | Base grande, ARPU baixo | Sub-bilhão a bilhões/ano |
| Personal AI emergente (assinaturas de IA) | Crescimento rápido, ARPU médio-alto | Crescente, incerto |

**Convergência.** O bottom-up também aterrissa em **ordem de grandeza de bilhões a dezenas de
bilhões/ano** — consistente com o top-down. Essa convergência (mesma ordem de grandeza por dois
caminhos independentes) é o que nos dá *alguma* confiança de que o TAM é real, ainda que
impreciso.

> **Ressalva honesta:** somar adjacentes conta duas vezes usuários que pagam por vários (o
> mesmo biohacker paga Oura *e* Notion). O TAM do Atlas não é a soma dos adjacentes — é o valor
> da *interseção* (cross-domain) que hoje ninguém captura. Isso pode ser *menor* (nicho) ou
> *maior* (nova categoria) que a soma. É a principal incerteza estrutural do dimensionamento.

---

## 4. SAM — mercado servível

**Recortes que reduzem TAM → SAM (para o Atlas):**

1. **Plataforma:** mobile-first (iOS+Android via React Native/Expo — [`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md) §5.1). Exclui quem só usaria desktop/web no início.
2. **Segmento:** early adopters de dados pessoais + privacidade (beachhead §1.2), não o
   mainstream ainda.
3. **Geografia/idioma:** início realista em mercados onde o autor opera melhor — **Brasil**
   (idioma, Open Banking/PIX, contexto do fundador) + mercados globais de língua inglesa
   dispostos a produto early.
4. **Disposição tecnológica:** conforto com conectar contas / importar dados / tolerar produto
   inicial.

**Estimativa de ordem de grandeza (🔎):** o SAM é uma fração pequena do TAM — talvez **ordem de
grandeza de baixos bilhões de US$/ano** globalmente para "Inteligência Pessoal cross-domain
privada para early adopters de dados". Ainda amplo o suficiente para uma empresa relevante, e
estreito o suficiente para focar.

---

## 5. SOM — mercado obtenível (a meta operacional)

O SOM é onde o realismo de fundador solo domina. Fazemos **bottom-up puro**, ancorado em
aquisição.

**Cenário ilustrativo de 3 anos (🔎 todos os números são hipóteses de trabalho):**

| Ano | Usuários ativos (ordem) | % pagante | ARPU/ano | Receita anual (ordem) | Fase |
|---|---|---|---|---|---|
| 1 | centenas–poucos milhares | baixa (early) | ~US$ 60–120 | dezenas de milhares de US$ | 🟢 MVP |
| 2 | milhares–dezenas de milhares | crescente | ~US$ 60–120 | centenas de milhares de US$ | 🔵 V1 |
| 3 | dezenas de milhares+ | ~conversão freemium típica (poucos %) | ~US$ 60–120 | ordem de US$ 1M+/ano | 🟡 V2 |

**Leitura.** O SOM inicial é *pequeno em termos de mercado, mas materialmente relevante para um
fundador solo* — coerente com o [`00_Project_Vision.md`](00_Project_Vision.md) §10 (Ano 1 =
"prove a tese"; Ano 3 = "inteligência real"). O objetivo do Ano 1 **não é receita**, é
*validar a tese* (o autor usando diariamente + poucos usuários; ver North Star em [`00`] §11).

**Sensibilidade.** O SOM é dominado por duas alavancas: (a) **conversão freemium** e (b)
**retenção** (D30/D90). Pequenas variações nelas mudam a receita em múltiplos. Detalhamento em
[`22_Business_Model.md`].

---

## 6. Tendências de mercado (os ventos de cauda)

Analisamos cada macro-tendência com a anatomia: **o que é, por que existe, evidência,
trajetória, e o que significa para o Atlas** (favorável/ameaça).

### 6.1. Personal AI (IA pessoal / assistentes contextuais)

- **O que é.** Movimento de IA que conhece *você* especificamente (seu contexto, histórico,
  preferências) para assistir/agir — vs. IA genérica.
- **Por que existe agora.** LLMs capazes + queda de custo de inferência + corrida das Big Techs
  por "o assistente que te conhece".
- **Evidência.** Apple Intelligence, Google "Personal Context", ChatGPT Memory, MS Copilot —
  todas apostando pesado (ver [`03_Competitive_Analysis.md`](03_Competitive_Analysis.md)).
- **Trajetória (3/5/10a).** De "memória de chat" (hoje) → "contexto pessoal profundo" (3a) →
  "agentes pessoais que agem" (5–10a).
- **Para o Atlas:** **favorável em direção, ameaçador em incumbentes.** Valida a categoria; o
  Atlas se diferencia por ser a *camada de contexto neutra, cross-domain e privada* (o modelo),
  não o assistente preso a uma plataforma.

### 6.2. On-device AI (IA no dispositivo)

- **O que é.** Rodar modelos (SLMs, embeddings) localmente no smartphone/PC, sem enviar dados à
  nuvem. Habilitado por **NPUs** (Neural Processing Units) e modelos pequenos eficientes.
- **Por que existe.** Privacidade, latência, custo (sem chamada de API), offline.
- **Como funciona (breve).** Modelos quantizados (ex.: 4-bit) rodam em NPU/GPU móvel; embeddings
  e inferência leve viáveis on-device; síntese pesada ainda tende à nuvem (por ora).
- **Trajetória.** Capacidade on-device cresce rápido; em 3–5a, inferência de qualidade média
  local vira padrão.
- **Para o Atlas:** **estratégico.** É o caminho para "privacidade sem abrir mão de IA". No
  master context, on-device é 🟡/🟠 ([`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md) §5.4).
  Vento de cauda direto para o moat de privacidade.

### 6.3. Privacidade e soberania de dados

- **O que é.** Demanda crescente (regulatória e cultural) por controle sobre os próprios dados;
  movimento local-first.
- **Por que existe.** GDPR/LGPD, escândalos de dados, fadiga de vigilância.
- **Evidência.** Sucesso comercial de produtos privacy-first (Apple como marketing de
  privacidade; Obsidian local-first; DuckDuckGo; Signal).
- **Para o Atlas:** **é a tese.** Privacidade como arquitetura (não feature) é diferencial
  central ([`15_Privacy_Architecture.md`]).

### 6.4. Open Banking / dados financeiros abertos

- **O que é.** Regulação que obriga bancos a expor dados do cliente via API, com consentimento.
- **Por que existe.** Regulação pró-competição (Reino Unido/UE PSD2; **Brasil: Open Finance +
  PIX**).
- **Para o Atlas:** habilita **conectores financeiros legítimos** — um domínio-chave do CMHL.
  Especialmente forte no **Brasil** (mercado-âncora do autor), onde Open Finance/PIX são
  maduros e abrangentes.

### 6.5. Wearables e Quantified Self

- **O que é.** Proliferação de sensores vestíveis (anel, pulseira, relógio) gerando dados
  contínuos de saúde.
- **Trajetória.** Mais sensores, mais precisão, mais assinaturas. Consolidação de dados via
  Health Connect (Android) / HealthKit (iOS).
- **Para o Atlas:** **fonte de dados rica e crescente.** O Atlas ingere; não compete no
  hardware. Health Connect/HealthKit são conectores 🟢 MVP.

### 6.6. "Second brain" / PKM (Personal Knowledge Management)

- **O que é.** Movimento cultural de externalizar conhecimento/notas (Notion, Obsidian, Roam).
- **Para o Atlas:** valida apetite por "externalizar a mente"; o Atlas é o próximo degrau (PKM
  que *ingere e infere*, não só armazena).

### 6.7. Agentes de IA (agentic AI)

- **O que é.** IA que executa tarefas de múltiplos passos com autonomia (não só responde).
- **Trajetória.** Emergente; 5–10a para maturidade confiável.
- **Para o Atlas:** o CMHL é o **substrato de memória/contexto** ideal para agentes pessoais —
  a visão de longo prazo (🔴) do [`00_Project_Vision.md`](00_Project_Vision.md) §9.

### 6.8. Tabela-resumo das tendências

| Tendência | Maturidade | Direção | Impacto p/ Atlas | Fase de relevância |
|---|---|---|---|---|
| Personal AI | Crescendo rápido | ↑ | Valida categoria / ameaça incumbente | 🟢→🔴 |
| On-device AI | Emergente | ↑↑ | Habilita privacidade+IA | 🟡/🟠 |
| Privacidade/soberania | Madura e crescendo | ↑ | É a tese | 🟢→ |
| Open Banking/PIX | Madura (BR/UE) | ↑ | Conectores financeiros | 🟢/🔵 |
| Wearables/QS | Madura, crescendo | ↑ | Fonte de dados | 🟢 |
| PKM/second brain | Madura | ↔/↑ | Valida apetite | 🟢/🔵 |
| Agentes de IA | Nascente | ↑↑ | Visão de longo prazo | 🔴 |

---

## 7. Mudanças de comportamento (o lado da demanda)

**Por que analisar comportamento.** Mercado não é só tecnologia disponível; é gente disposta a
*mudar hábitos*. Tendências relevantes:

1. **Normalização de pagar por software pessoal** (assinaturas de wearable, PKM, IA) — quebra a
   barreira "software pessoal deve ser grátis".
2. **Aceitação de compartilhar dados de saúde/finanças** com apps confiáveis (mediada por
   confiança e valor percebido).
3. **Crescente alfabetização em privacidade** — usuários entendem "local-first", "seus dados",
   "sem ads" como *benefícios*, não jargão.
4. **Fadiga de apps / fragmentação** vira dor consciente → apetite por consolidação.
5. **Cultura de otimização pessoal** (produtividade, biohacking, mindfulness) — público
   predisposto ao autoconhecimento quantificado.

**Contra-tendências (honestidade):**
- **Fadiga de tracking / burnout de quantified-self:** parte do público *abandonou* medir tudo.
  → O Atlas responde reduzindo o *atrito* (ingestão automática) e focando em *ação*, não em
  gráficos.
- **Ceticismo com IA / privacy backlash:** desconfiança com "mais uma IA que quer meus dados".
  → Local-first + explicabilidade são a resposta direta.

---

## 8. Análise por região

O comportamento e a viabilidade variam por geografia. Análise 🔎 qualitativa.

### 8.1. EUA

- **Características:** maior disposição a pagar por software pessoal; early adopters de wearables
  e IA; mercado de venture maduro; HealthKit/Health Connect difundidos.
- **Regulação:** privacidade fragmentada (CCPA na Califórnia; sem federal robusto). Menos
  proteção legal, mais dependência de *confiança de marca*.
- **Para o Atlas:** grande SAM, alta concorrência de incumbentes (Apple/Google/OpenAI).
  Diferencial de privacidade ressoa com nicho, menos com mainstream.

### 8.2. Europa

- **Características:** GDPR forte; cultura pró-privacidade e pró-soberania de dados; PSD2 (Open
  Banking maduro).
- **Regulação:** **vento de cauda estrutural** — o argumento local-first/soberania é
  culturalmente e legalmente favorável.
- **Para o Atlas:** mercado ideologicamente alinhado; menor tolerância a modelos de ads →
  favorece assinatura. Fragmentação de idiomas é atrito.

### 8.3. Brasil (mercado-âncora do fundador)

- **Características:** **Open Finance + PIX maduros e abrangentes** (dados financeiros ricos e
  consentidos); alta penetração de smartphone; cultura digital forte; **LGPD** vigente.
- **Vantagens para o autor:** idioma nativo, contexto cultural, custo de operação, conectores
  financeiros viáveis desde cedo.
- **Desafios:** menor ARPU médio que EUA/UE; sensibilidade a preço → planos regionais; menor
  base de "pagantes por software pessoal" (mas crescendo).
- **Para o Atlas:** **beachhead pragmático** — construir e validar a tese em casa, com
  vantagem de conectores financeiros (Open Finance), depois expandir para mercados de ARPU mais
  alto. Ver estratégia de preço regional em [`22_Business_Model.md`].

### 8.4. Tabela comparativa regional

| Dimensão | EUA | Europa | Brasil |
|---|---|---|---|
| Disposição a pagar (ARPU) | Alta | Média-alta | Média-baixa |
| Cultura de privacidade | Nicho | Forte (GDPR) | Crescente (LGPD) |
| Open Banking maduro | Parcial | Sim (PSD2) | **Sim (forte)** |
| Concorrência incumbente | Muito alta | Alta | Média |
| Vantagem do fundador | Baixa | Baixa | **Alta** |
| Papel estratégico | Expansão de ARPU | Alinhamento ideológico | **Beachhead** |

---

## 9. Análise de players (visão de mercado; detalhe em `03`)

> A dissecação produto-a-produto (o que é, onde vence/perde, privacidade, moat) está em
> [`03_Competitive_Analysis.md`](03_Competitive_Analysis.md). Aqui, a **leitura de mercado**:
> quem são as *forças*, não os *produtos*.

### 9.1. Big Techs

- **Apple, Google, Microsoft, OpenAI** entrando em "contexto pessoal / memória". Vantagens
  esmagadoras: distribuição, dados, capital, integração de SO.
- **Fraqueza estrutural:** conflito de interesse (ads para Google; lock-in de ecossistema para
  Apple/MS), falta de neutralidade cross-plataforma, e privacidade como marketing vs.
  arquitetura. **Nenhuma é neutra** entre ecossistemas — um usuário Apple+Windows+Android é
  mal servido por qualquer uma.
- **Leitura:** validam a categoria e são a **maior ameaça** (commoditização). A resposta do
  Atlas é o que elas *estruturalmente não podem* fazer bem: cross-domain **neutro** entre
  plataformas + privacidade **arquitetural** + explicabilidade. Ver [`25_Risks.md`].

### 9.2. Startups de Personal AI / memória

- **Rewind AI, Limitless (Pendant), Mem, Reflect, Saga** — apostam em memória/PKM com IA.
- **Leitura:** provam demanda e captam capital, mas a maioria é *cloud-centric* e/ou *captura
  ampla* (áudio/tela), com postura de privacidade que o Atlas considera insuficiente, e sem o
  **modelo estruturado cross-domain** (a maioria é memória semântica "flat", não CMHL).

### 9.3. Verticais (wearables/QS/finanças/journaling)

- **Oura, Whoop, Notion, Obsidian, Exist.io, Gyroscope, Bearable, etc.** — fortes na vertical.
- **Leitura:** são **fontes de dados e parceiros potenciais**, não concorrentes diretos do
  cross-domain. O Atlas *senta em cima* deles.

---

## 10. Previsões futuras (3 / 5 / 10 anos)

> Previsões são apostas, não fatos. Registramos as premissas para revisar depois.

| Horizonte | Previsão de mercado (🔎) | Implicação para o Atlas |
|---|---|---|
| **3 anos** | "Contexto pessoal" vira feature esperada em todo SO/assistente; usuários começam a perceber a *fragmentação* como problema nomeável | Janela para educar mercado e fincar categoria; foco em cross-domain que incumbentes não fazem |
| **5 anos** | On-device AI de qualidade média vira padrão; privacidade local-first vira mainstream (não só nicho); agentes pessoais começam a agir | Moat de privacidade se fortalece; CMHL vira substrato de agentes; plataforma/SDK (🟠) |
| **10 anos** | Possível emergência de um "padrão de modelo de vida portável"; agentes pessoais ubíquos; disputa pela *propriedade* do modelo pessoal | Oportunidade de o Atlas *definir* o padrão aberto (🔴); ou risco de um incumbente fechá-lo antes |

**Cenários (para não ancorar num único futuro):**
- **Otimista:** privacidade + neutralidade vencem; Atlas vira infraestrutura padrão. 
- **Base:** Atlas ocupa nicho lucrativo de early adopters exigentes; coexiste com incumbentes.
- **Pessimista:** Big Tech comoditiza "bom o suficiente" de graça; Atlas fica em nicho pequeno.
  *Mitigações* em [`25_Risks.md`].

---

## 11. Timing — "Why now" (reforço do `00`)

O [`00_Project_Vision.md`](00_Project_Vision.md) §8 fixa a tese temporal. Reforçamos com a
lente de mercado:

> **A interseção {APIs de dados pessoais maduras} ∩ {IA/embeddings commodity barata} ∩ {demanda
> por privacidade regulada e cultural} ∩ {on-device AI emergente} abriu uma janela de ~5 anos
> em que um fundador solo consegue construir o que exigiria um time e uma década atrás.**

**Por que não antes:** custo de "cola semântica" proibitivo; APIs de dados imaturas; privacidade
não era demanda de massa; on-device inviável.

**Por que não muito depois:** as Big Techs estão entrando *agora*. Esperar demais é ceder a
categoria. O timing é uma **janela**, não uma porta aberta permanentemente — daí a disciplina
de fases para provar a tese rápido ([`21_Roadmap.md`]).

**Tabela do "why now":**

| Habilitador | Antes | Agora | Efeito |
|---|---|---|---|
| APIs de dados | Fechadas/imaturas | Health Connect, HealthKit, Open Finance/PIX | Ingestão legítima possível |
| Custo de IA | Proibitivo | Commodity (tokens/embeddings baratos) | Viável p/ solo |
| Privacidade | Não era demanda | GDPR/LGPD + cultura | Diferencial vendável |
| On-device AI | Inviável | NPUs + SLMs emergentes | Privacidade+IA no futuro próximo |
| Concorrência | Ausente | Big Techs entrando | Categoria validada, urgência de timing |

---

## 12. Riscos de mercado (resumo — ver `25`)

| Risco de mercado | Descrição | Mitigação |
|---|---|---|
| **Commoditização por Big Tech** | Apple/Google embutem "bom o suficiente" de graça | Cross-domain neutro + privacidade arquitetural + explicabilidade |
| **Risco de categoria** | Mercado não entende "Personal Intelligence Platform" | Entregar momento-analgésico claro; educar via casos |
| **APIs fechando** | Plataformas restringem exportação | Local-first + manual + import como cidadãos de 1ª classe |
| **Vitamina fraca** | Baixa retenção pós-novidade | North Star = insights acionados; foco em ação |
| **Confiança/vazamento** | Um vazamento destrói a marca de privacidade | Minimização + local-first + E2EE (🟡) |
| **ARPU regional baixo** | Beachhead BR tem menor disposição a pagar | Preço regional; expandir p/ EUA/UE |

---

### Resumo executivo

O Atlas vive na **interseção de vários mercados adjacentes** (Personal AI, quantified self,
PKM, PFM, privacy-tech, journaling) e propõe uma **nova categoria** — *Personal Intelligence
Platform*. Dimensionamos o mercado com **dupla metodologia sinalizada como estimativa**:
top-down (usuários pagantes potenciais × ARPU) e bottom-up (soma de adjacentes onde já há
dinheiro), que **convergem na mesma ordem de grandeza** (TAM na casa de dezenas de bilhões de
US$/ano, com incerteza de 3–5×; SAM em baixos bilhões; SOM inicial pequeno em mercado mas
relevante para um fundador solo). A principal incerteza é se o valor da *interseção*
cross-domain é maior ou menor que a soma das partes — a aposta do Atlas é que é maior. As
**tendências** (Personal AI, on-device AI, privacidade/soberania, Open Banking/PIX, wearables,
PKM, agentes) são majoritariamente ventos de cauda, com contra-tendências honestas (fadiga de
tracking, backlash de IA) já endereçadas por ingestão de baixo atrito + foco em ação +
local-first. Por **região**, o **Brasil é o beachhead pragmático** (idioma, Open Finance/PIX,
vantagem do fundador), com expansão para EUA (ARPU alto) e Europa (alinhamento de privacidade).
O **timing ("why now")** é uma janela de ~5 anos aberta pela convergência de APIs de dados + IA
barata + demanda por privacidade + on-device emergente — e as Big Techs entrando *agora* tornam
a categoria validada, porém urgente. O maior risco de mercado é a **commoditização por Big
Tech**, respondida pelo que elas estruturalmente não fazem: cross-domain **neutro entre
plataformas**, privacidade **arquitetural** e **explicabilidade** — o território do CMHL.
