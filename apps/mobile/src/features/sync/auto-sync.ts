import { AppState, type AppStateStatus, type NativeEventSubscription } from 'react-native';
import { generateInsights } from '../insights/insights.service';
import { syncNow } from './sync.service';

/** Evita martelar conectores/API se a home e o AppState disparam juntos. */
const MIN_SYNC_GAP_MS = 90_000;
/** Enquanto o app está aberto, relê saúde/agenda/local periodicamente. */
const FOREGROUND_INTERVAL_MS = 5 * 60_000;
/** Insights são mais caros — no máx. a cada 10 min, ou logo após import novo. */
const MIN_INSIGHTS_GAP_MS = 10 * 60_000;

let lastSyncAt = 0;
let lastInsightsAt = 0;
let intervalId: ReturnType<typeof setInterval> | null = null;
let appSub: NativeEventSubscription | null = null;
let started = false;

/**
 * Ciclo automático: saúde + localização + agenda + push/pull,
 * e regenera insights quando entra dado novo (ou periodicamente).
 */
export async function runAutoSync(
  reason: 'foreground' | 'interval' | 'start',
): Promise<void> {
  const now = Date.now();
  if (now - lastSyncAt < MIN_SYNC_GAP_MS) return;
  lastSyncAt = now;

  let result: Awaited<ReturnType<typeof syncNow>>;
  try {
    result = await syncNow();
  } catch {
    return;
  }

  const imported =
    result.healthImported + result.locationImported + result.calendarImported + result.pulled;

  const insightsDue =
    imported > 0 || now - lastInsightsAt >= MIN_INSIGHTS_GAP_MS || reason === 'start';

  if (!insightsDue) return;

  try {
    await generateInsights();
    lastInsightsAt = Date.now();
  } catch {
    /* rede / API — próximo ciclo tenta de novo */
  }
}

function onAppState(next: AppStateStatus) {
  if (next === 'active') {
    void runAutoSync('foreground');
  }
}

/** Liga listeners (AppState + intervalo). Idempotente. */
export function startAutoSync(): void {
  if (started) {
    void runAutoSync('start');
    return;
  }
  started = true;
  void runAutoSync('start');

  appSub = AppState.addEventListener('change', onAppState);
  intervalId = setInterval(() => {
    if (AppState.currentState === 'active') {
      void runAutoSync('interval');
    }
  }, FOREGROUND_INTERVAL_MS);
}

/** Desliga ao sair da conta. */
export function stopAutoSync(): void {
  appSub?.remove();
  appSub = null;
  if (intervalId != null) {
    clearInterval(intervalId);
    intervalId = null;
  }
  started = false;
  lastSyncAt = 0;
  lastInsightsAt = 0;
}
