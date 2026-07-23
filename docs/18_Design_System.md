# 18 — Design System

> **Fase geral:** Fundacional (atemporal), com componentes rotulados por fase 🟢🔵🟡🟠🔴 · **Leia antes:** [`ATLAS_MASTER_CONTEXT.md`](ATLAS_MASTER_CONTEXT.md), [`00_Project_Vision.md`](00_Project_Vision.md)
> **Documentos relacionados:** [`06_User_Journey.md`](06_User_Journey.md), [`08_Mobile_Architecture.md`](08_Mobile_Architecture.md), [`15_Privacy_Architecture.md`](15_Privacy_Architecture.md), [`19_UI_Screens.md`](19_UI_Screens.md)
> **Status:** Vivo (living document) · **Versão:** 0.1 · **Última atualização:** 2026-07-20
> **Autor-âncora:** Sim (documento de referência canônico para toda a UI)

---

## Resumo executivo

Este documento define o **Design System do Atlas** — o conjunto de princípios, tokens e
componentes que garantem que cada tela transmita a promessa central do produto: **confiança e
calma**, não a ansiedade dos dashboards de "quantified self". O Atlas não vende métricas; vende
**compreensão**. Por isso o design é subtractivo por natureza — cada pixel precisa justificar
por que rouba a atenção do usuário.

O sistema é construído em três camadas: (1) **Princípios** (a filosofia visual e de interação),
(2) **Tokens** (a fonte única de verdade para cor, tipografia, espaço, raio, elevação e motion),
e (3) **Componentes** (átomos → moléculas → organismos, cada um com estados e regras de uso).
Fechamos com acessibilidade a fundo (WCAG 2.2 AA como piso), dark mode, internacionalização,
recomendação de stack de estilização em React Native (**recomendamos Restyle no MVP**,
comparando com Tamagui e NativeWind) e um capítulo sobre **data-viz calma** — como mostrar
insights sem transformar o app num painel de controle de usina.

**Regra-mestra do design do Atlas:** *"Menos dado, mais significado. Menos alarme, mais
serenidade. Nada de mágica sem evidência."*

---

## Índice

