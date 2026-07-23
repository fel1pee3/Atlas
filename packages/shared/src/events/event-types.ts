/**
 * Taxonomia canônica de tipos de Evento — `dominio.fato`.
 * Ver docs/11_Event_Model.md §3. Namespacing hierárquico permite filtrar por
 * domínio (ex.: `sleep.*`) e evoluir com campos aditivos.
 *
 * No M0/M1 (🟢 MVP) apenas um subconjunto está ativo; os demais entram por fase.
 */
export const EVENT_TYPES = {
  // --- Entrada manual (fundacional — fallback universal, ver docs/20_MVP.md §2.2) ---
  MANUAL_NOTE: 'manual.note',
  MANUAL_MOOD: 'manual.mood',
  MANUAL_EXPENSE: 'manual.expense',

  // --- Saúde (Health Connect / HealthKit) ---
  SLEEP_RECORDED: 'sleep.recorded',
  ACTIVITY_WORKOUT: 'activity.workout',
  ACTIVITY_STEPS: 'activity.steps',
  HEALTH_METRIC: 'health.metric',

  // --- Localização ---
  LOCATION_VISITED: 'location.visited',

  // --- Calendário ---
  CALENDAR_EVENT: 'calendar.event',

  // --- Sistema (interno) ---
  EVENT_CORRECTED: 'event.corrected',
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

/**
 * Origem de um evento (de onde o dado veio). Ver docs/11 §2.
 */
export const EVENT_SOURCES = {
  MANUAL: 'manual',
  HEALTH_CONNECT: 'health_connect',
  HEALTHKIT: 'healthkit',
  /** Dados sintéticos do conector Demo (Expo Go) — rastreável, nunca fingir nativo. */
  DEMO: 'demo',
  DEVICE_LOCATION: 'device_location',
  GOOGLE_CALENDAR: 'google_calendar',
  APPLE_CALENDAR: 'apple_calendar',
  SYSTEM: 'system',
} as const;

export type EventSource = (typeof EVENT_SOURCES)[keyof typeof EVENT_SOURCES];

/**
 * Domínios de alto nível — usados em agregações/read models e na UI da timeline.
 */
export const EVENT_DOMAINS = {
  MANUAL: 'manual',
  SLEEP: 'sleep',
  ACTIVITY: 'activity',
  HEALTH: 'health',
  LOCATION: 'location',
  CALENDAR: 'calendar',
  SYSTEM: 'event',
} as const;

export type EventDomain = (typeof EVENT_DOMAINS)[keyof typeof EVENT_DOMAINS];

/** Deriva o domínio a partir do `type` (`dominio.fato` → `dominio`). */
export function domainOfType(type: string): string {
  return type.split('.')[0] ?? 'unknown';
}
