# 31 — Getting Started (Docs → Código)

> **Fase:** 🟢 MVP · **Marco atual:** **M7** (Privacidade export/delete + Onboarding) · **Leia antes:** [`20_MVP.md`](20_MVP.md) §2.6–2.7 · [`15_Privacy_Architecture.md`](15_Privacy_Architecture.md)
> **Objetivo:** colocar o Atlas rodando localmente e explicar a estrutura do código.

---

## 1. Marcos

| Marco | Status |
|---|---|
| M0–M6 | ✅ |
| **M7 Privacidade + Onboarding** | ✅ |

### M7 — o que entrou

- ✅ `GET /api/account/export` — JSON do CMHL (eventos, insights, índice de embeddings)
- ✅ `DELETE /api/account` — hard delete (cascade Prisma: eventos, RMs, insights, embeddings, tokens)
- ✅ App: **Ajustes** — export (Share JSON), apagar conta (digite `APAGAR`), sair
- ✅ `resetLocalDb()` — limpa SQLite no device
- ✅ Onboarding (&lt; 5 min): boas-vindas → Demo Saúde → primeiro insight → Hoje
- ✅ Gate: autenticado sem `onboarding.completed` → `/(onboarding)`

---

## 2. Como validar privacidade

```bash
npm run dev:api
# Expo: conta → Ajustes
```

1. **Exportar** → compartilha JSON com seus eventos/insights  
2. Digite `APAGAR` → **Apagar conta** → volta ao login; tokens inválidos; Postgres sem o user  
3. Nova conta → onboarding aparece de novo  

---

## 3. Como validar onboarding

1. Registrar usuário novo (ou apagar conta e criar outra)  
2. Boas-vindas → **Começar**  
3. **Conectar Demo Saúde** → importa ~30 dias  
4. Ver primeiro insight → **Ir para o Atlas**  
5. (Quem já dogfooda) pode **Pular** na primeira tela  

---

## 4. Busca semântica (M6) — lembrete

```env
EMBEDDING_PROVIDER=gemini
GEMINI_API_KEY=sua_chave
```

Hoje → Busca → Reindexar se necessário.

---

## 5. Próximos passos

- **M8 — Endurecimento + dogfooding sério** (observabilidade, correções de uso real)

---

### Resumo
O Atlas agora fecha a promessa de confiança: **exportar / apagar de verdade** e **primeiro insight em minutos**.
