import { z } from 'zod';
import { EVENT_TYPES } from './event-types';

/**
 * Schemas de payload por tipo de evento (schema-on-write na aplicação).
 * O banco guarda `payload` como JSONB (flexível); a validação de forma vive aqui.
 * Ver docs/10_Database_Design.md §4.3 e docs/11_Event_Model.md §3.
 */

export const ManualNotePayload = z.object({
  text: z.string().min(1).max(10_000),
  tags: z.array(z.string()).optional(),
});

export const ManualMoodPayload = z.object({
  /** Escala 1..5 (1 = muito ruim, 5 = muito bom). */
  score: z.number().int().min(1).max(5),
  note: z.string().max(2_000).optional(),
});

export const ManualExpensePayload = z.object({
  amount: z.number().nonnegative(),
  currency: z.string().length(3).default('BRL'),
  category: z.string().max(80).optional(),
  merchant: z.string().max(160).optional(),
  note: z.string().max(2_000).optional(),
});

export const SleepRecordedPayload = z.object({
  durationMin: z.number().int().nonnegative(),
  efficiency: z.number().min(0).max(1).optional(),
  deepMin: z.number().int().nonnegative().optional(),
  remMin: z.number().int().nonnegative().optional(),
});

export const ActivityWorkoutPayload = z.object({
  kind: z.string().max(80),
  durationMin: z.number().int().nonnegative(),
  calories: z.number().nonnegative().optional(),
});

export const ActivityStepsPayload = z.object({
  steps: z.number().int().nonnegative(),
});

export const HealthMetricPayload = z.object({
  metric: z.string().max(80),
  value: z.number(),
  unit: z.string().max(40).optional(),
});

export const LocationVisitedPayload = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  label: z.string().max(160).optional(),
  arrivedAt: z.string().datetime().optional(),
  leftAt: z.string().datetime().optional(),
});

export const CalendarEventPayload = z.object({
  title: z.string().max(300),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional(),
  location: z.string().max(300).optional(),
  attendees: z.number().int().nonnegative().optional(),
});

export const EventCorrectedPayload = z.object({
  correctsEventId: z.string().uuid(),
  reason: z.string().max(500).optional(),
});

/** Mapa type → schema. Fonte única para validar/normalizar payloads. */
export const PAYLOAD_SCHEMAS = {
  [EVENT_TYPES.MANUAL_NOTE]: ManualNotePayload,
  [EVENT_TYPES.MANUAL_MOOD]: ManualMoodPayload,
  [EVENT_TYPES.MANUAL_EXPENSE]: ManualExpensePayload,
  [EVENT_TYPES.SLEEP_RECORDED]: SleepRecordedPayload,
  [EVENT_TYPES.ACTIVITY_WORKOUT]: ActivityWorkoutPayload,
  [EVENT_TYPES.ACTIVITY_STEPS]: ActivityStepsPayload,
  [EVENT_TYPES.HEALTH_METRIC]: HealthMetricPayload,
  [EVENT_TYPES.LOCATION_VISITED]: LocationVisitedPayload,
  [EVENT_TYPES.CALENDAR_EVENT]: CalendarEventPayload,
  [EVENT_TYPES.EVENT_CORRECTED]: EventCorrectedPayload,
} as const;

export type KnownEventType = keyof typeof PAYLOAD_SCHEMAS;

/**
 * Valida um payload contra o schema do seu tipo.
 * Retorna os dados normalizados ou lança ZodError (traduzido na borda HTTP).
 */
export function validatePayload(type: string, payload: unknown): Record<string, unknown> {
  const schema = PAYLOAD_SCHEMAS[type as KnownEventType];
  if (!schema) {
    throw new Error(`Tipo de evento desconhecido: "${type}"`);
  }
  return schema.parse(payload) as Record<string, unknown>;
}

export function isKnownEventType(type: string): type is KnownEventType {
  return type in PAYLOAD_SCHEMAS;
}
