# 00 — Project Vision

> **Fase geral:** Fundacional (atemporal) · **Leia antes:** [`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md)
> **Documentos relacionados:** `01_Problem_Statement`, `21_Roadmap`, `22_Business_Model`, `29_Future_Research`

---

## 1. Visão (Vision)

> **Um mundo em que cada pessoa possui uma inteligência que a compreende profundamente — um
> modelo digital, privado e vivo da própria vida — que a ajuda a entender seu passado, navegar
> seu presente e projetar seu futuro, sem jamais deixar de ser dela.**

A visão do Atlas é inverter a relação atual entre pessoas e software. Hoje, dezenas de
empresas constroem modelos *sobre* nós para nos vender coisas, prever cliques e capturar
atenção. Esses modelos são poderosos, mas pertencem a terceiros, são opacos e são otimizados
para os interesses de quem os detém — não os nossos.

O Atlas propõe o oposto: **o modelo mais rico e completo da sua vida deve pertencer a você**,
rodar prioritariamente no seu dispositivo, ser transparente e ser otimizado para um único
objetivo — o seu florescimento (bem-estar, produtividade, autoconhecimento, boas decisões).

## 2. Missão (Mission)

> **Construir a infraestrutura de Inteligência Pessoal que transforma os dados dispersos da
> vida de alguém em conhecimento útil, explicável e acionável — preservando privacidade,
> transparência e controle total.**

Missão é o "como perseguimos a visão hoje". Concretamente, isso significa:

1. **Unificar** sinais hoje isolados (localização, saúde, finanças, calendário, notas,
   comunicação) num único modelo — o **CMHL**.
2. **Inferir** relações e padrões entre esses sinais (não só armazená-los).
3. **Explicar** cada conclusão com evidências rastreáveis.
4. **Devolver o controle**: o usuário decide o que entra, o que sai e o que a IA pode ver.

## 3. O Problema (resumo — aprofundado em `01`)

Vivemos a maior era de geração de dados pessoais da história, e simultaneamente a maior era de
**fragmentação** desses dados. Cada app é um silo. O resultado é um paradoxo:

> Nunca geramos tantos dados sobre nós mesmos, e nunca nos entendemos tão pouco por meio deles.

Perguntas simples e profundamente humanas permanecem sem resposta computável:

- *O que realmente aumenta minha produtividade?*
- *O que costuma acontecer antes de eu procrastinar?*
- *Quais lugares e pessoas melhoram meu humor?*
- *Quais pequenas mudanças tiveram maior impacto na minha vida?*

Nenhum produto atual responde a isso, porque nenhum tem **o modelo unificado e cross-domain**
necessário. Ver `01_Problem_Statement.md` e `03_Competitive_Analysis.md`.

## 4. A Tese (Thesis)

A tese do Atlas é composta por quatro afirmações que, se verdadeiras, tornam o projeto
inevitável e valioso:

1. **Tese de dados:** os dados pessoais mais valiosos não são os de um domínio, mas as
   **relações entre domínios**. O valor está no *cross-domain*, que hoje ninguém detém.
2. **Tese de modelo:** um **modelo estruturado** (eventos + grafo + memória semântica) é
   superior a "jogar tudo num LLM". Estrutura dá explicabilidade, custo baixo e durabilidade.
3. **Tese de IA:** a IA é **commodity** (APIs intercambiáveis); o ativo defensável é o
   **CMHL acumulado**. Logo, IA é componente, não produto.
4. **Tese de confiança:** privacidade não é obstáculo, é **pré-condição**. Só um sistema
   local-first e transparente ganha permissão para ver a vida inteira de alguém.

### 4.1. Por que "modelo estruturado" e não "só um LLM com memória"?

| Abordagem | Custo | Explicabilidade | Durabilidade | Escala de dados |
|---|---|---|---|---|
| "Jogar tudo no contexto do LLM" | Alto (tokens ∝ dados) | Baixa (caixa-preta) | Frágil (muda com o modelo) | Ruim (context window limita) |
| **CMHL estruturado + RAG** | Baixo (recupera só o relevante) | Alta (aponta evidências) | Estável (dados sobrevivem a qualquer modelo) | Excelente (anos de dados) |

Esta é a decisão fundacional do produto (ver `11_Event_Model.md` e `12_AI_Architecture.md`).

## 5. Filosofia (Philosophy)

Cinco crenças que guiam cada decisão:

1. **"Your data, your model, your device."** O usuário é dono do modelo, não o objeto dele.
2. **Compreensão > Registro.** Já existem apps que registram. O Atlas *entende*.
3. **Explicabilidade > Mágica.** Um insight sem evidência é ruído perigoso.
4. **Evolução > Perfeição.** *Make it work → right → scalable.* Simplicidade primeiro.
5. **Aumentar, não substituir.** O Atlas é uma "segunda inteligência" que amplia o julgamento
   humano — jamais o terceiriza.

## 6. Objetivos (Objectives)

### 6.1. Objetivos de produto
- **O1 — Insight em minutos:** o usuário deve ter seu primeiro insight relevante na primeira
  sessão (mesmo com poucos dados). Ver `06_User_Journey.md`.
- **O2 — Compreensão cross-domain:** demonstrar ≥1 relação entre domínios diferentes (ex.:
  sono × gasto) na primeira semana.
- **O3 — Confiança:** exportação e deleção total de dados desde o dia 1.

### 6.2. Objetivos técnicos
- **T1 — Local-first funcional:** app usável 100% offline; nuvem opcional.
- **T2 — Custo de IA controlado:** custo marginal de IA por usuário/mês previsível e baixo
  (heurística antes de LLM; cache de embeddings). Ver `12`.
- **T3 — Arquitetura reversível:** nenhuma decisão do MVP impede a evolução para escala.

### 6.3. Objetivos pessoais (do fundador)
- **P1 — Domínio total:** conseguir defender cada decisão numa entrevista Big Tech.
- **P2 — Crescimento técnico:** dominar IA aplicada, grafos, event sourcing, mobile avançado.
- **P3 — Ativo de carreira:** portfólio + potencial de paper + potencial de startup.

### 6.4. Anti-objetivos (o que explicitamente NÃO faremos)
- ❌ Não construiremos microserviços/Kafka/Neo4j no MVP.
- ❌ Não seremos um clone de "quantified self" com gráficos bonitos e sem inferência.
- ❌ Não venderemos dados nem usaremos publicidade como modelo primário.
- ❌ Não terceirizaremos a compreensão para um chatbot genérico.

## 7. Por que este projeto deve existir

1. **Necessidade humana real:** autoconhecimento e boas decisões são universais e atemporais.
2. **Vácuo de mercado:** ninguém detém o modelo *cross-domain* privado (ver `03`).
3. **Alinhamento de incentivos:** o único modelo verdadeiramente a favor do usuário é um que
   ele possui. Big Techs têm conflito de interesse estrutural (atenção/ads).
4. **Valor científico:** modelar computacionalmente a vida humana é um problema de fronteira
   em HCI, ML e sistemas (ver `23` e `29`).

## 8. Por que agora (Why now)

Janelas de oportunidade que só se abriram recentemente:

1. **APIs de dados pessoais maduras:** Health Connect (2023+), HealthKit, Open Banking/PIX,
   Google/Microsoft Graph — permitem ingestão legítima e consentida.
2. **LLMs baratos e bons o suficiente:** o custo de inferência caiu ordens de magnitude;
   embeddings viraram commodity. A "cola" semântica agora é acessível a um dev solo.
3. **On-device AI viável:** NPUs em smartphones e modelos pequenos (SLMs) tornam a inferência
   local privada uma realidade próxima (🟡/🟠).
4. **Consciência de privacidade:** pós-GDPR/LGPD e pós-escândalos, o público valoriza (e paga
   por) soluções que respeitam privacidade.
5. **Fadiga de ferramentas:** proliferação de apps isolados criou dor real de fragmentação.

> **Tese temporal:** a interseção "APIs de dados + IA barata + demanda por privacidade" abriu
> uma janela de ~5 anos onde um fundador solo consegue construir o que exigiria um time há uma
> década.

## 9. Visão de longo prazo (10 anos)

O Atlas evolui de **app** → **plataforma** → **infraestrutura padrão de Inteligência Pessoal**.

- **App (anos 1–2):** memória inteligente + insights cross-domain para o indivíduo.
- **Plataforma (anos 3–5):** SDK/API para que terceiros construam apps sobre o CMHL do usuário
  (com consentimento granular). O Atlas vira o "sistema operacional de dados pessoais".
- **Infraestrutura (anos 6–10):** agentes pessoais que agem em nome do usuário, com o CMHL como
  memória e contexto; padrão aberto de portabilidade de modelo de vida.

Detalhamento em `21_Roadmap.md`.

## 10. Roadmap de 10 anos (visão macro)

> Datas são direcionais; gatilhos importam mais que datas. Detalhe em `21_Roadmap.md`.

| Horizonte | Tema | Marcos-chave | Fase |
|---|---|---|---|
| **Ano 1** | *Prove a tese* | MVP local-first; 3–5 conectores; timeline; primeiros insights; o autor usa diariamente | 🟢 |
| **Ano 2** | *Produto amável* | Mais conectores; insights semanais; passkeys; base de early adopters; freemium | 🔵 |
| **Ano 3** | *Inteligência real* | Grafo de conhecimento (Neo4j); RAG maduro; inferência de padrões; V2 | 🟡 |
| **Anos 4–5** | *Plataforma* | SDK/API; on-device AI; escala (Qdrant, multi-região); B2C→B2B2C | 🟠 |
| **Anos 6–10** | *Infraestrutura* | Agentes pessoais; inferência causal; padrão aberto de portabilidade; pesquisa | 🔴 |

## 11. Métricas de sucesso da visão (North Star)

- **North Star Metric:** *Insights acionados por semana* (insight que o usuário marcou como
  útil ou que gerou uma ação). Mede compreensão real, não vaidade.
- **Métricas de apoio:** retenção D30/D90; nº de domínios conectados por usuário; % de usuários
  com ≥1 insight cross-domain; custo de IA por usuário ativo; NPS de confiança/privacidade.

## 12. Riscos da visão (resumo — ver `25_Risks.md`)

- **Fragmentação de dados persistente:** plataformas fecharem APIs. *Mitigação:* entrada
  manual + local-first + valor mesmo com poucas fontes.
- **Commoditização por Big Techs:** Apple/Google embutirem algo similar. *Mitigação:*
  cross-domain + privacidade real + neutralidade de plataforma.
- **Confiança:** um único vazamento destrói o produto. *Mitigação:* local-first, E2EE, mínimo
  de dados no servidor.
- **Fundador solo:** escopo excessivo. *Mitigação:* disciplina de fases (🟢→🔴).

---

### Resumo executivo
O Atlas existe para dar a cada pessoa um **modelo privado e vivo da própria vida** que
transforma dados dispersos em **conhecimento explicável**. A IA é ferramenta; o ativo é o
**CMHL**. A janela de oportunidade (APIs + IA barata + demanda por privacidade) é agora. A
execução é **evolutiva e disciplinada por fases**, viável para um fundador solo, com potencial
de virar infraestrutura global de Inteligência Pessoal.
