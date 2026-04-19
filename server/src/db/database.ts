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
try { db.exec("ALTER TABLE pets ADD COLUMN eat_count TEXT NOT NULL DEFAULT '{}'") } catch {}
try { db.exec("ALTER TABLE players ADD COLUMN total_earned INTEGER NOT NULL DEFAULT 0") } catch {}
try { db.exec("ALTER TABLE players ADD COLUMN battle_wins INTEGER NOT NULL DEFAULT 0") } catch {}
try { db.exec("ALTER TABLE players ADD COLUMN items_collected INTEGER NOT NULL DEFAULT 0") } catch {}
try { db.exec("CREATE TABLE IF NOT EXISTS board_posts (id TEXT PRIMARY KEY, scene TEXT NOT NULL, player_id TEXT NOT NULL, player_name TEXT NOT NULL, message TEXT NOT NULL, created_at TEXT NOT NULL)") } catch {}
try { db.exec("CREATE INDEX IF NOT EXISTS idx_board_scene ON board_posts(scene, created_at DESC)") } catch {}
try { db.exec("CREATE TABLE IF NOT EXISTS player_settings (player_id TEXT PRIMARY KEY, bgm_volume REAL NOT NULL DEFAULT 0.03, bgm_muted INTEGER NOT NULL DEFAULT 0, bgm_scene TEXT NOT NULL DEFAULT '{}')") } catch {}
try { db.exec("ALTER TABLE players ADD COLUMN dungeon_floor INTEGER NOT NULL DEFAULT 1") } catch {}
try { db.exec("ALTER TABLE players ADD COLUMN dungeon_wins INTEGER NOT NULL DEFAULT 0") } catch {}

export default db
