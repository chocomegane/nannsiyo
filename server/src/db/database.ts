import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { join } from 'path'

const DB_PATH = process.env.DATABASE_URL ?? join(__dirname, '../../data/game.db')

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8')
db.exec(schema)

// マイグレーション: 既存DBへのカラム追加
try { db.exec("ALTER TABLE pets ADD COLUMN unlocked_skills TEXT NOT NULL DEFAULT '[]'") } catch {}
try { db.exec("ALTER TABLE players ADD COLUMN password_hash TEXT NOT NULL DEFAULT ''") } catch {}
try { db.exec("ALTER TABLE players ADD COLUMN salt TEXT NOT NULL DEFAULT ''") } catch {}

export default db
