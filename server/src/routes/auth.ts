import { Router } from 'express'
import { createHash, randomBytes } from 'crypto'
import db from '../db/database'

const router = Router()

function hashPassword(password: string, salt: string): string {
  return createHash('sha256').update(salt + password).digest('hex')
}

router.post('/register', (req, res) => {
  const { name, password } = req.body as { name: string; password: string }
  if (!name || !password) { res.status(400).json({ error: 'name と password は必須です' }); return }
  if (name.length > 20) { res.status(400).json({ error: 'name は20文字以内にしてください' }); return }

  const existing = db.prepare('SELECT id FROM players WHERE name = ?').get(name)
  if (existing) { res.status(409).json({ error: 'そのプレイヤー名は使われています' }); return }

  const id = randomBytes(16).toString('hex')
  const salt = randomBytes(8).toString('hex')
  const passwordHash = hashPassword(password, salt)
  const now = new Date().toISOString()
  db.prepare('INSERT INTO players (id, name, money, password_hash, salt, created_at, updated_at) VALUES (?, ?, 0, ?, ?, ?, ?)')
    .run(id, name, passwordHash, salt, now, now)

  res.json({ id, name, money: 0 })
})

router.post('/login', (req, res) => {
  const { name, password } = req.body as { name: string; password: string }
  if (!name || !password) { res.status(400).json({ error: 'name と password は必須です' }); return }

  const player = db.prepare('SELECT * FROM players WHERE name = ?').get(name) as
    { id: string; name: string; money: number; password_hash: string; salt: string } | undefined
  if (!player) { res.status(401).json({ error: 'プレイヤー名またはパスワードが違います' }); return }

  const hash = hashPassword(password, player.salt)
  if (hash !== player.password_hash) { res.status(401).json({ error: 'プレイヤー名またはパスワードが違います' }); return }

  res.json({ id: player.id, name: player.name, money: player.money })
})

export default router
