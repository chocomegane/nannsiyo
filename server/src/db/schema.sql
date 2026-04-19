CREATE TABLE IF NOT EXISTS players (
  id            TEXT    PRIMARY KEY,
  name          TEXT    NOT NULL UNIQUE,
  money         INTEGER NOT NULL DEFAULT 0,
  password_hash TEXT    NOT NULL DEFAULT '',
  salt          TEXT    NOT NULL DEFAULT '',
  created_at    TEXT    NOT NULL,
  updated_at    TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS pets (
  id              TEXT    PRIMARY KEY,
  player_id       TEXT    NOT NULL REFERENCES players(id),
  name            TEXT    NOT NULL,
  species         TEXT    NOT NULL,
  level           INTEGER NOT NULL DEFAULT 1,
  exp             INTEGER NOT NULL DEFAULT 0,
  happiness       INTEGER NOT NULL DEFAULT 80,
  hunger          INTEGER NOT NULL DEFAULT 60,
  unlocked_skills TEXT    NOT NULL DEFAULT '[]',
  created_at      TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS furniture_inventory (
  id           TEXT    PRIMARY KEY,
  player_id    TEXT    NOT NULL REFERENCES players(id),
  furniture_id TEXT    NOT NULL,
  name         TEXT    NOT NULL,
  placed       INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS food_inventory (
  id        TEXT    PRIMARY KEY,
  player_id TEXT    NOT NULL REFERENCES players(id),
  food_id   TEXT    NOT NULL,
  name      TEXT    NOT NULL,
  price     INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory (
  id          TEXT    PRIMARY KEY,
  player_id   TEXT    NOT NULL REFERENCES players(id),
  item_id     TEXT    NOT NULL,
  name        TEXT    NOT NULL,
  sell_price  INTEGER NOT NULL,
  obtained_at TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS sell_history (
  id           TEXT    PRIMARY KEY,
  player_id    TEXT    NOT NULL REFERENCES players(id),
  total_amount INTEGER NOT NULL,
  item_count   INTEGER NOT NULL,
  sold_at      TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS guilds (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  leader_id  TEXT NOT NULL REFERENCES players(id),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS guild_members (
  guild_id  TEXT NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL REFERENCES players(id),
  joined_at TEXT NOT NULL,
  PRIMARY KEY (guild_id, player_id)
);

CREATE TABLE IF NOT EXISTS friends (
  id         TEXT PRIMARY KEY,
  player_id  TEXT NOT NULL REFERENCES players(id),
  friend_id  TEXT NOT NULL REFERENCES players(id),
  status     TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  UNIQUE(player_id, friend_id)
);

CREATE INDEX IF NOT EXISTS idx_pets_player          ON pets(player_id);
CREATE INDEX IF NOT EXISTS idx_inventory_player     ON inventory(player_id);
CREATE INDEX IF NOT EXISTS idx_sell_history_player  ON sell_history(player_id);
CREATE INDEX IF NOT EXISTS idx_players_money        ON players(money DESC);
CREATE INDEX IF NOT EXISTS idx_friends_player       ON friends(player_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend       ON friends(friend_id);

CREATE TABLE IF NOT EXISTS board_posts (
  id         TEXT    PRIMARY KEY,
  scene      TEXT    NOT NULL,
  player_id  TEXT    NOT NULL REFERENCES players(id),
  player_name TEXT   NOT NULL,
  message    TEXT    NOT NULL,
  created_at TEXT    NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_board_scene ON board_posts(scene, created_at DESC);

CREATE TABLE IF NOT EXISTS player_settings (
  player_id   TEXT PRIMARY KEY REFERENCES players(id),
  bgm_volume  REAL NOT NULL DEFAULT 0.03,
  bgm_muted   INTEGER NOT NULL DEFAULT 0,
  bgm_scene   TEXT NOT NULL DEFAULT '{}'
);
