import { z } from 'zod';
import { EVENT_TYPES } from './event-types';

/** Conjunto de tipos canônicos aceitos na ingestão (docs/11 §3). */
const KNOWN_EVENT_TYPES = Object.values(EVENT_TYPES);

/** Campo `type` validado contra a taxonomia canônica (tipo desconhecido → erro de entrada). */
const EventTypeField = z
  .string()
  .refine((t) => (KNOWN_EVENT_TYPES as readonly string[]).includes(t), {
    message: `Tipo de evento desconhecido. Use um de: ${KNOWN_EVENT_TYPES.join(', ')}`,
  });

/**
 * Envelope canônico do Evento — a unidade atômica do Atlas.
 * Ver docs/11_Event_Model.md §2 (anatomia) e §2.1 (bitemporalidade).
 *
 * Distinção crucial:
 *  - `occurredAt`  = quando o FATO aconteceu no mundo real (para timeline/correlações).
 *  - `ingestedAt`  = quando o Atlas REGISTROU o fato (para sync/auditoria).
 */
export const EventEnvelopeSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.string().min(3),
  source: z.string().min(2),
  externalId: z.string().max(200).nullable().optional(),
  occurredAt: z.string().datetime(),
  ingestedAt: z.string().datetime(),
  payload: z.record(z.string(), z.unknown()),
});

export type EventEnvelope = z.infer<typeof EventEnvelopeSchema>;

/**
 * Comando de ingestão vindo do cliente (ainda sem id/ingestedAt, atribuídos pelo servidor).
 * `externalId` habilita idempotência via (userId, source, externalId) — docs/11 §8.
 */
export const IngestEventSchema = z.object({
  type: EventTypeField,
  source: z.string().min(2),
  externalId: z.string().max(200).nullable().optional(),
  occurredAt: z.string().datetime(),
  payload: z.record(z.string(), z.unknown()),
});

export type IngestEventInput = z.infer<typeof IngestEventSchema>;

/**
 * Lote de ingestão (docs/17 §4.2 `POST /events:batch`).
 * Usado no sync push e na ingestão retroativa do conector de saúde (M2).
 */
export const IngestEventBatchSchema = z.object({
  events: z.array(IngestEventSchema).min(1).max(200),
});

export type IngestEventBatchInput = z.infer<typeof IngestEventBatchSchema>;
