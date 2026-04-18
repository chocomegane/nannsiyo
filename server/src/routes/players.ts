import { Router } from 'express'
import db from '../db/database.js'
import { randomUUID } from 'crypto'

const router = Router()

router.post('/', (req, res) => {
  const { name } = req.body as { name: string }
  if (!name) { res.status(400).json({ error: 'name required' }); return }
  const id = randomUUID()
  const now = new Date().toISOString()
  db.prepare('INSERT INTO players (id, name, money, created_at, updated_at) VALUES (?, ?, 0, ?, ?)').run(id, name, now, now)
  res.json({ id, name, money: 0 })
})

router.get('/:id', (req, res) => {
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id)
  if (!player) { res.status(404).json({ error: 'not found' }); return }
  res.json(player)
})

router.patch('/:id/money', (req, res) => {
  const { amount } = req.body as { amount: number }
  const now = new Date().toISOString()
  db.prepare('UPDATE players SET money = money + ?, updated_at = ? WHERE id = ?').run(amount, now, req.params.id)
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id)
  res.json(player)
})

export default router
