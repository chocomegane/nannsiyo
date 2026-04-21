import { Router } from 'express'
import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import db from '../db/database'

const router = Router()

const BCRYPT_ROUNDS = 10

router.post('/register', async (req, res) => {
  const { name, password } = req.body as { name: string; password: string }
  if (!name || !password) { res.status(400).json({ error: 'name と password は必須です' }); return }
  if (name.length > 20) { res.status(400).json({ error: 'name は20文字以内にしてください' }); return }
  if (password.length < 8) { res.status(400).json({ error: 'パスワードは8文字以上にしてください' }); return }

  const existing = db.prepare('SELECT id FROM players WHERE name = ?').get(name)
  if (existing) { res.status(409).json({ error: 'そのプレイヤー名は使われています' }); return }

  const id = randomBytes(16).toString('hex')
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
  const now = new Date().toISOString()
  db.prepare('INSERT INTO players (id, name, money, password_hash, salt, created_at, updated_at) VALUES (?, ?, 0, ?, ?, ?, ?)')
    .run(id, name, passwordHash, '', now, now)

  res.json({ id, name, money: 0 })
})

router.post('/login', async (req, res) => {
  const { name, password } = req.body as { name: string; password: string }
  if (!name || !password) { res.status(400).json({ error: 'name と password は必須です' }); return }

  const player = db.prepare('SELECT * FROM players WHERE name = ?').get(name) as
    { id: string; name: string; money: number; password_hash: string; salt: string } | undefined
  if (!player) { res.status(401).json({ error: 'プレイヤー名またはパスワードが違います' }); return }

  // bcryptハッシュかどうか判定（移行期間対応）
  const isBcrypt = player.password_hash.startsWith('$2')
  let valid: boolean
  if (isBcrypt) {
    valid = await bcrypt.compare(password, player.password_hash)
  } else {
    // 旧SHA-256ユーザー: 検証後bcryptへ移行
    const { createHash } = await import('crypto')
    const oldHash = createHash('sha256').update(player.salt + password).digest('hex')
    valid = oldHash === player.password_hash
    if (valid) {
      const newHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
      db.prepare('UPDATE players SET password_hash = ?, salt = ? WHERE id = ?').run(newHash, '', player.id)
    }
  }

  if (!valid) { res.status(401).json({ error: 'プレイヤー名またはパスワードが違います' }); return }

  res.json({ id: player.id, name: player.name, money: player.money })
})

router.patch('/password', async (req, res) => {
  const { playerId, currentPassword, newPassword } = req.body as { playerId: string; currentPassword: string; newPassword: string }
  if (!playerId || !currentPassword || !newPassword) { res.status(400).json({ error: '入力が不足しています' }); return }
  if (newPassword.length < 8) { res.status(400).json({ error: 'パスワードは8文字以上にしてください' }); return }

  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId) as
    { id: string; password_hash: string; salt: string } | undefined
  if (!player) { res.status(404).json({ error: 'プレイヤーが見つかりません' }); return }

  const isBcrypt = player.password_hash.startsWith('$2')
  let valid: boolean
  if (isBcrypt) {
    valid = await bcrypt.compare(currentPassword, player.password_hash)
  } else {
    const { createHash } = await import('crypto')
    valid = createHash('sha256').update(player.salt + currentPassword).digest('hex') === player.password_hash
  }

  if (!valid) { res.status(401).json({ error: '現在のパスワードが違います' }); return }

  const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)
  db.prepare('UPDATE players SET password_hash = ?, salt = ? WHERE id = ?').run(newHash, '', playerId)
  res.json({ ok: true })
})

export default router
