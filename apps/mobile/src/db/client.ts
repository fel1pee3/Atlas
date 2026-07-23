import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';
import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

/**
 * Conexão com o SQLite local via Drizzle (docs/08 §offline).
 * Lazy-init: NÃO abrir o DB no import do módulo — isso pode derrubar o
 * processo nativo antes do React montar (crash silencioso no Expo Go).
 */
type AtlasDb = ExpoSQLiteDatabase<typeof schema>;

let sqlite: SQLiteDatabase | null = null;
let dbInstance: AtlasDb | null = null;

function getSqlite(): SQLiteDatabase {
  if (!sqlite) {
    sqlite = openDatabaseSync('atlas.db');
  }
  return sqlite;
}

export function getDb(): AtlasDb {
  if (!dbInstance) {
    dbInstance = drizzle(getSqlite(), { schema });
  }
  return dbInstance;
}

export function initLocalDb(): void {
  getSqlite().execSync(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL,
      source TEXT NOT NULL,
      occurred_at TEXT NOT NULL,
      payload TEXT NOT NULL,
      server_id TEXT,
      sync_state TEXT NOT NULL DEFAULT 'pending',
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_events_occurred_at ON events (occurred_at DESC);
    CREATE INDEX IF NOT EXISTS idx_events_sync_state ON events (sync_state);
    CREATE INDEX IF NOT EXISTS idx_events_server_id ON events (server_id);

    CREATE TABLE IF NOT EXISTS sync_meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
}

/** Apaga todo o CMHL local (M7 — delete real / logout limpo). */
export function resetLocalDb(): void {
  getSqlite().execSync(`
    DELETE FROM events;
    DELETE FROM sync_meta;
  `);
}
