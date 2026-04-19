import { Router } from 'express'
import type { Request, Response } from 'express'
import db from '../db/database'

const router = Router()

// GET /api/settings/:playerId
router.get('/:playerId', (req: Request, res: Response) => {
  const { playerId } = req.params
  const row = db.prepare('SELECT * FROM player_settings WHERE player_id = ?').get(playerId) as {
    player_id: string; bgm_volume: number; bgm_muted: number; bgm_scene: string; radio_station: number
  } | undefined
  if (!row) {
    res.json({ bgm_volume: 0.03, bgm_muted: false, bgm_scene: {}, radio_station: 0 }); return
  }
  res.json({
    bgm_volume: row.bgm_volume,
    bgm_muted: row.bgm_muted === 1,
    bgm_scene: JSON.parse(row.bgm_scene),
    radio_station: row.radio_station ?? 0,
  })
})

// PUT /api/settings/:playerId
router.put('/:playerId', (req: Request, res: Response) => {
  const { playerId } = req.params
  const { bgm_volume, bgm_muted, bgm_scene, radio_station } = req.body as {
    bgm_volume?: number; bgm_muted?: boolean; bgm_scene?: Record<string, string>; radio_station?: number
  }
  db.prepare(`
    INSERT INTO player_settings (player_id, bgm_volume, bgm_muted, bgm_scene, radio_station)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(player_id) DO UPDATE SET
      bgm_volume    = excluded.bgm_volume,
      bgm_muted     = excluded.bgm_muted,
      bgm_scene     = excluded.bgm_scene,
      radio_station = excluded.radio_station
  `).run(
    playerId,
    bgm_volume ?? 0.03,
    bgm_muted ? 1 : 0,
    JSON.stringify(bgm_scene ?? {}),
    radio_station ?? 0,
  )
  res.json({ ok: true })
})

export default router
