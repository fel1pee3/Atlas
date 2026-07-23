# 01 — Problem Statement (Declaração do Problema)

> **Fase geral:** Fundacional (atemporal) · **Leia antes:** [`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md), [`00_Project_Vision.md`](00_Project_Vision.md)
> **Documentos relacionados:** [`02_Market_Research.md`](02_Market_Research.md), [`03_Competitive_Analysis.md`](03_Competitive_Analysis.md), [`05_User_Personas.md`](05_User_Personas.md), [`06_User_Journey.md`](06_User_Journey.md), [`12_AI_Architecture.md`](12_AI_Architecture.md), [`22_Business_Model.md`](22_Business_Model.md), [`25_Risks.md`](25_Risks.md)
> **Status:** Vivo · **Versão:** 0.1 · **Última atualização:** 2026-07-20

---

## 0. Como ler este documento

Este é o documento que responde à pergunta mais perigosa que se pode fazer a uma startup:
**"Que problema real, doloroso e valioso vocês resolvem — e como sabem que ele existe?"**

A maioria dos produtos morre não por má execução, mas por resolver um problema que ninguém
tinha (ou que ninguém pagaria para resolver). Este documento existe para nos proteger disso.
Ele é intencionalmente cético consigo mesmo: em cada seção, tentamos **matar a tese** antes
que o mercado o faça.

Seguimos a anatomia canônica do [`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md) §0: para
cada conceito não-óbvio (JTBD, "vitamina vs. analgésico", paradoxo da abundância de dados,
custo de fragmentação), explicamos **o que é, por que existe, como funciona, alternativas,
trade-offs e como se aplica ao Atlas**. Números de mercado aparecem só como **ordens de
grandeza sinalizadas** — a quantificação formal (TAM/SAM/SOM) vive em
[`02_Market_Research.md`](02_Market_Research.md).

---

## 1. O problema, em uma frase

> **Uma pessoa comum gera, todos os dias, uma quantidade sem precedentes de dados sobre a
> própria vida — e não consegue transformar quase nada disso em autoconhecimento, porque esses
> dados vivem fragmentados em dezenas de silos que não conversam entre si e que não pertencem,
> de fato, a ela.**

Chamamos isso de **Paradoxo da Abundância de Dados Pessoais**:

> `dados sobre mim ↑↑↑`  enquanto  `compreensão de mim mesmo ↔ ou ↓`

Nunca houve tanto sensor, tanto log, tanto histórico. E, no entanto, perguntas simples e
profundamente humanas continuam **computacionalmente sem resposta** para o indivíduo:

- *O que realmente melhora ou piora meu sono?*
- *O que costuma acontecer nos dias/nas horas antes de eu procrastinar ou surtar de ansiedade?*
- *Quais pessoas e lugares elevam meu humor — e quais o derrubam?*
- *Para onde meu dinheiro e meu tempo realmente vão, e isso reflete o que digo valorizar?*
- *Quais pequenas mudanças que fiz no último ano tiveram o maior impacto real?*

Nenhum produto atual responde a isso de forma **cross-domain, explicável e privada**. É esse
vácuo — e não "mais um app de hábitos" — que o Atlas ataca.

---

## 2. Anatomia do problema

Vamos decompor o problema em suas partes constituintes. Um problema mal decomposto leva a uma
solução mal escopada.

### 2.1. Camada 1 — Fragmentação (o sintoma visível)

**O que é.** Os dados de uma vida estão espalhados por silos independentes que não compartilham
esquema, identidade nem tempo comum:

| Domínio | Onde o dado vive hoje | Formato | Exportável? |
|---|---|---|---|
| Saúde/sono/atividade | Apple Health, Google Health Connect, Oura, Whoop, Garmin | Proprietário, parcial | Parcial |
| Localização | Google Timeline/Maps, iOS Significant Locations | Proprietário | Parcial/limitado |
| Finanças | Bancos, cartões, corretoras, apps de gasto | CSV/OFX/API fechada | Fragmentado |
| Calendário/tempo | Google/Microsoft/Apple Calendar | ICS/API | Sim |
| Comunicação | E-mail, WhatsApp, Slack, Telegram | Silos fechados | Difícil |
| Notas/conhecimento | Notion, Obsidian, Apple Notes, Google Keep | Semiestruturado | Parcial |
| Mídia/consumo | Spotify, YouTube, Kindle, streaming | API/ToS restritivo | Parcial |
| Trabalho/código | GitHub, Jira, Google Docs | API | Sim |

