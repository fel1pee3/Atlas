import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

/**
 * Espelho LOCAL dos eventos (offline-first, docs/08_Mobile_Architecture.md §offline).
 * O device é a fonte primária; o backend é réplica/serviço (local-first, ADR-0010).
 *
 * `syncState` habilita o sync engine (M-posterior):
 *   'pending'  → criado offline, ainda não enviado
 *   'synced'   → confirmado pelo servidor
 */
export const events = sqliteTable('events', {
  id: text('id').primaryKey(), // uuid gerado no device
  type: text('type').notNull(),
  source: text('source').notNull(),
  occurredAt: text('occurred_at').notNull(), // ISO 8601
  payload: text('payload').notNull(), // JSON serializado
  serverId: text('server_id'), // id atribuído pelo backend após sync
  syncState: text('sync_state').notNull().default('pending'),
  createdAt: integer('created_at').notNull(), // epoch ms
});

/**
 * Metadados de sync (docs/08 §7.5 — cursor).
 * MVP: SQLite em vez de MMKV (ainda sem MMKV); chave/valor simples.
 */
export const syncMeta = sqliteTable('sync_meta', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export type LocalEvent = typeof events.$inferSelect;
export type NewLocalEvent = typeof events.$inferInsert;
