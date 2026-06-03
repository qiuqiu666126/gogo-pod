import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const dbPath =
    process.env.DATABASE_PATH ??
    path.join(__dirname, "..", "data", "pod.db");
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  migrate(db);
  return db;
}

function migrate(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS feature_configs (
      feature_type TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      model_id TEXT NOT NULL,
      provider TEXT NOT NULL DEFAULT 'custom',
      api_base_url TEXT NOT NULL DEFAULT '',
      api_key TEXT NOT NULL DEFAULT '',
      system_prompt TEXT NOT NULL DEFAULT '',
      user_prompt_template TEXT NOT NULL DEFAULT '',
      default_params TEXT NOT NULL DEFAULT '{}',
      notes TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS feature_presets (
      id TEXT PRIMARY KEY,
      feature_type TEXT NOT NULL,
      preset_key TEXT NOT NULL,
      label TEXT NOT NULL,
      scene TEXT NOT NULL DEFAULT '',
      param_key TEXT NOT NULL DEFAULT '',
      prompt_template TEXT NOT NULL DEFAULT '',
      extra_params TEXT NOT NULL DEFAULT '{}',
      sort_order INTEGER NOT NULL DEFAULT 0,
      enabled INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL,
      UNIQUE(feature_type, preset_key, scene)
    );

    CREATE INDEX IF NOT EXISTS idx_presets_feature ON feature_presets(feature_type);

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      feature_type TEXT NOT NULL,
      model_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      batch TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      params_json TEXT NOT NULL DEFAULT '[]',
      asset_ids_json TEXT NOT NULL DEFAULT '[]',
      source_urls_json TEXT NOT NULL DEFAULT '[]',
      result_json TEXT NOT NULL DEFAULT '[]',
      error_message TEXT NOT NULL DEFAULT '',
      remark TEXT NOT NULL DEFAULT '',
      operator TEXT NOT NULL DEFAULT 'system',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_feature ON tasks(feature_type);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  `);
}

export function nowIso() {
  return new Date().toISOString();
}

export function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