**Por que isso é um problema, e não só uma inconveniência.** A fragmentação não é apenas
"chato de juntar". Ela **destrói a informação mais valiosa**, que é *relacional e temporal*: o
valor não está no dado de um domínio, mas na **correlação entre domínios ao longo do tempo**
(a Tese de Dados do [`00_Project_Vision.md`](00_Project_Vision.md) §4). Sono isolado é um
gráfico. Sono × treino × cafeína × horário de tela × humor do dia seguinte é *conhecimento*.
Silos tornam essa junção impossível para o indivíduo.

**Como funciona a "perda de informação".** Formalize assim: se cada silo `S_i` guarda uma
projeção `π_i(vida)` dos seus eventos, a informação cross-domain é aproximadamente a
**informação mútua** entre domínios, `I(S_i; S_j)`. Silos entregam `S_i` e `S_j`
separadamente, mas nunca `I(S_i; S_j)` — e é exatamente aí que mora o insight ("dormi mal →
gastei mais no dia seguinte"). Fragmentar os dados equivale a apagar sistematicamente os
termos cruzados. **O Atlas existe para reconstruir esses termos cruzados** — é a função do
CMHL (ver [`11_Event_Model.md`], [`13_Knowledge_Graph.md`]).

### 2.2. Camada 2 — Falta de uma camada cross-domain (a causa técnica)

Mesmo quem exporta tudo esbarra em três incompatibilidades:

1. **Identidade** — "João Silva" no e-mail, "J. Silva" no calendário e um número no WhatsApp
   são a *mesma pessoa*? (Problema de **entity resolution**.)
2. **Tempo** — cada fonte tem seu próprio relógio, fuso, granularidade e semântica de
   timestamp (início? fim? registro?). Alinhar exige uma **timeline canônica** de eventos.
3. **Semântica** — "corrida" no app de fitness e "treino" na nota manual são o mesmo conceito?
   (Problema de **normalização/ontologia**.)

O Atlas resolve isso com a arquitetura **event-centric** (o Evento como unidade atômica) +
**grafo de entidades** + **memória semântica** (embeddings) descrita no
[`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md) §2 e detalhada em
[`07_System_Architecture.md`], [`11_Event_Model.md`] e [`12_AI_Architecture.md`].

### 2.3. Camada 3 — Ausência de compreensão (o problema real)

Ainda que os dados fossem unificados, faltaria o mais difícil: **transformar dado em
conhecimento acionável e explicável**. A cadeia DIKW (*Data → Information → Knowledge →
Wisdom*) quase nunca passa do primeiro degrau nos produtos atuais:

| Degrau DIKW | Exemplo pessoal | Quem entrega hoje |
|---|---|---|
| **Dado** | "23h47, 68 bpm, GPS (-23.5, -46.6)" | Todos os apps de tracking |
| **Informação** | "Dormi 6h12 ontem" | Apps de sono/quantified self |
| **Conhecimento** | "Durmo 40 min a menos nas noites após treino depois das 21h" | **~ninguém (cross-domain)** |
| **Sabedoria** | "Então movo o treino para antes das 19h nas terças" | **~ninguém** |

O Atlas mira os degraus 3 e 4 — **com explicabilidade** (cada Insight aponta suas evidências,
ver definição de *Insight* no glossário do master context). Isso é o oposto de um dashboard
bonito que para no degrau 2.

### 2.4. Camada 4 — Propriedade e confiança (a causa estrutural)

Mesmo que existisse um produto cross-domain que compreendesse, restaria a pergunta: **de quem é
esse modelo?** Nos incumbentes, o modelo mais rico da sua vida pertence a *terceiros*,
otimizado para os interesses *deles* (atenção, ads, retenção). Isso cria um teto estrutural de
confiança: você não entrega sua vida inteira a quem lucra com sua atenção. A postura
**local-first** do Atlas ([`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md) §6) é a resposta
— e é *pré-condição*, não feature (ver [`15_Privacy_Architecture.md`]).

---

## 3. Por que o problema existe (as causas-raiz)

Um problema tão universal persistir por tanto tempo exige explicação. Não é acaso nem
incompetência coletiva — é **incentivo**. Analisamos as forças que o mantêm vivo.

### 3.1. Incentivo de silo (o data lock-in como estratégia)

**O que é.** Empresas de plataforma têm incentivo econômico direto para **reter** dados e
dificultar a portabilidade. Interoperabilidade reduz custo de troca (*switching cost*), e
custo de troca é o que sustenta margens.

**Como funciona.** O *lock-in* de dados aumenta o *Customer Lifetime Value* e ergue barreiras
de entrada. Uma API de exportação completa e em tempo real é, para o incumbente, uma **arma
apontada para o próprio fosso**. Logo, APIs existem, mas costumam ser: incompletas (só um
subconjunto dos dados), *rate-limited*, sujeitas a ToS restritivos, ou sob risco de serem
fechadas (ver histórico de fechamento de APIs em [`25_Risks.md`]).

