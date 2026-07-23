# 31 — Getting Started (Docs → Código)

> **Fase:** 🟢 MVP · **Marco atual:** **M5** (Insight cross-domain — prova da tese) · **Leia antes:** [`20_MVP.md`](20_MVP.md) §2.5 / §5
> **Objetivo:** colocar o Atlas rodando localmente e explicar a estrutura do código.

---

## 1. Marcos

| Marco | Status |
|---|---|
| M0–M4 | ✅ |
| **M5 Insight cross-domain** | ✅ |

### M5 — o que entrou

Insights-alvo do [`20_MVP.md`](20_MVP.md) §2.5, por **estatística** (sem LLM), com evidências:

1. **Sono após treino tarde** — médias condicionais (Health × Health no tempo)
2. **Gastos em dias com >4 reuniões** — Calendar × gasto
3. **Humor em dias >10h fora de casa** — Location × humor

- ✅ `cross-domain-engine.ts` + kinds `cross.*` em `@atlas/shared`
- ✅ Pipeline de geração carrega todos os tipos necessários
- ✅ Demos semeiam correlações sintéticas (rastreáveis com `source=demo`) para dogfooding
- ✅ UI: badge **cross-domain**, borda destacada, aviso “associação ≠ causa”

---

## 2. Como validar a prova

```bash
npm run dev:api
# Expo:
# 1) Saúde → Conectar Demo (re-sync se já tinha dados antigos de sono)
# 2) Fontes → Demo localização + Demo agenda
# 3) Insights → pull to refresh
```

Você deve ver cards `cross-domain` com evidências clicáveis.

> Se os dados Demo antigos (pré-M5) ainda estiverem no SQLite sem treinos/gastos/humor demo,
> desative/reative os conectores ou limpe o app data para reimportar.

---

## 3. Próximos passos (pós-prova)

Pelo roadmap [`20`](20_MVP.md) / [`21`](21_Roadmap.md), depois do M5 tipicamente:

- **Privacidade MVP:** export/delete total (ainda 🟢 no escopo do MVP)
- **Busca semântica (pgvector)** — se ainda não fechada
- **V1:** conectores nativos reais, LLM só para redigir, etc.

---

### Resumo
O Atlas agora **cruza domínios** com estatística explicável. Isso é a prova da tese do produto.
