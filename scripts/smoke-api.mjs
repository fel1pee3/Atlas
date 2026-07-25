/**
 * Smoke E2E da API Atlas (produção Railway + Supabase).
 * Cria usuário temporário, exercita fluxos e apaga a conta no final.
 *
 * Uso: node scripts/smoke-api.mjs
 */
const BASE =
  process.env.ATLAS_API_BASE?.replace(/\/$/, '') ||
  'https://atlasapi-production-e625.up.railway.app/api';

const email = `smoke.${Date.now()}@atlas.test`;
const password = 'SmokeTest!23456';

const results = [];

function ok(name, detail = '') {
  results.push({ name, pass: true, detail });
  console.log(`  PASS  ${name}${detail ? ` — ${detail}` : ''}`);
}

function fail(name, detail) {
  results.push({ name, pass: false, detail: String(detail) });
  console.error(`  FAIL  ${name} — ${detail}`);
}

async function req(method, path, { token, body, expectStatus } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (expectStatus != null && res.status !== expectStatus) {
    const err = new Error(
      `HTTP ${res.status} (esperado ${expectStatus}): ${typeof data === 'string' ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200)}`,
    );
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return { status: res.status, data };
}

async function main() {
  console.log(`\nAtlas smoke → ${BASE}`);
  console.log(`Usuário temporário: ${email}\n`);

  let access;
  let refresh;

  // 1) Health
  try {
    const { data } = await req('GET', '/health', { expectStatus: 200 });
    if (data?.status !== 'ok') throw new Error(JSON.stringify(data));
    ok('GET /health', `v=${data.version} emb=${data.embeddingProvider}`);
  } catch (e) {
    fail('GET /health', e.message);
  }

  try {
    const { data } = await req('GET', '/health/ready', { expectStatus: 200 });
    if (data?.db !== 'up') throw new Error(JSON.stringify(data));
    ok('GET /health/ready', 'db=up');
  } catch (e) {
    fail('GET /health/ready', e.message);
  }

  // 2) Register
  try {
    const { data } = await req('POST', '/auth/register', {
      body: { email, password },
      expectStatus: 201,
    });
    access = data.accessToken;
    refresh = data.refreshToken;
    if (!access || !refresh) throw new Error('tokens ausentes');
    ok('POST /auth/register', 'tokens ok');
  } catch (e) {
    fail('POST /auth/register', e.message);
    printSummary();
    process.exit(1);
  }

  // 3) Login errado
  try {
    await req('POST', '/auth/login', {
      body: { email, password: 'senha-errada-xx' },
      expectStatus: 401,
    });
    ok('POST /auth/login (credencial inválida → 401)');
  } catch (e) {
    fail('POST /auth/login (401)', e.message);
  }

  // 4) Login ok
  try {
    const { data } = await req('POST', '/auth/login', {
      body: { email, password },
      expectStatus: 200,
    });
    access = data.accessToken;
    refresh = data.refreshToken;
    ok('POST /auth/login');
  } catch (e) {
    fail('POST /auth/login', e.message);
  }

  // 5) Eventos manuais
  const now = new Date().toISOString();
  try {
    const { data } = await req('POST', '/events', {
      token: access,
      body: {
        type: 'manual.mood',
        source: 'manual',
        externalId: `smoke-mood-${Date.now()}`,
        occurredAt: now,
        payload: { score: 4, note: 'smoke test' },
      },
      expectStatus: 201,
    });
    if (!data?.event?.id) throw new Error('sem event.id');
    ok('POST /events (manual.mood)', data.event.id.slice(0, 8));
  } catch (e) {
    fail('POST /events (manual.mood)', e.message);
  }

  try {
    const { data } = await req('POST', '/events', {
      token: access,
      body: {
        type: 'manual.expense',
        source: 'manual',
        externalId: `smoke-exp-${Date.now()}`,
        occurredAt: now,
        payload: { amount: 42.5, currency: 'BRL', category: 'teste' },
      },
      expectStatus: 201,
    });
    ok('POST /events (manual.expense)', String(data?.event?.id ?? '').slice(0, 8));
  } catch (e) {
    fail('POST /events (manual.expense)', e.message);
  }

  try {
    const { data } = await req('POST', '/events/batch', {
      token: access,
      body: {
        events: [
          {
            type: 'sleep.recorded',
            source: 'demo',
            externalId: `smoke-sleep-${Date.now()}`,
            occurredAt: now,
            payload: { durationMin: 420 },
          },
          {
            type: 'activity.steps',
            source: 'demo',
            externalId: `smoke-steps-${Date.now()}`,
            occurredAt: now,
            payload: { steps: 6500 },
          },
        ],
      },
      expectStatus: 201,
    });
    const n = data?.items?.length ?? 0;
    if (n < 2) throw new Error(`items=${n}`);
    ok('POST /events/batch', `${n} items`);
  } catch (e) {
    fail('POST /events/batch', e.message);
  }

  // 6) Timeline / daily / sync
  try {
    const { data } = await req('GET', '/events/timeline?limit=20', {
      token: access,
      expectStatus: 200,
    });
    const n = data?.items?.length ?? 0;
    if (n < 1) throw new Error('timeline vazia');
    ok('GET /events/timeline', `${n} itens`);
  } catch (e) {
    fail('GET /events/timeline', e.message);
  }

  try {
    const { data } = await req('GET', '/events/daily', {
      token: access,
      expectStatus: 200,
    });
    if (!data?.day) throw new Error(JSON.stringify(data));
    const bits = [
      data.mood ? 'mood' : null,
      data.expense ? 'expense' : null,
      data.sleep ? 'sleep' : null,
      data.activity ? 'activity' : null,
    ].filter(Boolean);
    ok('GET /events/daily', `${data.day} [${bits.join(',') || 'vazio'}]`);
  } catch (e) {
    fail('GET /events/daily', e.message);
  }

  try {
    const { data } = await req('GET', '/events/sync?limit=50', {
      token: access,
      expectStatus: 200,
    });
    ok('GET /events/sync', `items=${data?.items?.length ?? 0}`);
  } catch (e) {
    fail('GET /events/sync', e.message);
  }

  // 7) Insights
  try {
    const { data } = await req('POST', '/insights/generate', {
      token: access,
      expectStatus: 201,
    });
    ok('POST /insights/generate', `generated=${data?.generated ?? '?'}`);
  } catch (e) {
    fail('POST /insights/generate', e.message);
  }

  try {
    const { data } = await req('GET', '/insights', {
      token: access,
      expectStatus: 200,
    });
    ok('GET /insights', `items=${data?.items?.length ?? 0}`);
  } catch (e) {
    fail('GET /insights', e.message);
  }

  // 8) Search keyword (sempre disponível)
  try {
    const { data } = await req('GET', '/search?q=smoke&mode=keyword&limit=10', {
      token: access,
      expectStatus: 200,
    });
    ok('GET /search?mode=keyword', `items=${data?.items?.length ?? 0}`);
  } catch (e) {
    fail('GET /search?mode=keyword', e.message);
  }

  // 9) Search semantic (pode 503 se provider none — tratar)
  try {
    const res = await req('GET', '/search?q=humor&mode=semantic&limit=5', {
      token: access,
    });
    if (res.status === 200) {
      ok('GET /search?mode=semantic', `items=${res.data?.items?.length ?? 0}`);
    } else if (res.status === 503) {
      ok('GET /search?mode=semantic', '503 provider off (aceitável)');
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (e) {
    fail('GET /search?mode=semantic', e.message);
  }

  // 10) Account stats + export
  try {
    const { data } = await req('GET', '/account/stats', {
      token: access,
      expectStatus: 200,
    });
    ok(
      'GET /account/stats',
      `events=${data?.eventsTotal} usefulWeek=${data?.usefulThisWeek}`,
    );
  } catch (e) {
    fail('GET /account/stats', e.message);
  }

  try {
    const { data } = await req('GET', '/account/export', {
      token: access,
      expectStatus: 200,
    });
    if (data?.format !== 'atlas.cmhl.export.v1') throw new Error('format inválido');
    ok('GET /account/export', `events=${data?.counts?.events ?? 0}`);
  } catch (e) {
    fail('GET /account/export', e.message);
  }

  // 11) Refresh + logout
  try {
    const { data } = await req('POST', '/auth/refresh', {
      body: { refreshToken: refresh },
      expectStatus: 200,
    });
    access = data.accessToken;
    refresh = data.refreshToken;
    ok('POST /auth/refresh', 'rotação ok');
  } catch (e) {
    fail('POST /auth/refresh', e.message);
  }

  try {
    await req('POST', '/auth/logout', {
      body: { refreshToken: refresh },
      expectStatus: 204,
    });
    ok('POST /auth/logout');
  } catch (e) {
    fail('POST /auth/logout', e.message);
  }

  // Re-login para poder apagar
  try {
    const { data } = await req('POST', '/auth/login', {
      body: { email, password },
      expectStatus: 200,
    });
    access = data.accessToken;
    ok('POST /auth/login (após logout)');
  } catch (e) {
    fail('POST /auth/login (após logout)', e.message);
  }

  // 12) Delete account
  try {
    const { data } = await req('DELETE', '/account', {
      token: access,
      expectStatus: 200,
    });
    if (!data?.deletedAt) throw new Error(JSON.stringify(data));
    ok('DELETE /account', data.deletedAt);
  } catch (e) {
    fail('DELETE /account', e.message);
  }

  // 13) Login após delete deve falhar
  try {
    await req('POST', '/auth/login', {
      body: { email, password },
      expectStatus: 401,
    });
    ok('POST /auth/login após delete → 401');
  } catch (e) {
    fail('POST /auth/login após delete', e.message);
  }

  printSummary();
}

function printSummary() {
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  console.log(`\n======== RESUMO SMOKE ========`);
  console.log(`PASS: ${passed}`);
  console.log(`FAIL: ${failed}`);
  console.log(`TOTAL: ${results.length}`);
  if (failed > 0) {
    console.log('\nFalhas:');
    for (const r of results.filter((x) => !x.pass)) {
      console.log(` - ${r.name}: ${r.detail}`);
    }
    process.exitCode = 1;
  } else {
    console.log('\nTodos os checks HTTP passaram.');
  }
}

main().catch((e) => {
  console.error('Smoke abortou:', e);
  process.exit(1);
});
