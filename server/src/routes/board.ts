import { Router } from 'express'
import type { Request, Response } from 'express'
import db from '../db/database'
import { randomUUID } from 'crypto'

const router = Router()

// GET /api/board/:scene - 最新50件取得
router.get('/:scene', (req: Request, res: Response) => {
  const { scene } = req.params
  const posts = db.prepare(
    'SELECT id, player_id, player_name, message, created_at FROM board_posts WHERE scene = ? ORDER BY created_at DESC LIMIT 50'
  ).all(scene)
  res.json(posts)
})

// POST /api/board/:scene - 投稿
router.post('/:scene', (req: Request, res: Response) => {
  const { scene } = req.params
  const { playerId, message } = req.body as { playerId: string; message: string }
  if (!playerId || !message || typeof message !== 'string') {
    res.status(400).json({ error: 'invalid' }); return
  }
  const trimmed = message.trim().slice(0, 200)
  if (!trimmed) { res.status(400).json({ error: 'empty' }); return }

  const player = db.prepare('SELECT name FROM players WHERE id = ?').get(playerId) as { name: string } | undefined
  if (!player) { res.status(404).json({ error: 'player not found' }); return }

  const post = {
    id: randomUUID(),
    scene,
    player_id: playerId,
    player_name: player.name,
    message: trimmed,
    created_at: new Date().toISOString(),
  }
  db.prepare('INSERT INTO board_posts VALUES (@id, @scene, @player_id, @player_name, @message, @created_at)').run(post)
  res.json(post)
})

export default router
