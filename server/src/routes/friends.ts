import { Router } from 'express'
import db from '../db/database'
import { randomUUID } from 'crypto'

const router = Router()

router.get('/:playerId', (req, res) => {
  const { playerId } = req.params
  const friends = db.prepare(`
    SELECT p.id, p.name,
      CASE WHEN f.player_id = ? THEN f.status ELSE f.status END AS status,
      f.id AS request_id,
      CASE WHEN f.player_id = ? THEN 'sent' ELSE 'received' END AS direction
    FROM friends f
    JOIN players p ON p.id = CASE WHEN f.player_id = ? THEN f.friend_id ELSE f.player_id END
    WHERE f.player_id = ? OR f.friend_id = ?
  `).all(playerId, playerId, playerId, playerId, playerId)
  res.json(friends)
})

router.post('/request', (req, res) => {
  const { playerId, targetName } = req.body as { playerId: string; targetName: string }
  const target = db.prepare('SELECT id FROM players WHERE name = ?').get(targetName) as { id: string } | undefined
  if (!target) { res.status(404).json({ error: 'プレイヤーが見つかりません' }); return }
  if (target.id === playerId) { res.status(400).json({ error: '自分自身には送れません' }); return }
  const existing = db.prepare('SELECT id FROM friends WHERE (player_id = ? AND friend_id = ?) OR (player_id = ? AND friend_id = ?)').get(playerId, target.id, target.id, playerId)
  if (existing) { res.status(400).json({ error: 'すでにフレンド申請済みです' }); return }
  const id = randomUUID()
  db.prepare('INSERT INTO friends (id, player_id, friend_id, status, created_at) VALUES (?, ?, ?, ?, ?)').run(id, playerId, target.id, 'pending', new Date().toISOString())
  res.json({ ok: true })
})

router.post('/accept', (req, res) => {
  const { requestId, playerId } = req.body as { requestId: string; playerId: string }
  const req_ = db.prepare('SELECT * FROM friends WHERE id = ? AND friend_id = ?').get(requestId, playerId)
  if (!req_) { res.status(404).json({ error: 'not found' }); return }
  db.prepare('UPDATE friends SET status = ? WHERE id = ?').run('accepted', requestId)
  res.json({ ok: true })
})

router.delete('/:requestId', (req, res) => {
  db.prepare('DELETE FROM friends WHERE id = ?').run(req.params.requestId)
  res.json({ ok: true })
})

export default router
