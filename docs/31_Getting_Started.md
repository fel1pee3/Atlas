# 31 — Getting Started (Docs → Código)

> **Fase:** 🟢 MVP · **Marco atual:** **M8** (Endurecimento + dogfooding) · **Leia antes:** [`20_MVP.md`](20_MVP.md) §5 / gate D8
> **Objetivo:** colocar o Atlas rodando localmente e viver nele.

---

## 1. Marcos

| Marco | Status |
|---|---|
| M0–M7 | ✅ |
| **M8 Endurecimento + dogfooding** | ✅ (código) · D8 = 30 dias de uso |

### M8 — o que entrou no código

- ✅ Logs estruturados (**pino**) + `x-request-id` / `traceId` em erros
- ✅ Rate limit leve (`@nestjs/throttler`, 120 req/min)
- ✅ `GET /api/account/stats` — North Star (úteis esta semana)
- ✅ Health com `version` + `embeddingProvider`
- ✅ App: streak local de abertura, stats em **Ajustes**, banner de erro de sync, ErrorBoundary
- ✅ Cliente HTTP mais resiliente (JSON/rede)
- ⚪ Sentry: env `SENTRY_DSN` reservada (SDK ainda não acoplado — logs bastam no dogfood local)

---

## 2. Checklist de dogfooding (gate D8)

Faça isto **todo dia** por ~30 dias (sem obrigação formal — o teste é *querer* abrir):

1. Abrir o Atlas (conta streak em Ajustes)  
2. Registrar humor e/ou gasto / nota  
3. Pull Insights → marcar **útil** o que fizer sentido (North Star ≥ 1/semana)  
4. Busca semântica (com Gemini ligado) em alguma dúvida real  
5. Se algo falhar: anotar + corrigir (isso também é M8)

**Meta North Star:** ≥ 1 insight marcado útil por semana.  
**Meta D8:** streak de abertura ≥ 30 dias (Ajustes → Dogfooding).

---

## 3. Como validar M8 técnico

```bash
npm run infra:up
npm run dev:api
# Expo: npx expo start
```

- Logs da API em JSON (método, path, status, ms, requestId)  
- `GET /api/health` → `version: 0.8.0-m8`  
- Ajustes → ver streak + “Úteis esta semana”  
- Desligar API → Hoje mostra aviso de sync (timeline local segue)

---

## 4. Gemini (M6) — lembrete

```env
EMBEDDING_PROVIDER=gemini
GEMINI_API_KEY=sua_chave
LOG_LEVEL=info
```

---

## 5. Depois do M8

O MVP “fecha” com o **uso**, não com mais features. Quando D8 estiver sólido:

- V1: conectores nativos reais, LLM só para redigir (opt-in), polish de produto  

---

### Resumo
M0–M7 entregaram o loop. **M8 endurece e mede.** O teste real é você abrir o Atlas amanhã de manhã.
