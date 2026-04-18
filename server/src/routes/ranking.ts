import { Router } from 'express'
import { randomUUID } from 'crypto'
import db from '../db/database.js'

const router = Router()

router.get('/', (_req, res) => {
  const ranking = db.prepare(`
    SELECT p.id, p.name, p.money,
           COALESCE(SUM(s.total_amount), 0) as total_earned,
           COUNT(s.id) as sell_count
    FROM players p
    LEFT JOIN sell_history s ON s.player_id = p.id
    GROUP BY p.id
    ORDER BY p.money DESC
    LIMIT 50
  `).all()
  res.json(ranking)
})

router.post('/sell', (req, res) => {
  const { playerId, totalAmount, itemCount } = req.body as { playerId: string; totalAmount: number; itemCount: number }
  db.prepare('INSERT INTO sell_history (id, player_id, total_amount, item_count, sold_at) VALUES (?, ?, ?, ?, ?)')
    .run(randomUUID(), playerId, totalAmount, itemCount, new Date().toISOString())
  db.prepare('UPDATE players SET money = money + ?, updated_at = ? WHERE id = ?')
    .run(totalAmount, new Date().toISOString(), playerId)
  res.json({ ok: true })
})

export default router
