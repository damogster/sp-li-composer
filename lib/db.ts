import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'composer.db')

// Ensure parent directory exists
const dbDir = path.dirname(DB_PATH)
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    initSchema(db)
  }
  return db
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS drafts (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL DEFAULT 'Untitled',
      body        TEXT NOT NULL DEFAULT '',
      first_comment TEXT NOT NULL DEFAULT '',
      hashtags    TEXT NOT NULL DEFAULT '[]',
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      hs_id       TEXT UNIQUE,
      name        TEXT NOT NULL,
      org         TEXT NOT NULL DEFAULT '',
      job_title   TEXT NOT NULL DEFAULT '',
      type        TEXT NOT NULL DEFAULT 'person',
      pinned      INTEGER NOT NULL DEFAULT 0,
      source      TEXT NOT NULL DEFAULT 'manual',
      last_seen   TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      key         TEXT PRIMARY KEY,
      value       TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_contacts_pinned ON contacts(pinned);
    CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name);
    CREATE INDEX IF NOT EXISTS idx_drafts_updated ON drafts(updated_at DESC);
  `)

  // Seed default settings
  const setDefault = db.prepare(`
    INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)
  `)
  setDefault.run('default_hashtags', JSON.stringify([
    '#bioenergy', '#biomethane', '#biogas', '#VBN', '#circulareconomy',
    '#renewableenergy', '#sustainableenergy', '#organicwaste',
    '#netzero', '#victoria', '#cleanenergy', '#energytransition'
  ]))
  setDefault.run('hs_cache_ttl_minutes', '60')
}

export type Draft = {
  id: number
  title: string
  body: string
  first_comment: string
  hashtags: string[]
  created_at: string
  updated_at: string
}

export type Contact = {
  id: number
  hs_id: string | null
  name: string
  org: string
  job_title: string
  type: 'person' | 'org'
  pinned: boolean
  source: 'hubspot' | 'manual'
  last_seen: string | null
}