**Trade-off / consequência para o Atlas.** É por isso que o Atlas **nunca pode depender apenas
de APIs de terceiros**. A entrada manual de eventos e o import de arquivos (CSV/JSON/backups)
são cidadãos de primeira classe desde o 🟢 MVP — não um plano B. O valor precisa existir mesmo
com poucas fontes (ver mitigação de risco em [`00_Project_Vision.md`](00_Project_Vision.md)
§12 e [`04_Product_Requirements.md`]).

### 3.2. Modelo de negócio da atenção / ads (o conflito de interesse estrutural)

**O que é.** O modelo de negócio dominante da internet de consumo é **publicidade dirigida por
atenção**. O produto grátis é o usuário; a mercadoria é sua atenção e seus dados de perfil.

**Por que isso impede a solução.** Um produto financiado por ads é otimizado para *maximizar
engajamento*, não *autoconhecimento*. Autoconhecimento frequentemente reduz consumo ("percebi
que rolar o feed às 23h me faz dormir mal → paro de rolar"). Há, portanto, um **conflito de
interesse estrutural**: o incumbente não pode construir a ferramenta que reduz o comportamento
que o financia. Este é o argumento de "vácuo por incentivo" do
[`00_Project_Vision.md`](00_Project_Vision.md) §7.3.

**Aplicação ao Atlas.** O modelo de negócio do Atlas é **assinatura/produto pago**, alinhado ao
florescimento do usuário — nunca ads nem venda de dados (anti-objetivo do master context §—;
detalhado em [`22_Business_Model.md`]). Isso não é postura moral apenas: é a única estrutura de
incentivo *compatível* com resolver o problema.

### 3.3. Custo histórico de unificar (a barreira que caiu agora)

**O que era.** Construir uma camada cross-domain privada exigia, até pouco tempo: integrações
caras, um time grande, e — para "entender" texto/semântica — modelos proprietários caríssimos.
O "custo de cola semântica" (ligar "corrida" a "treino", resumir uma nota, achar o evento
relevante) era proibitivo para qualquer um que não fosse uma Big Tech.

**O que mudou (why now).** Três quedas de custo simultâneas (detalhadas em
[`00_Project_Vision.md`](00_Project_Vision.md) §8 e [`02_Market_Research.md`](02_Market_Research.md)):

1. **APIs de dados pessoais maduras** (Health Connect 2023+, HealthKit, Open Banking/PIX).
2. **LLMs e embeddings viraram commodity barata** — a "cola semântica" ficou acessível a um dev
   solo (ver custo por token em [`12_AI_Architecture.md`]).
3. **On-device AI viável** (NPUs, SLMs) — inferência privada local deixou de ser ficção
   (🟡/🟠).

**Trade-off.** Barreira de entrada caiu *para todos*, inclusive concorrentes. Por isso o fosso
do Atlas **não** é a IA (commodity), e sim o **CMHL acumulado** ao longo dos anos
([`00_Project_Vision.md`](00_Project_Vision.md) §4, tese de IA; ver moat em
[`03_Competitive_Analysis.md`](03_Competitive_Analysis.md)).

### 3.4. Ausência de um padrão de "modelo de vida" portável

Não existe um formato aberto e neutro para "a vida de uma pessoa" como existe HTML para
documentos ou SMTP para e-mail. Sem padrão, cada app reinventa seu silo. O Atlas aposta que,
no longo prazo (🔴), pode *definir* esse padrão aberto de portabilidade (ver
[`28_Open_Source_Strategy.md`], [`29_Future_Research.md`]).

### 3.5. Resumo das causas-raiz

| Causa-raiz | Natureza | Por que persiste | Resposta do Atlas |
|---|---|---|---|
| Incentivo de silo | Econômica | Lock-in sustenta margem | Manual + import + local-first |
| Modelo de ads | Econômica | Conflito de interesse estrutural | Assinatura; sem ads/venda de dados |
| Custo de unificar | Tecnológica | Era caro (caiu agora) | Aproveitar janela; boring tech |
| Falta de padrão | Coordenação | Ninguém tem incentivo de abrir | Padrão aberto no longo prazo (🔴) |
| Falta de confiança | Psicológica | Ninguém entrega a vida a quem lucra com atenção | Local-first + E2EE (🟡) |

---

## 4. Quem sofre (mapeamento por persona)

> Personas detalhadas em [`05_User_Personas.md`]; jornada em [`06_User_Journey.md`]. Aqui
> mapeamos **a dor**, não o perfil demográfico.

O problema é universal, mas a *intensidade* e a *disposição a agir* variam. Distinguimos quem
apenas tem o problema de quem **sente a dor a ponto de pagar** (crucial para
[`22_Business_Model.md`]).

| Persona (resumo) | Dor central | Como tenta resolver hoje | Por que falha | Intensidade |
|---|---|---|---|---|
| **O Otimizador Quantificado** (quantified-self, biohacker) | Tem 5+ apps/wearables e nenhuma visão unificada | Oura + Whoop + planilhas + Notion | Nada correlaciona domínios; exporta e cola à mão | 🔥🔥🔥 (analgésico) |
| **O Autoconsciente / journaling** | Quer entender padrões emocionais e de comportamento | Diário, apps de humor, terapia | Registro sem inferência; nenhuma ligação com dados objetivos | 🔥🔥 |
| **O Sobrecarregado de Ferramentas** | Fragmentação e fadiga de apps | Notion como "segundo cérebro" | Notion é banco de páginas, não infere nada sozinho | 🔥🔥 |
| **O Orientado a Dados** (eng/PM/cientista) | Quer os *próprios* dados como pratica no trabalho | SQL caseiro, scripts, exports | Custo de manutenção altíssimo; não escala pessoalmente | 🔥🔥🔥 (analgésico) |
| **O Preocupado com Privacidade** | Quer insights sem entregar a vida a Big Tech | Evita apps; usa local/offline manualmente | Perde o valor cross-domain para manter privacidade | 🔥🔥🔥 (analgésico) |
| **O Fundador (autor)** | Todos os acima + quer aprender/defender o projeto | Está construindo o Atlas | — | 🔥🔥🔥 |
| **Usuário mainstream** | Dor latente, não articulada | Não tenta; aceita a fragmentação | Não percebe o problema como problema | 🔥 (vitamina hoje) |

**Leitura estratégica.** O beachhead (mercado-cabeça-de-ponte) do Atlas são as personas
**analgésico** (🔥🔥🔥): Otimizador Quantificado, Orientado a Dados e Preocupado com
Privacidade. São early adopters que já *sentem* a dor, já *pagam* por ferramentas parciais e
têm alta tolerância a produto inicial. O usuário mainstream é 🔵/🟡 — só depois de o produto
tornar o problema *óbvio* (ver [`06_User_Journey.md`] e [`21_Roadmap.md`]).

---

## 5. Como as pessoas resolvem hoje (soluções atuais e por que falham)

Toda dor real já tem soluções paliativas. Entendê-las é entender contra o que competimos de
verdade (o "não-consumo" e os workarounds), não só contra produtos. Análise competitiva
formal em [`03_Competitive_Analysis.md`](03_Competitive_Analysis.md).

### 5.1. Planilhas (Excel / Google Sheets)

- **O que é.** Registro manual em grade; a ferramenta de "dados pessoais" mais usada do mundo.
- **Onde vence.** Flexível, gratuita, propriedade total do dado, familiar.
- **Por que falha.** Atrito de entrada altíssimo → abandono; zero automação de ingestão; zero
  inferência; não escala para anos de dados; correlação cross-domain é trabalho manual.
- **Lição para o Atlas.** A planilha prova que existe **demanda por propriedade e controle**. O
  Atlas precisa entregar isso *sem* o atrito de digitação manual (conectores + import).

### 5.2. Journaling e apps de diário/humor (Day One, Daylio, etc.)

- **O que é.** Registro estruturado ou livre de eventos/emoções ao longo do tempo.
- **Onde vence.** Ótimos para reflexão qualitativa e captura emocional; hábito poderoso.
- **Por que falha.** Ficam no degrau "informação": registram, não *inferem*; não ligam o
  subjetivo ("ansioso hoje") ao objetivo (sono, localização, gasto, agenda).
- **Lição.** O Atlas deve **casar sinal subjetivo com objetivo** — é justamente o cross-domain
  que nenhum diário faz.

### 5.3. Apps isolados de domínio único (Oura, Whoop, apps de finança)

- **O que é.** Excelência vertical em um domínio (sono, recuperação, gastos).
- **Onde vence.** Profundidade, precisão de sensor, UX polida no seu nicho.
- **Por que falha.** São **silos por design**; o insight "seu gasto sobe quando seu sono cai"
  é estruturalmente impossível dentro de um app de domínio único.
- **Lição.** O Atlas **não compete na vertical** (não vai medir sono melhor que a Oura); compete
  na **horizontal** (ingerir o dado da Oura + de todos os outros e correlacionar). Ver moat em
  [`03_Competitive_Analysis.md`](03_Competitive_Analysis.md).

### 5.4. Notion / Obsidian ("second brain" / PKM)

- **O que é.** Sistemas de conhecimento pessoal (Personal Knowledge Management) baseados em
  páginas/notas e links.
- **Onde vence.** Flexibilidade extrema, propriedade (Obsidian é local-first!), comunidade.
- **Por que falha.** São **contêineres passivos**: guardam o que *você* escreve, não ingerem
  automaticamente sua vida nem inferem nada sozinhos. "Segundo cérebro" que não pensa.
- **Lição.** Obsidian valida **local-first + propriedade** como valor comercial. O Atlas é o
  "segundo cérebro que *pensa*": ingestão automática + inferência + explicabilidade.

### 5.5. Movimento Quantified Self (dashboards, Exist.io, Gyroscope)

- **O que é.** Agregadores que puxam vários apps e mostram gráficos/correlações simples.
- **Onde vence.** São os mais próximos do Atlas em ambição; provam apetite por cross-domain.
- **Por que falha.** Param na **correlação estatística superficial** e em dashboards; pouca
  explicabilidade profunda, pouca ação, modelagem rasa (sem grafo/memória semântica), e
  postura de privacidade fraca (cloud-first). Nichados, baixa retenção mainstream.
- **Lição.** Eles são a **prova de conceito de mercado** do cross-domain — e a prova de que
  parar na correlação/dashboard não basta. O Atlas precisa ir a **conhecimento explicável +
  ação + privacidade + modelo estruturado durável**.

### 5.6. "Jogar tudo num LLM com memória" (ChatGPT Memory e afins)

- **O que é.** Despejar contexto de vida no chat e confiar na memória do modelo.
- **Onde vence.** Zero setup, linguagem natural, disponível já.
- **Por que falha.** Caixa-preta (sem explicabilidade rastreável), custo cresce com os dados
  (tokens ∝ dados), frágil (memória muda com o modelo), context window limita anos de dados, e
  privacidade dependente do provedor. É exatamente o *anti-padrão* que o
  [`00_Project_Vision.md`](00_Project_Vision.md) §4.1 rejeita.
- **Lição.** Confirma nossa **Tese de Modelo**: estrutura (CMHL + RAG) > "tudo no contexto".

### 5.7. Tabela-resumo: por que tudo falha

| Solução atual | Ingestão automática | Cross-domain | Inferência/insight | Explicabilidade | Privacidade/propriedade | Ação |
|---|---|---|---|---|---|---|
| Planilhas | ❌ | Manual | ❌ | n/a | ✅ | ❌ |
| Journaling | ❌ | ❌ | ❌ | n/a | Parcial | ❌ |
| Apps de domínio único | ✅ (1 domínio) | ❌ | ✅ (vertical) | Parcial | Varia | Parcial |
| Notion/Obsidian | ❌ | Manual | ❌ | n/a | ✅ (Obsidian) | ❌ |
| Quantified-self (Exist/Gyroscope) | ✅ | ✅ (raso) | Correlação rasa | Baixa | ❌ (cloud) | Fraca |
| LLM com memória | Parcial | Parcial | Caixa-preta | ❌ | Depende | Parcial |
| **Atlas (alvo)** | ✅ | ✅ (profundo) | ✅ (regras→ML→LLM) | ✅ (evidências) | ✅ (local-first) | ✅ |

**Conclusão desta seção:** cada solução acerta *uma* dimensão e falha nas outras. O espaço
vazio na última linha é a tese de produto do Atlas. Nenhum concorrente ocupa a **interseção**
{cross-domain profundo} ∩ {explicável} ∩ {local-first/privado} ∩ {modelo estruturado durável}.

---

## 6. Jobs-to-be-Done (JTBD)

**O que é o framework JTBD.** *Jobs-to-be-Done* (Christensen) diz que pessoas não "compram
produtos"; elas **"contratam" um produto para realizar um progresso** (um *job*) em uma
circunstância. A pergunta certa não é "que features o usuário quer?", mas "**que progresso ele
está tentando fazer, e o que ele demite quando nos contrata?**". Isso força foco no resultado,
não na tecnologia.

**Por que usamos.** Evita a armadilha de listar features. Ancoram [`04_Product_Requirements.md`]
e [`06_User_Journey.md`].

### 6.1. Jobs funcionais (o progresso prático)

| # | Quando... | eu quero... | para que... | Fase-alvo |
|---|---|---|---|---|
| JF1 | percebo um padrão ruim (dormi mal a semana toda) | entender **o que causou** isso, com evidência | eu possa mudar a causa, não o sintoma | 🟢 |
| JF2 | tenho dados em 5 apps diferentes | ver tudo numa **timeline única** da minha vida | eu pare de reconciliar silos manualmente | 🟢 |
| JF3 | tomo uma decisão (mudar rotina, gasto, hábito) | saber **o que costuma acontecer antes/depois** disso | eu decida com base em mim, não em achismo | 🔵 |
| JF4 | quero mudar de app/plataforma | **exportar e possuir** todo o meu modelo de vida | eu nunca fique refém de um silo | 🟢 |
| JF5 | uso IA para me entender | que ela **mostre as evidências** de cada conclusão | eu confie e possa auditar | 🟢 |

### 6.2. Jobs emocionais e sociais (o progresso profundo)

- **JE1 — Sentir-se no controle** da própria vida digital (antídoto à ansiedade de
  fragmentação e ao "sou vigiado").
- **JE2 — Autoconhecimento sem julgamento**: um espelho privado que compreende sem expor.
- **JS1 — Ser o tipo de pessoa** intencional/orientada a dados sobre a própria vida (identidade
  do early adopter).

**Insight de JTBD:** o Atlas é "contratado" para o job de **compreender-se e agir**, demitindo
a colcha de retalhos de planilha + apps + memória mental. O concorrente real muitas vezes é o
**não-consumo** (a pessoa desiste de se entender) — não outro app.

---

## 7. Vitamina vs. Analgésico (a pergunta que separa produtos que morrem dos que vivem)

**O que é a distinção.** No jargão de produto:
- **Analgésico (painkiller):** resolve uma dor aguda e presente; o usuário *busca ativamente* e
  paga com urgência (ex.: extrato bancário quando você suspeita de fraude).
- **Vitamina:** faz bem no longo prazo, mas ninguém tem urgência; adoção depende de hábito e
  fé no benefício futuro (ex.: "acompanhe seu bem-estar").

**Por que importa.** Analgésicos vendem sozinhos; vitaminas precisam de marketing pesado e têm
retenção frágil. Startups solo **devem** começar por um analgésico para provar a tese.

### 7.1. O Atlas é qual?

Honestamente: **hoje, para o mainstream, o Atlas é uma vitamina** (autoconhecimento é
importante-mas-não-urgente). Fingir o contrário seria autoengano perigoso. **Porém**, para as
personas-beachhead (§4), há **momentos-analgésico** claros:

| Momento-analgésico (agudo) | Persona | Por que é dor urgente |
|---|---|---|
| "Meu sono desabou e não sei por quê" | Otimizador Quantificado | Sofrimento presente, busca ativa |
| "Para onde foi meu dinheiro este mês?" | Orientado a Dados | Dor financeira concreta |
| "Estou ansioso/esgotado e quero entender o gatilho" | Autoconsciente | Sofrimento emocional |
| "Quero os insights, mas não confio na Big Tech" | Preocupado com Privacidade | Conflito ativo hoje |

### 7.2. Estratégia: converter vitamina em analgésico

A jogada de produto é **entregar um momento-analgésico cedo** (o "insight cross-domain em
minutos", objetivo O1/O2 do [`00_Project_Vision.md`](00_Project_Vision.md) §6.1) que faça o
usuário *sentir* a dor que nem sabia que tinha — e então o hábito (vitamina) o retém. A North
Star Metric (*Insights acionados por semana*) mede exatamente essa transição de valor.

**Risco honesto:** se o Atlas ficar preso na vitamina (dashboards bonitos, insight raso), vira
mais um app de quantified-self de baixa retenção. Mitigação: rigor na explicabilidade + ação +
cross-domain real. Registrado em [`25_Risks.md`].

---

## 8. Como sabemos que é um problema real (evidências e sinais)

Ceticismo obriga: "achamos que é um problema" não vale nada. Buscamos **sinais externos**
independentes da nossa opinião. Quantificação e fontes em
[`02_Market_Research.md`](02_Market_Research.md); aqui, os *sinais qualitativos*.

### 8.1. Sinais de mercado (as pessoas já votam com atenção/dinheiro)

- **Crescimento de "memória" pessoal com IA:** Rewind AI e Limitless (Pendant) captaram
  atenção e capital significativos vendendo "lembre-se de tudo". *Sinal:* existe demanda por
  externalizar memória. *Ressalva:* são cloud-centric e de captura ampla — validam a demanda,
  não a solução (ver [`03_Competitive_Analysis.md`](03_Competitive_Analysis.md)).
- **Wearables/quantified self em alta:** Oura, Whoop, Garmin, Apple Watch — milhões pagam
  mensalmente por *dados sobre si mesmos*. *Sinal:* disposição a pagar por autoconhecimento
  quantificado. *Ressalva:* todos silos verticais → validam o apetite, expõem o vácuo
  cross-domain.
- **Boom de journaling e apps de humor.** *Sinal:* apetite por reflexão estruturada.
- **PKM / "second brain" (Notion, Obsidian, Roam, Mem):** movimento cultural inteiro em torno
  de organizar a própria mente/conhecimento. *Sinal:* demanda por externalizar cognição.
- **Big Techs entrando em "contexto pessoal":** Apple Intelligence, Google "Personal Context",
  OpenAI/ChatGPT Memory, Microsoft Recall — as maiores empresas do mundo apostam capital em
  *IA que conhece você*. *Sinal (o mais forte):* validação da direção pelas empresas com mais
  dados e recursos. *Implicação estratégica:* também é a maior **ameaça** — respondida via
  cross-domain neutro + privacidade real em [`03_Competitive_Analysis.md`](03_Competitive_Analysis.md)
  e [`25_Risks.md`].

### 8.2. Sinais regulatórios/culturais (privacidade)

- **GDPR (2018) / LGPD (2020)** deram *direito legal* à portabilidade e deleção → institucionalizam
  a ideia de que **o dado é do usuário**. Isso é vento de cauda estrutural para o local-first.
- **Open Banking / PIX (Brasil)** abrem dados financeiros de forma consentida → viabilizam
  conectores legítimos (relevante para o mercado-âncora do autor; ver
  [`02_Market_Research.md`](02_Market_Research.md)).
- **Pós-escândalos (Cambridge Analytica etc.):** desconfiança pública crescente de modelos de
  ads → disposição a pagar por privacidade.

### 8.3. Sinal pessoal (o founder-problem)

O autor é o **usuário-zero** com a dor aguda (persona 🔥🔥🔥). *Founder-market fit*: quem sente
a dor constrói melhor. Ressalva metodológica: o autor é enviesado; por isso a validação com
usuários reais (🟡) é gatilho explícito no [`21_Roadmap.md`], e este documento evita tratar a
convicção do founder como prova.

### 8.4. Como *não* nos enganar (falsificação da tese)

Definimos, honestamente, o que **refutaria** o problema:

| Se observássemos... | ...concluiríamos que |
|---|---|
| Early adopters não conectam >1 domínio nem com esforço mínimo | O cross-domain não é valorizado na prática |
| Usuários acham os insights "óbvios" ou irrelevantes | O degrau "conhecimento" não gera valor percebido |
| Ninguém paga; churn alto após o "efeito novidade" | É vitamina fraca, não analgésico |
| Big Tech resolve "bom o suficiente" de graça | O vácuo se fecha; moat insuficiente |

Esses são nossos **kill criteria** — critérios de invalidação (ligados a [`25_Risks.md`] e às
métricas do [`00_Project_Vision.md`](00_Project_Vision.md) §11).

---

## 9. Quanto vale resolver (ligação com o valor)

> Dimensionamento formal (TAM/SAM/SOM, top-down e bottom-up) em
> [`02_Market_Research.md`](02_Market_Research.md); monetização em [`22_Business_Model.md`].
> Aqui, apenas o **argumento de valor**, com números sinalizados como ordens de grandeza.

**Valor para o indivíduo.** Se o Atlas melhora marginalmente decisões recorrentes de sono,
foco, dinheiro e humor, o valor composto ao longo de anos é alto — é o mesmo argumento pelo
qual as pessoas já pagam assinaturas de ~US$ 5–20/mês por *fatias* disso (Oura, Whoop, Notion,
apps de finança). O Atlas propõe capturar o valor da *interseção* dessas fatias.

**Raciocínio de ordem de grandeza (NÃO é fato verificado — é estimativa ilustrativa):** se
existirem, globalmente, na ordem de dezenas a centenas de milhões de pessoas que já pagam por
*alguma* ferramenta de dados pessoais (wearables + PKM + finanças + journaling somam essa
grandeza), e o Atlas capturar uma fração pequena a um ARPU de assinatura comparável, o SOM
inicial é materialmente relevante para um fundador solo, e o TAM é grande o suficiente para uma
empresa de escala. **Toda essa cadeia é hipótese a ser validada** — a metodologia e as
ressalvas estão em [`02_Market_Research.md`](02_Market_Research.md). Aqui, o ponto é apenas:
*a disposição a pagar por fatias já existe e é observável*; a aposta é que a interseção vale
mais que a soma das partes.

**Valor estratégico (moat).** O ativo criado — o **CMHL acumulado** — tem *data network effect
de um usuário só*: melhora com o tempo, é caro de replicar e cresce o custo de troca de forma
*alinhada ao usuário* (ele fica porque o valor é real, não por aprisionamento malicioso). Ver
[`00_Project_Vision.md`](00_Project_Vision.md) §4.3 e [`03_Competitive_Analysis.md`](03_Competitive_Analysis.md).

---

## 10. Anti-problema (o que NÃO estamos resolvendo)

Definir o escopo pela negativa é tão importante quanto pela positiva — é o que protege um
fundador solo do *scope creep*. Alinhado aos anti-objetivos do
[`00_Project_Vision.md`](00_Project_Vision.md) §6.4 e §1.1 do master context.

| NÃO estamos resolvendo | Por que não | O que fazemos em vez disso |
|---|---|---|
| **Medir melhor um domínio** (sono, corrida, batimentos) | É jogo de hardware/vertical; Oura/Whoop vencem | Ingerimos o dado deles e correlacionamos |
| **Ser um to-do / produtividade / GTD** | Mercado saturado; não é a tese | Insight e compreensão, não gestão de tarefas |
| **Ser um chatbot genérico com memória** | Anti-padrão (§5.6); caixa-preta | IA como interpretador do CMHL estruturado |
| **Ser rede social / compartilhamento** | Contradiz privacidade local-first | Espelho privado, não vitrine |
| **Vigilância corporativa / people analytics** | Contradiz "seu dado é seu" | B2C individual; o usuário é o dono |
| **Diagnóstico médico** | Risco regulatório e ético altíssimo | Insights de bem-estar, não clínicos (ver disclaimers em [`15`]/[`16`]) |
| **Captura ambiental total** (áudio/tela 24/7, estilo Recall/Rewind) | Custo de privacidade > valor; contra a tese | Ingestão consentida, granular e estruturada |
| **Resolver tudo no MVP** | Fundador solo; complexidade prematura mata | Disciplina de fases 🟢→🔴 |

**Regra de ouro:** quando em dúvida se algo pertence ao Atlas, pergunte: *"isso enriquece o CMHL
cross-domain ou é um produto vertical à parte?"* Se for vertical, não é nosso — no máximo é um
conector.

---

## 11. Síntese do problema (o "one-pager" defensável)

1. **Problema:** pessoas geram dados sem precedentes sobre si e não conseguem convertê-los em
   autoconhecimento acionável — os dados vivem fragmentados e não lhes pertencem de fato.
2. **Causa-raiz:** incentivos de silo + modelo de ads + custo histórico de unificar + ausência
   de padrão + déficit de confiança.
3. **Quem sofre:** todos (latente); agudamente os quantified-self, orientados a dados e
   preocupados com privacidade (beachhead).
4. **Falhas atuais:** cada solução acerta 1 dimensão; ninguém ocupa a interseção
   {cross-domain} ∩ {explicável} ∩ {privado/local-first} ∩ {modelo estruturado}.
5. **Por que agora:** APIs de dados + IA/embeddings baratos + demanda por privacidade abriram
   uma janela de ~5 anos.
6. **Valor:** disposição a pagar por *fatias* já existe; a aposta é que a interseção vale mais
   que a soma (ordem de grandeza; ver [`02`]).
7. **Anti-problema:** não medimos verticais, não somos to-do/chatbot/rede social/vigilância;
   IA é interpretador, não produto.

---

### Resumo executivo

O Atlas ataca o **Paradoxo da Abundância de Dados Pessoais**: geramos mais dados sobre nós do
que qualquer geração e, ainda assim, nos entendemos pouco, porque esses dados vivem
**fragmentados** em silos que não conversam e que **não nos pertencem**. O problema persiste
por **incentivos econômicos** (lock-in de silo, modelo de ads com conflito de interesse
estrutural) e por um **custo histórico de unificar** que só caiu recentemente (APIs de dados +
IA/embeddings commodity + demanda por privacidade — a janela "why now"). Nenhuma solução atual
— planilhas, journaling, apps verticais, Notion/Obsidian, quantified-self, "LLM com memória" —
ocupa a **interseção defensável** {cross-domain profundo} ∩ {explicável} ∩ {local-first} ∩
{modelo estruturado durável}, que é exatamente onde o CMHL do Atlas vive. A dor é hoje um
**analgésico** para as personas-beachhead (quantified-self, orientados a dados, privacidade) e
uma **vitamina** para o mainstream, e a estratégia é entregar um momento-analgésico cedo
(insight cross-domain em minutos) para converter valor em hábito. Sinais externos — o
crescimento de Rewind/Limitless, wearables, journaling, PKM e a entrada das Big Techs em
"contexto pessoal" — validam a *direção*; e os *kill criteria* definidos nos protegem do
autoengano. O escopo é disciplinado por um **anti-problema** claro: não medimos verticais, não
somos to-do/chatbot/rede social/vigilância, e a IA é sempre o **interpretador** do CMHL — nunca
o produto.