1. [Filosofia e princípios de design](#1-filosofia-e-princípios-de-design)
2. [Anatomia de um Design System (por que existe)](#2-anatomia-de-um-design-system-por-que-existe)
3. [Design tokens — a fonte única de verdade](#3-design-tokens--a-fonte-única-de-verdade)
4. [Cor: paleta, semântica e racional](#4-cor-paleta-semântica-e-racional)
5. [Tipografia](#5-tipografia)
6. [Espaçamento e layout (grid 4/8pt)](#6-espaçamento-e-layout-grid-48pt)
7. [Raio, borda, elevação e sombra](#7-raio-borda-elevação-e-sombra)
8. [Motion: animação com propósito](#8-motion-animação-com-propósito)
9. [Iconografia e ilustração](#9-iconografia-e-ilustração)
10. [Componentes — átomos, moléculas, organismos](#10-componentes--átomos-moléculas-organismos)
11. [Estados de componente](#11-estados-de-componente)
12. [Acessibilidade a fundo](#12-acessibilidade-a-fundo)
13. [Dark mode](#13-dark-mode)
14. [Internacionalização (i18n)](#14-internacionalização-i18n)
15. [Implementação em React Native](#15-implementação-em-react-native)
16. [Data-viz calma: visualizar insight, não dado bruto](#16-data-viz-calma-visualizar-insight-não-dado-bruto)
17. [Governança do Design System](#17-governança-do-design-system)
18. [Roadmap do Design System por fase](#18-roadmap-do-design-system-por-fase)

---

## 1. Filosofia e princípios de design

O design do Atlas não é decoração; é **argumento**. Cada decisão visual defende a tese do
produto (ver [`00_Project_Vision.md`](00_Project_Vision.md) §4): o Atlas é uma inteligência
pessoal privada que devolve compreensão e controle. Se a interface gerar ansiedade, competir
por atenção ou parecer opaca, ela **contradiz** o produto. A estética-alvo é o que a indústria
chama de *quiet luxury tech*: sofisticação silenciosa, ausência de ruído, confiança tranquila —
a sensação de um objeto bem-feito que não precisa gritar.

### 1.1. Os seis princípios (o "constitucional" do design)

> Estes princípios têm precedência sobre gosto pessoal. Em caso de conflito de design, vence o
> princípio de número mais baixo.

#### P1 — Calma acima de tudo (Calm Technology)

**O que é.** O conceito de *Calm Technology* (Mark Weiser & John Seely Brown, Xerox PARC, 1995)
afirma que a melhor tecnologia informa sem exigir atenção: ela vive na **periferia** da
consciência e só chama o **centro** quando é realmente importante.

**Por que existe no Atlas.** O mercado de "self-tracking" é dominado por interfaces que
*alarmam*: anéis que ficam vermelhos, streaks que você tem medo de quebrar, notificações de
culpa ("você não bateu sua meta"). Isso é engajamento por ansiedade — exatamente o modelo de
negócio que o Atlas **rejeita** (ver anti-objetivos em `00` §6.4).

**Como se manifesta.**
- Sem números vermelhos gigantes. Sem "score do dia" competindo com você.
- Nenhuma notificação de culpa. Notificações são raras, gentis e sempre acionáveis.
- Movimento suave, cores dessaturadas, muito espaço em branco (respiração visual).
- O default de qualquer tela é **silêncio informativo**: mostra o essencial, esconde o resto
  atrás de intenção explícita do usuário.

**Quando NÃO aplicar.** Sinais de segurança/privacidade (ex.: "seus dados serão enviados a um
LLM externo") **devem** chamar o centro da atenção. Calma não significa esconder o que importa.

#### P2 — Confiança é design (Trust by Design)

Privacidade é arquitetura (ver `ATLAS_MASTER_CONTEXT.md` §6), mas **percepção** de privacidade
é design. O usuário só entrega a vida inteira a um sistema em que **confia**. A UI precisa
tornar a confiança **visível e verificável**:

- Todo dado sensível carrega um indicador de **onde vive** (📱 local / ☁️ sincronizado / 🤖 IA).
- Toda ação de IA é **opt-in explícito**, nunca ligada por padrão.
- Todo insight é **rastreável** até suas evidências (P4).
- Exportar e deletar dados são ações **de primeira classe**, não escondidas em submenus.

#### P3 — Clareza acima de completude

Um bom design remove antes de adicionar. A pergunta não é "o que mais podemos mostrar?", mas
"o que podemos **remover** sem perder o significado?". Densidade de informação é inimiga da
compreensão. Preferimos uma frase clara a cinco gráficos.

#### P4 — Insight, não dado bruto (Explicabilidade visível)

O Atlas *entende*, não apenas *registra* (`00` §5). A hierarquia visual sempre privilegia a
**conclusão** ("você dorme 40 min a menos após treino tarde") sobre a **matéria-prima** (a
série temporal de sono). O dado bruto existe, mas fica **um toque abaixo** — disponível para
quem quer auditar, invisível para quem só quer entender. Nenhum insight aparece sem um caminho
visual para "Por quê?" → evidências.

#### P5 — Foco (uma intenção por tela)

Cada tela responde a **uma** pergunta do usuário. Telas que tentam fazer tudo não fazem nada
bem. Isso guia a arquitetura de navegação (ver `19_UI_Screens.md`) e a composição: um objetivo
primário, no máximo um secundário, tudo mais é terciário e recolhido.

#### P6 — Consistência sistêmica (Design como sistema, não como coleção de telas)

Nada de "one-off". Se um padrão aparece duas vezes, vira componente. Se um valor aparece duas
vezes, vira token. A consistência reduz a carga cognitiva (o usuário aprende o app uma vez) e
reduz o custo de manutenção (o fundador solo altera em um lugar).

### 1.2. Do princípio ao pixel: exemplos aplicados

| Situação | Design ansioso (rejeitado) | Design calmo do Atlas |
|---|---|---|
| Meta de sono não batida | Barra vermelha + "❌ Falhou!" | "Você dormiu 6h10 — um pouco abaixo da sua média de dias produtivos." (neutro, contextual) |
| Novo insight disponível | Badge vermelho "3" pulsando | Ponto suave âmbar, sem contador agressivo |
| Muitos dados no dia | 8 cards, 4 gráficos | 1 card de destaque + "ver mais" |
| Enviar dado à IA | Toggle ligado por padrão | Toggle desligado + explicação just-in-time |

### 1.3. As sensações-alvo (design como emoção)

Cada tela deve produzir **uma** destas sensações, nunca ansiedade:

- **Serenidade** — "está tudo sob controle, e sob meu controle."
- **Descoberta** — "não tinha percebido isso sobre mim."
- **Confiança** — "eu entendo de onde isso veio e sei que é meu."

---

## 2. Anatomia de um Design System (por que existe)

**O que é.** Um Design System é a fonte única de verdade que une três coisas: (1) **princípios**
(por que decidimos assim), (2) **tokens** (as decisões atômicas: cor, tamanho, tempo), e (3)
**componentes** (peças reutilizáveis que aplicam os tokens). É simultaneamente documentação,
código e cultura.

**Por que existe / que problema resolve.** Sem um sistema, cada tela vira uma decisão nova →
inconsistência (dez tons de azul), retrabalho e dívida de UX. Para um **fundador solo** (`00`
§6.3), o sistema é sobretudo **alavancagem**: você decide uma vez e colhe em todas as telas.

**Como funciona (a hierarquia de tokens).** A prática moderna (popularizada por
Salesforce/Lightning, Adobe Spectrum, Material 3) usa **três níveis de token**:

```
Nível 1 — Primitivos (raw)      →  blue-500 = #3B82F6, space-4 = 16
Nível 2 — Semânticos (aliases)  →  color.accent = blue-500, color.bg = neutral-0
Nível 3 — De componente (scoped)→  button.primary.bg = color.accent
```

- **Primitivos** nunca são usados diretamente na UI. São a "paleta física".
- **Semânticos** carregam **intenção** ("accent", "danger", "surface"). É o que os componentes
  consomem. Trocar dark/light = remapear semânticos, sem tocar em componentes.
- **De componente** só existem quando um componente precisa fugir do semântico.

**Como se implementa no Atlas.** Tokens vivem em TypeScript (`src/theme/tokens.ts`), tipados,
consumidos via tema (ver §15). Um único arquivo governa toda a estética.

**Trade-off.** Três níveis dão flexibilidade máxima mas custam indireção. No MVP mantemos
**dois níveis** (primitivos + semânticos) e só introduzimos tokens de componente quando a dor
aparecer — coerente com "evitar complexidade prematura" (`ATLAS_MASTER_CONTEXT.md` §3).

---

## 3. Design tokens — a fonte única de verdade

### 3.1. Convenção de nomenclatura

Nomeamos por **intenção**, não por aparência. `color.accent` (não `color.blue`); `space.4`
(não `space.medium`). Assim, mudar a cor de destaque não exige renomear nada.

Padrão: `categoria.papel[.variante][.estado]`
Exemplos: `color.text.primary`, `color.bg.surface`, `color.border.subtle`,
`space.4`, `radius.md`, `motion.duration.fast`.

### 3.2. Escala de tokens (visão geral)

| Categoria | Papel | Fonte da escala |
|---|---|---|
| Cor | Comunicar hierarquia, estado, marca | §4 |
| Tipografia | Ritmo de leitura, hierarquia | §5 (escala modular 1.2) |
| Espaço | Respiração, agrupamento | §6 (base 4pt) |
| Raio | Suavidade, personalidade | §7 |
| Elevação/Sombra | Profundidade, foco | §7 |
| Motion | Continuidade, feedback | §8 |
| Opacidade | Estados disabled/overlay | §11 |
| Z-index | Camadas (sheet, toast, modal) | §10.3 |

---

## 4. Cor: paleta, semântica e racional

### 4.1. Filosofia de cor

A cor no Atlas é **econômica e intencional**. A base é uma escala de **neutros quentes** (não
cinzas puros e frios — quentes transmitem calma e humanidade). A cor de destaque (**accent**) é
usada com **parcimônia cirúrgica**: quanto menos usamos, mais significado ela carrega. Cores
semânticas (sucesso/atenção/erro) são **dessaturadas** — o vermelho do Atlas nunca é o vermelho
de alarme de um app financeiro.

**Racional da paleta neutra quente.** Cinzas frios (azulados) parecem "clínicos" e corporativos;
neutros quentes (leve viés bege/pedra) transmitem serenidade, papel, calma — alinhado ao *quiet
luxury*. É a diferença entre um hospital e uma biblioteca.

**Accent = azul-ardósia calmo (slate blue).** Escolhemos um azul dessaturado, quase petróleo, em
vez de um azul vibrante de tech genérica. Azul comunica confiança e estabilidade sem euforia. É
o "azul de quem não precisa provar nada".

### 4.2. Primitivos — Neutros (pedra quente)

| Token | Hex (light ref.) | Uso típico |
|---|---|---|
| `neutral.0` | `#FFFFFF` | Fundo base (light) |
| `neutral.50` | `#FAF9F7` | Superfície de app (light) |
| `neutral.100` | `#F3F1EE` | Superfície elevada sutil |
| `neutral.200` | `#E7E4DF` | Bordas sutis, divisores |
| `neutral.300` | `#D6D2CB` | Bordas, disabled bg |
| `neutral.400` | `#B4AEA4` | Ícones inativos, placeholder |
| `neutral.500` | `#8A857B` | Texto terciário |
| `neutral.600` | `#6B675E` | Texto secundário |
| `neutral.700` | `#4A473F` | Texto forte secundário |
| `neutral.800` | `#2E2C27` | Texto primário (light) |
| `neutral.900` | `#1A1917` | Títulos, quase-preto quente |
| `neutral.950` | `#0F0E0D` | Fundo base (dark) |

### 4.3. Primitivos — Accent (azul-ardósia)

| Token | Hex | Uso |
|---|---|---|
| `blue.50` | `#EEF2F6` | Fundo de estado accent sutil |
| `blue.100` | `#D9E2EC` | Chips, highlights suaves |
| `blue.300` | `#8FA9C2` | Accent em dark (mais claro) |
| `blue.500` | `#4A6D8C` | **Accent principal** |
| `blue.600` | `#3C5A76` | Accent press |
| `blue.700` | `#2E4560` | Accent forte / texto sobre claro |

### 4.4. Primitivos — Semânticos de estado (dessaturados)

| Token | Hex | Racional |
|---|---|---|
| `green.500` | `#5B8A72` | Sucesso sálvia — positivo sem euforia |
| `amber.500` | `#B9894F` | Atenção terroso — nota, não alarme |
| `red.500` | `#B4675E` | Erro terracota — sério, não agressivo |
| `violet.500` | `#7A6E9A` | Insight/IA — cor "de inteligência", distinta da UI comum |

> **Nota de marca.** Reservamos `violet` para tudo que é **derivado por inferência** (insights,
> ações de IA). Assim, o usuário aprende visualmente a distinguir *o que aconteceu* (neutro) de
> *o que o Atlas concluiu* (violeta). Explicabilidade vira **linguagem de cor**.

### 4.5. Tokens semânticos — Light mode

| Semântico | → Primitivo | Uso |
|---|---|---|
| `color.bg.base` | `neutral.50` | Fundo raiz da tela |
| `color.bg.surface` | `neutral.0` | Cards, sheets |
| `color.bg.surfaceElevated` | `neutral.0` + sombra | Elementos sobrepostos |
| `color.bg.subtle` | `neutral.100` | Zonas agrupadas, inputs |
| `color.text.primary` | `neutral.900` | Títulos, corpo principal |
| `color.text.secondary` | `neutral.600` | Apoio, legendas |
| `color.text.tertiary` | `neutral.500` | Metadados, timestamps |
| `color.text.onAccent` | `neutral.0` | Texto sobre accent |
| `color.border.subtle` | `neutral.200` | Divisores |
| `color.border.default` | `neutral.300` | Bordas de input |
| `color.accent` | `blue.500` | Ação primária, links, foco |
| `color.accent.pressed` | `blue.600` | Estado press |
| `color.success` | `green.500` | Confirmações |
| `color.warning` | `amber.500` | Atenção suave |
| `color.danger` | `red.500` | Erro/destruição |
| `color.insight` | `violet.500` | Insights e IA |
| `color.focusRing` | `blue.500` @ 40% | Anel de foco (a11y) |

### 4.6. Tokens semânticos — Dark mode

Dark mode **não é inversão**. Usamos superfícies quase-pretas quentes e **elevamos com cor, não
com sombra** (sombras somem no escuro). Superfícies mais altas ficam mais claras.

| Semântico | → Primitivo (dark) | Nota |
|---|---|---|
| `color.bg.base` | `neutral.950` (`#0F0E0D`) | Nunca `#000` puro (áspero, causa halation em OLED) |
| `color.bg.surface` | `#1A1917` (neutral.900) | Card = superfície +1 |
| `color.bg.surfaceElevated` | `#242220` | Sheet/modal = superfície +2 |
| `color.bg.subtle` | `#242220` | Inputs |
| `color.text.primary` | `#F3F1EE` | Não `#FFF` puro (reduz brilho) |
| `color.text.secondary` | `#B4AEA4` | |
| `color.text.tertiary` | `#8A857B` | |
| `color.border.subtle` | `#2E2C27` | |
| `color.accent` | `blue.300` (`#8FA9C2`) | Accent clareia no escuro p/ contraste |
| `color.danger` | `#C97F76` | Levemente clareado |
| `color.insight` | `#9A8EBA` | Violeta clareado |

> **Regra de contraste.** Todo par texto/fundo é validado contra WCAG (ver §12.2). Os hex acima
> são **pontos de partida** e devem passar no teste automatizado de contraste antes de virar
> token oficial.

### 4.7. Regras de uso da cor

1. **Accent com moderação:** no máximo **um** elemento accent forte por tela (a ação primária).
2. **Nunca cor sozinha para significado:** estado sempre acompanhado de ícone/texto (daltonismo).
3. **Violeta = inferência:** só para insights/IA, nunca para UI comum.
4. **Sem gradientes chamativos:** no máximo gradientes sutilíssimos em ilustrações de onboarding.
5. **Semânticos dessaturados:** o Atlas nunca "alarma" com cor pura saturada.

---

## 5. Tipografia

### 5.1. Filosofia tipográfica

Tipografia é 90% da UI. No Atlas ela precisa ser **legível, calma e com personalidade discreta**.
Preferimos uma escala tipográfica **restrita** (poucos tamanhos, bem escolhidos) a muitos
tamanhos arbitrários. Ritmo consistente = leitura sem esforço = calma.

### 5.2. Escolha de fontes

| Papel | Fonte MVP 🟢 | Racional |
|---|---|---|
| **UI / corpo** | **Inter** | Neutra, altíssima legibilidade em telas, ótimo suporte a i18n, gratuita (OFL). Padrão de facto de produtos "sérios". |
| **Display / títulos** | **Inter** (peso e tracking diferenciados) no MVP | Uma família só reduz complexidade e peso do bundle. |
| **Numérico / dados** | Inter com **tabular figures** (`font-variant-numeric: tabular-nums`) | Números alinham em colunas (timeline, valores) sem "pular". |
| **Voz editorial (🔵)** | Explorar uma serifada humanista (ex.: *Newsreader*, *Source Serif*) para títulos de Revisão Semanal | Dá tom "carta/diário", reforça calma e intimidade. Fase pós-MVP. |

> **Nota nativa (🟡):** Uma alternativa 100% sem download é usar **San Francisco (iOS)** e
> **Roboto (Android)** via fonte de sistema — zero bytes de bundle e sensação nativa. Trade-off:
> perde consistência cross-platform da identidade. No MVP priorizamos identidade (Inter em ambos).

### 5.3. Escala modular

Base **16pt**, razão **1.2 (menor terça)** — uma escala suave, sem saltos dramáticos (calma
também é ritmo tipográfico previsível). Line-height generoso para respiração.

| Token | Tamanho | Line-height | Peso | Uso |
|---|---|---|---|---|
| `text.display` | 34 | 40 | 600 | Título de tela hero (Home, Revisão) |
| `text.title1` | 28 | 34 | 600 | Título de tela |
| `text.title2` | 22 | 28 | 600 | Seção, título de card grande |
| `text.title3` | 18 | 24 | 600 | Subtítulo, título de card |
| `text.body` | 16 | 24 | 400 | Corpo padrão |
| `text.bodyStrong` | 16 | 24 | 600 | Corpo enfatizado |
| `text.callout` | 15 | 22 | 400 | Texto de apoio destacado |
| `text.subhead` | 14 | 20 | 500 | Rótulos, chips |
| `text.footnote` | 13 | 18 | 400 | Metadados, timestamps |
| `text.caption` | 12 | 16 | 500 | Legendas, badges |

### 5.4. Regras tipográficas

- **Pesos:** usar apenas 400 (regular), 500 (medium), 600 (semibold). Nada de 700+ (grita).
- **Comprimento de linha:** alvo 45–75 caracteres em textos longos (Revisão Semanal, insights).
- **Tracking:** levemente negativo em títulos grandes (`-0.3` a `-0.5`), 0 no corpo.
- **Hierarquia por peso e cor antes de tamanho:** preferir `bodyStrong` + `text.secondary` a
  criar um tamanho novo.
- **Dynamic Type:** todos os tokens escalam com a preferência do sistema (ver §12.4).

---

## 6. Espaçamento e layout (grid 4/8pt)

### 6.1. Por que 4/8pt

**O que é.** Uma escala de espaçamento baseada em múltiplos de 4 (com marcos em 8). É o padrão da
indústria (Apple HIG, Material) porque telas modernas têm densidades múltiplas de 4, então
valores em 4pt renderizam nítidos em qualquer densidade (1x, 2x, 3x).

**Por que.** Escala consistente = ritmo visual = calma. Também elimina o "achismo" de margens
(nunca mais `13px` aleatório).

### 6.2. Escala de espaço

| Token | Valor (dp) | Uso típico |
|---|---|---|
| `space.0` | 0 | Reset |
| `space.1` | 4 | Gap mínimo (ícone↔texto) |
| `space.2` | 8 | Padding interno compacto |
| `space.3` | 12 | Gap entre elementos relacionados |
| `space.4` | 16 | **Padding padrão de tela/card** |
| `space.5` | 20 | Separação de grupos |
| `space.6` | 24 | Entre seções |
| `space.8` | 32 | Blocos maiores |
| `space.10` | 40 | Respiração de hero |
| `space.12` | 48 | Espaço generoso (empty states) |
| `space.16` | 64 | Margens de destaque |

### 6.3. Regras de layout

- **Margem lateral de tela:** `space.4` (16) no MVP; conteúdo respira nas bordas.
- **Densidade calma:** preferir `space.4`/`space.6` entre blocos a comprimir informação.
- **Lei da proximidade (Gestalt):** elementos relacionados ficam próximos; grupos distintos
  separados por ≥ `space.6`. Espaço **é** a principal ferramenta de agrupamento (mais que linhas
  ou caixas).
- **Toque:** alvo mínimo 44×44pt (ver §12.5), independentemente do tamanho visual do ícone.
- **Grid:** layout de coluna única no MVP (mobile-first). Colunas/masonry só na Home avançada (🔵).

---

## 7. Raio, borda, elevação e sombra

### 7.1. Raio (border-radius)

Cantos arredondados transmitem suavidade e amabilidade (cantos vivos parecem "duros"/técnicos).
O Atlas usa raios generosos mas não infantis.

| Token | Valor | Uso |
|---|---|---|
| `radius.none` | 0 | Divisores, full-bleed |
| `radius.sm` | 8 | Chips, inputs, badges |
| `radius.md` | 12 | Botões |
| `radius.lg` | 16 | **Cards (padrão)** |
| `radius.xl` | 24 | Sheets, modais, cards hero |
| `radius.full` | 999 | Avatares, FAB, toggle |

### 7.2. Elevação e sombra

**Filosofia.** Sombras no Atlas são **suaves e difusas**, nunca duras. Elevação comunica
**foco/interatividade**, não decoração. No dark mode, elevação usa **cor** (superfície mais
clara), não sombra.

| Token | Light (sombra) | Dark (superfície) | Uso |
|---|---|---|---|
| `elevation.0` | nenhuma | `bg.base` | Fundo |
| `elevation.1` | `y:1 blur:2 rgba(26,25,23,0.04)` | `#1A1917` | Card em repouso |
| `elevation.2` | `y:4 blur:12 rgba(26,25,23,0.08)` | `#242220` | Card pressionado / dropdown |
| `elevation.3` | `y:12 blur:32 rgba(26,25,23,0.12)` | `#2E2C27` | Sheet, modal |

> **Regra:** no máximo **um** nível de elevação "vivo" por tela. Se tudo flutua, nada flutua.

---

## 8. Motion: animação com propósito

### 8.1. Filosofia de motion

Movimento no Atlas **explica**, não entretém. Cada animação responde a uma de três perguntas:
*(1) o que mudou? (2) de onde veio para onde foi? (3) o sistema me ouviu?* Se uma animação não
responde a nenhuma, ela é ruído e deve ser cortada. O tom é **suave e discreto** — nada de
bounces exagerados ou spins. Calma também é temporal.

**Princípios (baseados em Material Motion + Apple HIG + Disney "12 principles" filtrados):**

1. **Continuidade espacial:** elementos que persistem se movem, não piscam (evita "teletransporte").
2. **Feedback imediato:** toda ação tem resposta < 100ms (mesmo que seja só um press-state).
3. **Naturalidade:** easing que imita física (desacelera ao chegar), nunca linear em UI.
4. **Hierarquia:** o elemento importante entra primeiro/sai por último.
5. **Respeitar preferências:** honrar "Reduzir movimento" do sistema (ver §12.6).

### 8.2. Tokens de duração

| Token | Valor | Uso |
|---|---|---|
| `motion.duration.instant` | 100ms | Press-state, ripple, toggle |
| `motion.duration.fast` | 200ms | Fade de elemento, hover |
| `motion.duration.base` | 300ms | Transição de tela padrão, sheet |
| `motion.duration.slow` | 450ms | Entrada de hero, revelação de insight |
| `motion.duration.deliberate` | 600ms | Momentos especiais (fim de onboarding) |

> Regra prática: **quanto maior a superfície que se move, mais lenta** a animação (grandes coisas
> parecem pesadas). Micro-interações são rápidas; transições de tela são médias.

### 8.3. Tokens de easing

| Token | Curva (cubic-bezier) | Uso |
|---|---|---|
| `motion.easing.standard` | `0.2, 0, 0, 1` | Padrão (entra e sai) |
| `motion.easing.decelerate` | `0, 0, 0, 1` | Elemento **entrando** (chega e "assenta") |
| `motion.easing.accelerate` | `0.3, 0, 1, 1` | Elemento **saindo** (some rápido) |
| `motion.easing.gentle` | `0.4, 0, 0.2, 1` | Movimentos calmos, respiração |

> **Nunca use `linear`** em UI (parece mecânico/robótico), exceto para animações contínuas como
> loaders/progresso indeterminado.

### 8.4. Padrões de animação nomeados

- **Reveal de insight (assinatura):** o card de insight entra com fade + subida de 8dp em
  `slow` + `decelerate`, com o ícone violeta pulsando **uma única vez**. É o "momento de
  descoberta" — a única animação com leve teatralidade, porque é o coração do produto.
- **Sheet:** desliza de baixo em `base` + `decelerate`; scrim escurece em paralelo.
- **Skeleton → conteúdo:** cross-fade suave em `fast` (nunca "pisca").
- **Empty → populado:** stagger sutil (cada item entra 40ms após o anterior).

**Biblioteca:** `react-native-reanimated` (roda na UI thread → 60/120fps, essencial para calma
percebida) + `react-native-gesture-handler`. Ver §15.

---

## 9. Iconografia e ilustração

- **Ícones:** conjunto **outline** (linha), stroke ~1.75dp, cantos arredondados, grade 24dp.
  Recomendação MVP: **Lucide** (open-source, consistente, cobre tudo que precisamos). Estilo
  outline reforça leveza/calma; ícones sólidos parecem pesados.
- **Tamanhos de ícone:** `icon.sm` 16 · `icon.md` 20 · `icon.lg` 24 · `icon.xl` 32.
- **Ilustração:** minimalista, traço fino, paleta neutra + accent. Usadas em **empty states** e
  **onboarding** para dar humanidade sem infantilizar. Nada de mascotes.
- **Estilo de dado:** ver §16 (data-viz calma).

---

## 10. Componentes — átomos, moléculas, organismos

Adotamos **Atomic Design** (Brad Frost): compomos interfaces a partir de peças pequenas.

> **O que é.** Átomos (elementos indivisíveis: botão, input, texto) → Moléculas (grupos simples:
> campo com rótulo, chip com ícone) → Organismos (blocos complexos: card de insight, header de
> tela) → Templates → Páginas. **Por que.** Reuso máximo e consistência; o fundador solo constrói
> um vocabulário pequeno e recombina.

### 10.1. Átomos

| Componente | Descrição | Tokens-chave | Fase |
|---|---|---|---|
| `Text` | Wrapper tipográfico ligado aos tokens `text.*` | tipografia, cor | 🟢 |
| `Button` | Ação. Variantes: `primary`, `secondary`, `ghost`, `destructive` | accent, radius.md | 🟢 |
| `IconButton` | Ação só-ícone, alvo 44pt | icon, radius.full | 🟢 |
| `Input` | Campo de texto | border, radius.sm | 🟢 |
| `Chip` | Rótulo/filtro selecionável | subtle, radius.sm | 🟢 |
| `Badge` | Indicador numérico/estado (discreto) | caption | 🟢 |
| `Avatar` | Imagem/inicial de entidade | radius.full | 🟢 |
| `Icon` | Ícone Lucide | icon.* | 🟢 |
| `Divider` | Separador sutil | border.subtle | 🟢 |
| `Switch` | Toggle (crucial p/ opt-in de IA/privacidade) | accent | 🟢 |
| `Spinner` | Loader indeterminado (raro; preferir skeleton) | accent | 🟢 |
| `SourcePill` | Micro-indicador de origem: 📱/☁️/🤖 | insight, caption | 🟢 |

#### 10.1.1. Especificação do `Button`

| Variante | Uso | bg | texto | borda |
|---|---|---|---|---|
| `primary` | Ação principal (1 por tela) | `color.accent` | `onAccent` | — |
| `secondary` | Ação secundária | `bg.subtle` | `text.primary` | `border.default` |
| `ghost` | Ação terciária/inline | transparente | `color.accent` | — |
| `destructive` | Deletar dados | transparente | `color.danger` | `danger` @ borda |

- Altura: 48dp (confortável, calma). Padding horizontal: `space.5`. Raio: `radius.md`.
- **Estado de destruição** (deletar dados, §Ajustes em `19`) sempre exige confirmação e usa
  `destructive` — nunca `primary`, para não normalizar ações perigosas.

### 10.2. Moléculas

| Componente | Composição | Uso | Fase |
|---|---|---|---|
| `FormField` | `Text` (label) + `Input` + helper/erro | Formulários, entrada manual | 🟢 |
| `ListItem` | `Icon`/`Avatar` + título + subtítulo + trailing | Listas, Ajustes | 🟢 |
| `SearchBar` | `Input` + ícone busca + limpar | Busca semântica | 🟢 |
| `SegmentedControl` | grupo de `Chip` exclusivos | Filtros de Timeline | 🟢 |
| `Toast` | mensagem efêmera não-bloqueante | Feedback de ação | 🟢 |
| `PermissionRow` | `ListItem` + `Switch` + explicação | Onboarding/Ajustes | 🟢 |
| `EvidenceLink` | chip "Por quê?" → abre evidências | Insights (explicabilidade) | 🟢 |

### 10.3. Organismos

| Componente | Descrição | Estados | Fase |
|---|---|---|---|
| `TimelineItem` | Evento na timeline: horário, ícone de tipo, título, `SourcePill` | default, press, agrupado | 🟢 |
| `EventCard` | Detalhe resumido de um evento | default, loading | 🟢 |
| `InsightCard` | **Componente-assinatura**: conclusão + confiança + `EvidenceLink` | default, novo, dispensado | 🟢 |
| `EmptyState` | Ilustração + título + subtítulo + ação | — | 🟢 |
| `Skeleton` | Placeholder de carregamento | shimmer sutil | 🟢 |
| `Sheet` (bottom) | Container modal deslizante | entrando, aberto, saindo | 🟢 |
| `ScreenHeader` | Título + ações + voltar | default, scrolled (colapsa) | 🟢 |
| `TabBar` | Navegação inferior (Home/Timeline/Insights/Busca/Perfil) | por aba | 🟢 |
| `EntityHeader` | Cabeçalho de Perfil de Entidade | default | 🔵 |
| `ConnectionGraph` | Visualização de grafo | vazio, carregando, populado | 🟡 |
| `WeeklyReviewCard` | Bloco de narrativa semanal | — | 🔵 |

#### 10.3.1. `InsightCard` — a especificação mais importante

O `InsightCard` **é** o produto em forma de componente. Ele materializa os princípios P4
(insight, não dado) e P2 (confiança). Anatomia:

```
┌─────────────────────────────────────────────┐
│ ✦ (violeta, 1 pulso)          [dispensar ⋯]  │  ← marca de "inferência"
│                                               │
│  Você dorme 40 min a menos nas noites         │  ← conclusão (text.title3)
│  após treino depois das 20h.                  │
│                                               │
│  Baseado em 12 noites nos últimos 30 dias.    │  ← contexto (text.footnote)
│                                               │
│  ▁▂▃ confiança: alta      [ Por quê? → ]      │  ← confiança + EvidenceLink
└─────────────────────────────────────────────┘
```

- **Nunca** mostra número gigante nem cor de alarme.
- **Sempre** tem `EvidenceLink` ("Por quê?") → abre Sheet com os eventos-evidência (rastreável
  até a fonte, ver `19_UI_Screens.md` → Detalhe de Insight).
- **Confiança** é visualizada como indicador **qualitativo suave** ("alta/média/baixa" + micro-
  sparkline), nunca como "97%" (falsa precisão gera ansiedade e desconfiança).
- **Dispensável:** o usuário pode dispensar/silenciar — controle é confiança.

#### 10.3.2. Z-index (camadas)

| Token | Valor | Camada |
|---|---|---|
| `z.base` | 0 | Conteúdo |
| `z.sticky` | 10 | Headers fixos |
| `z.sheet` | 100 | Bottom sheets |
| `z.modal` | 200 | Modais |
| `z.toast` | 300 | Toasts |
| `z.critical` | 400 | Avisos de privacidade/segurança |

---

## 11. Estados de componente

Todo componente interativo especifica **todos** os estados. Estado faltante = bug de UX.

| Estado | Definição | Tratamento visual padrão |
|---|---|---|
| `default` | Repouso | Tokens base |
| `hover` | Ponteiro sobre (tablet/web/🔵) | Leve mudança de `bg.subtle` |
| `press` | Toque ativo | Escurece 4–8% + escala 0.98 em `instant` |
| `focus` | Foco de teclado/leitor | `color.focusRing` (anel 2dp) — obrigatório p/ a11y |
| `selected` | Item escolhido | `blue.50` bg + accent na borda/texto |
| `disabled` | Indisponível | Opacidade 0.4 + sem eventos |
| `loading` | Processando | Skeleton (preferido) ou spinner inline |
| `error` | Falha/validação | `color.danger` + ícone + mensagem clara |
| `empty` | Sem dados | `EmptyState` dedicado |

### 11.1. Tokens de opacidade

| Token | Valor | Uso |
|---|---|---|
| `opacity.disabled` | 0.4 | Elementos desabilitados |
| `opacity.pressed` | 0.92 | Overlay de press |
| `opacity.scrim` | 0.5 | Fundo atrás de sheet/modal |
| `opacity.skeleton` | 0.08 → 0.16 | Shimmer |

### 11.2. Diretrizes de estado calmo

- **Loading:** preferir **skeleton** a spinner (skeleton mostra a *forma* do que vem → reduz
  ansiedade de espera). Spinner só para ações < 1s e inline.
- **Error:** nunca culpar o usuário. Mensagem = o que houve + o que fazer ("Sem conexão. Seus
  dados estão salvos no aparelho; sincronizamos quando voltar."). Local-first vira **conforto**.
- **Empty:** empty state é oportunidade, não vazio. Sempre com uma ação clara (ver §16 e
  `19_UI_Screens.md`).

---

## 12. Acessibilidade a fundo

> Acessibilidade **não é feature, é qualidade mínima**. Um produto que quer ver a vida inteira de
> alguém precisa ser usável por **todos**. Piso do Atlas: **WCAG 2.2 nível AA**.

### 12.1. Por que WCAG e o modelo POUR

**O que é.** WCAG (Web Content Accessibility Guidelines) organiza acessibilidade em 4 princípios
— **POUR**: **P**erceptível, **O**perável, **C**ompreensível (Understandable), **R**obusto. Em
mobile, o guia complementar é o **Mobile Accessibility Task Force** + Apple/Android a11y APIs.

**Como aplicamos:**
- **Perceptível:** contraste (§12.2), não depender de cor (§4.7), texto escalável (§12.4),
  alternativas textuais para ícones.
- **Operável:** alvos de toque (§12.5), navegação por leitor de tela (§12.3), sem depender de
  gesto único complexo (sempre há alternativa).
- **Compreensível:** linguagem simples (PT-BR claro), consistência (P6), erros explicados.
- **Robusto:** usar APIs nativas de acessibilidade (não hacks) → funciona com tecnologias
  assistivas presentes e futuras.

### 12.2. Contraste (obrigatório)

| Conteúdo | Razão mínima (AA) | Nota |
|---|---|---|
| Texto normal (< 18pt) | **4.5:1** | Corpo, legendas |
| Texto grande (≥ 18pt ou ≥ 14pt bold) | **3:1** | Títulos |
| Componentes/ícones/foco | **3:1** | Bordas, estados |
| Texto sobre accent | **4.5:1** | Validar `onAccent` |

- **Processo:** todo token de cor semântico passa por teste automatizado de contraste no CI
  (função `assertContrast()` sobre `tokens.ts`). Um par que falha **não vira token**.
- `text.tertiary` (`neutral.500`) só é permitido em texto ≥ 14pt bold ou como metadado não
  essencial — validamos caso a caso.

### 12.3. Leitores de tela (VoiceOver / TalkBack)

- Todo elemento interativo tem `accessibilityRole`, `accessibilityLabel` e, quando aplicável,
  `accessibilityHint` e `accessibilityState`.
- **Ícones sem texto** (ex.: `IconButton`) **exigem** `accessibilityLabel` (ex.: "Dispensar
  insight").
- **`SourcePill`** anuncia semanticamente: "Origem: local no aparelho" (não só o emoji).
- **`InsightCard`** é um único nó acessível que lê: conclusão → contexto → confiança → "toque
  duplo para ver por quê". A explicabilidade também é acessível.
- **Ordem de foco** segue a ordem visual/lógica; agrupamos com `accessibilityElementsHidden` /
  `importantForAccessibility` para evitar ruído.
- **Live regions** para conteúdo que muda (toasts, resultado de busca) via
  `accessibilityLiveRegion` (Android) / anúncios (`AccessibilityInfo.announceForAccessibility`).

### 12.4. Dynamic Type (texto escalável)

- Todos os tokens `text.*` respeitam a preferência de tamanho de fonte do sistema. Em RN, usamos
  `allowFontScaling` (default) e testamos até **200%**.
- **Layouts fluidos, nunca truncados por padrão:** conteúdo cresce e faz wrap; nada de altura
  fixa que corta texto grande. Cards crescem verticalmente.
- Testar as telas críticas (Onboarding, Insight, Ajustes) nos tamanhos XS, default, XXL e
  Acessibilidade-XXXL.

### 12.5. Alvos de toque

- Mínimo **44×44pt** (Apple HIG) — usamos isso como piso (Material sugere 48; adotamos 48 quando
  possível). O alvo pode ser maior que o visual (hit-slop).
- Espaçamento mínimo entre alvos: `space.2` (8dp) para evitar toques errados.

### 12.6. Reduzir movimento e outras preferências

- Honrar **"Reduzir movimento"** (`AccessibilityInfo.isReduceMotionEnabled`): substituir
  translações/escalas por cross-fades simples; desligar o pulso do `InsightCard`.
- Honrar **"Reduzir transparência"**: trocar scrims translúcidos por sólidos.
- Honrar **negrito/contraste aumentado** do sistema quando disponível.

### 12.7. Checklist de a11y por componente (Definition of Done)

- [ ] Contraste validado (§12.2)
- [ ] Role + label + state definidos
- [ ] Alvo ≥ 44pt
- [ ] Focus ring visível
- [ ] Funciona a 200% de fonte
- [ ] Não depende só de cor
- [ ] Testado com VoiceOver e TalkBack

---

## 13. Dark mode

- **Não é inversão** (ver §4.6). É um tema paralelo com regras próprias: superfícies quentes
  quase-pretas, elevação por cor, accent clareado, texto nunca `#FFF` puro.
- **Segue o sistema por padrão** (`Appearance` API), com override manual em Ajustes (light /
  dark / automático).
- **Imagens/ilustrações** têm variantes ou usam `currentColor` para se adaptarem.
- **OLED-friendly:** base `#0F0E0D` (não preto puro) evita *halation* e smearing em OLED, mantém
  a estética quente e economiza bateria sem o visual "buraco negro" agressivo.
- **Teste obrigatório:** toda tela é revisada nos dois temas antes do merge.

---

## 14. Internacionalização (i18n)

Mesmo começando em PT-BR, projetamos para i18n desde o dia 1 (reversibilidade, `00` §T3).

- **Nada de strings hardcoded:** todo texto vem de um catálogo (`i18n/pt-BR.json`), chaveado.
  Lib recomendada: **`i18next` + `react-i18next`** (ou `expo-localization` para locale).
- **Expansão de texto:** PT/DE podem ser ~30% mais longos que EN. Layouts nunca assumem
  comprimento fixo (liga-se ao Dynamic Type §12.4).
- **Pluralização e gênero:** usar ICU MessageFormat (plural/select) — evita concatenação frágil.
- **Datas/números/moeda:** via `Intl` (formato local), com **tabular figures** (§5.2) para
  alinhamento.
- **RTL (🟡):** projetar com propriedades lógicas (`start`/`end` em vez de `left`/`right`) para
  suportar árabe/hebraico no futuro sem retrabalho.
- **Conteúdo gerado por IA/insights:** o LLM recebe instrução de idioma do usuário; templates de
  insight determinísticos têm variantes por locale.

---

## 15. Implementação em React Native

### 15.1. O problema: como levar tokens ao código

Precisamos de uma solução que: (1) seja **tipada** (TS), (2) suporte **dark mode** trivialmente,
(3) tenha **performance nativa**, (4) evite complexidade prematura (`ATLAS_MASTER_CONTEXT.md`
§3), (5) case com Expo. Avaliamos as três principais bibliotecas.

### 15.2. Comparação: Restyle vs. Tamagui vs. NativeWind

| Critério | **Restyle** (Shopify) | **Tamagui** | **NativeWind** |
|---|---|---|---|
| Modelo | Theme tipado + props de estilo | Compilador + design system completo | Tailwind (classes utilitárias) via `className` |
| Type-safety | ★★★★★ (excelente, tokens tipados) | ★★★★☆ | ★★★☆ (classes são strings) |
| Dark mode | ★★★★★ (troca de tema nativa) | ★★★★★ | ★★★★ |
| Performance | ★★★★ (runtime leve) | ★★★★★ (compila estilos) | ★★★★ (compila p/ StyleSheet) |
| Curva/complexidade | ★★★★★ baixa | ★★☆ alta (setup/compilador) | ★★★★ média |
| Peso/deps | Mínimo | Pesado (compilador, muitos pkgs) | Leve |
| Fit com "boring tech" | ★★★★★ | ★★★ | ★★★★ |
| Componentes prontos | Não (só primitivos) | Sim (muitos) | Não |
| Web (futuro 🔵) | via RN Web | ★★★★★ (forte em web) | ★★★★★ |

### 15.3. Recomendação

> **MVP 🟢: adotar Restyle.** Racional: máxima type-safety para tokens, dark-mode trivial,
> complexidade baixíssima, casa perfeitamente com a filosofia "boring tech + tokens como fonte de
> verdade" e com um fundador solo. Não traz um compilador nem um universo de componentes que não
> precisamos ainda. Escrevemos nossos próprios átomos (poucos, controlados).

> **Reavaliar Tamagui em 🔵/🟡** *se e somente se* (a) formos sério com **web**, ou (b) a
> performance de listas/animações exigir estilos compilados. Registrar como ADR se mudarmos.

> **NativeWind** é ótimo para velocidade se o time já ama Tailwind, mas classes-string enfraquecem
> a type-safety dos tokens (nosso P6 depende de tokens fortes). Fica como segunda opção.

### 15.4. Estrutura de tema (Restyle) — esboço

```typescript
// src/theme/tokens.ts — Nível 1 (primitivos) e semânticos
export const palette = {
  neutral0: '#FFFFFF', neutral50: '#FAF9F7', /* ... */ neutral950: '#0F0E0D',
  blue500: '#4A6D8C', violet500: '#7A6E9A', /* ... */
} as const;

// src/theme/index.ts — Nível 2 (semânticos) + escalas
import { createTheme } from '@shopify/restyle';

const lightTheme = createTheme({
  colors: {
    bgBase: palette.neutral50,
    bgSurface: palette.neutral0,
    textPrimary: palette.neutral900,
    accent: palette.blue500,
    insight: palette.violet500,
    danger: '#B4675E',
    // ...mapeia todos os semânticos da §4.5
  },
  spacing: { s1: 4, s2: 8, s3: 12, s4: 16, s5: 20, s6: 24, s8: 32 },
  borderRadii: { sm: 8, md: 12, lg: 16, xl: 24, full: 999 },
  textVariants: {
    display: { fontSize: 34, lineHeight: 40, fontWeight: '600' },
    body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
    // ...mapeia a escala da §5.3
  },
});

export const darkTheme = { ...lightTheme, colors: { /* §4.6 */ } };
export type Theme = typeof lightTheme;
```

- **Motion:** `react-native-reanimated` + `react-native-gesture-handler` (UI thread → 60/120fps).
- **Ícones:** `lucide-react-native`.
- **Componentes acessíveis complexos** (sheets): `@gorhom/bottom-sheet`.
- **Tokens são a fonte única:** nenhum estilo inline com valores mágicos; lint proíbe hex/números
  crus fora de `tokens.ts` (regra custom / `eslint-plugin`).

Ver [`08_Mobile_Architecture.md`](08_Mobile_Architecture.md) para a arquitetura de app que
hospeda esta camada de UI (estado com Zustand + TanStack Query, navegação, offline-first).

### 15.5. Estrutura de pastas de UI (sugerida)

```
src/
  theme/            # tokens.ts, index.ts (temas), useTheme
  components/
    atoms/          # Button, Text, Input, Chip, Switch, SourcePill...
    molecules/      # FormField, ListItem, SearchBar, EvidenceLink...
    organisms/      # InsightCard, TimelineItem, EmptyState, Sheet...
  screens/          # ver 19_UI_Screens.md
  i18n/             # catálogos
```

---

## 16. Data-viz calma: visualizar insight, não dado bruto

> Este é o capítulo que **diferencia** o Atlas de todo app de "quantified self". O erro clássico
> é transformar dados pessoais num **dashboard ansioso** — paredes de gráficos que dão a *ilusão*
> de compreensão enquanto produzem culpa e sobrecarga. O Atlas faz o oposto.

### 16.1. Princípios de data-viz do Atlas

1. **A frase vem antes do gráfico.** Todo gráfico é precedido por uma **conclusão em linguagem
   natural** (o insight). O gráfico *confirma* a frase, não substitui o entendimento.
2. **Um gráfico responde a uma pergunta.** Nada de gráficos "para explorar". Se não há pergunta,
   não há gráfico.
3. **Minimalismo (Tufte):** máximo *data-ink ratio*. Sem grades pesadas, sem 3D, sem legendas
   redundantes, sem eixos gritantes. Remover tudo que não carrega informação.
4. **Sem placares e sem vermelho de alarme.** Nunca "score do dia", nunca semáforo de culpa.
   Comparações são **contextuais e gentis** ("acima da sua média", não "❌ meta não batida").
5. **Sparklines > gráficos grandes.** Micro-visualizações inline (dentro do `InsightCard`)
   comunicam tendência sem dominar a tela.
6. **Cor com parcimônia:** neutro para contexto, accent/violeta só para o ponto que importa.

### 16.2. Tipos de visualização permitidos (e proibidos)

| Visualização | Uso no Atlas | Veredito |
|---|---|---|
| **Sparkline** | Tendência inline no insight | ✅ Preferido |
| **Barras horizontais suaves** | Comparação de poucas categorias | ✅ Com moderação |
| **Linha simples** | Uma série no tempo (detalhe de evidência) | ✅ Sem grade pesada |
| **Heatmap de calendário** | Padrão sazonal/semanal (dessaturado) | ✅ 🔵 gentil |
| **Grafo de conexões** | Relações entre entidades (calmo, ver §16.4) | ✅ 🟡 |
| **Gauge / velocímetro** | — | ❌ (ansioso, baixa densidade) |
| **Pizza/donut com muitos fatias** | — | ❌ (difícil comparar) |
| **Dashboard multi-widget** | — | ❌ (viola P1/P3) |
| **Números gigantes + %** | — | ❌ (falsa precisão, ansiedade) |

### 16.3. Como comunicar confiança/incerteza sem gerar ansiedade

Insights são inferências — têm incerteza. Comunicá-la **honestamente** é confiança (P2), mas
mostrá-la mal gera ansiedade. Regras:

- **Qualitativo, não percentual:** "confiança alta/média/baixa" + micro-barra, nunca "83,7%".
- **Amostra explícita:** "baseado em 12 noites" — deixa o usuário calibrar sozinho.
- **Linguagem hedge calibrada:** "costuma", "tende a", "com frequência" para correlações;
  reservar afirmações fortes para fatos (eventos), não inferências. Nunca confundir correlação
  com causa (causalidade é 🔴 pesquisa).

### 16.4. Grafo de conexões calmo (🟡)

O grafo é lindo e perigoso: pode virar uma "teia de aranha" ansiosa. Regras de calma:
- Mostrar **vizinhança**, não o grafo inteiro (foco em uma entidade + conexões diretas).
- Nós dessaturados; destaque só no nó focado. Movimento de layout suave e curto.
- Sempre acompanhado de leitura textual ("As 3 pessoas mais ligadas a *Café da manhã* são...").
Ver `19_UI_Screens.md` → Grafo/Conexões.

### 16.5. Empty state como primeiro "gráfico"

Antes de haver dados, o "data-viz" é o **empty state**: uma ilustração calma + a promessa
("Conforme você conectar fontes, os padrões da sua vida aparecerão aqui — sempre com o porquê.").
Isso mantém a calma e comunica o time-to-value (ver `06_User_Journey.md`).

---

## 17. Governança do Design System

- **Fonte única:** `src/theme/tokens.ts` + este documento. Divergência entre código e doc é bug.
- **Definition of Done de componente:** especificado aqui (todos os estados §11) + checklist de
  a11y (§12.7) + revisado em light/dark + i18n-safe.
- **Regra "duas vezes = sistema":** repetiu um valor/padrão → vira token/componente.
- **Mudanças de token** são semânticas e versionadas (mudar `radius.lg` afeta o app inteiro — é
  uma decisão de sistema, não local).
- **Anti-drift:** lint proíbe cores/tamanhos crus fora dos tokens; PRs de UI passam por revisão
  de princípios (§1) — "esta tela gera calma ou ansiedade?".

---

## 18. Roadmap do Design System por fase

| Item | Fase | Nota |
|---|---|---|
| Tokens (cor, tipo, espaço, raio, motion) + Restyle | 🟢 MVP | Base fixa |
| Átomos + moléculas essenciais | 🟢 MVP | Button, Input, Card, etc. |
| `InsightCard`, `TimelineItem`, `EmptyState`, `Sheet` | 🟢 MVP | Coração da UI |
| Dark mode completo | 🟢 MVP | Segue sistema |
| a11y AA (contraste, leitor, dynamic type) | 🟢 MVP | Piso de qualidade |
| Sparklines / barras suaves | 🟢/🔵 | Data-viz calma mínima |
| Voz editorial (serifada) na Revisão Semanal | 🔵 V1 | Tom "carta" |
| Heatmap de calendário gentil | 🔵 V1 | Padrões sazonais |
| Hover/estados de tablet/web | 🔵 V1 | Se web entrar |
| `ConnectionGraph` calmo | 🟡 V2 | Com grafo (Neo4j) |
| RTL + mais locales | 🟡 V2 | i18n ampliada |
| Reavaliar Tamagui (web/perf) | 🟡 V2 | Só se dor real; via ADR |
| Temas personalizáveis pelo usuário | 🟠 Escala | Além do MVP |

---

### Resumo executivo (fechamento)

O Design System do Atlas transforma a tese do produto — **inteligência pessoal privada que dá
compreensão e controle** — em decisões visuais concretas. Seis princípios (calma, confiança,
clareza, insight, foco, consistência) governam tudo. Tokens semânticos em dois níveis (neutros
quentes + accent azul-ardósia + violeta reservado à *inferência*) dão uma fonte única de verdade,
implementada com **Restyle** em React Native/Expo. Componentes seguem Atomic Design, com o
**`InsightCard`** como peça-assinatura da explicabilidade. Acessibilidade WCAG 2.2 AA é piso
inegociável, dark mode e i18n são projetados desde o dia 1, e a **data-viz é deliberadamente
calma** — insight em linguagem natural primeiro, gráfico minimalista depois, nunca um dashboard
ansioso. O resultado pretendido: um app que se sente como um objeto de *quiet luxury* — sério,
sereno e digno de confiança para ver a vida inteira de alguém.
