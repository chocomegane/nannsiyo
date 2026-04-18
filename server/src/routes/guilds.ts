import { Router } from 'express'
import db from '../db/database'
import { randomUUID } from 'crypto'

const router = Router()

router.get('/', (_req, res) => {
  const guilds = db.prepare(`
    SELECT g.id, g.name, g.leader_id, p.name AS leader_name,
           COUNT(gm.player_id) AS member_count
    FROM guilds g
    JOIN players p ON p.id = g.leader_id
    LEFT JOIN guild_members gm ON gm.guild_id = g.id
    GROUP BY g.id
    ORDER BY member_count DESC
  `).all()
  res.json(guilds)
})

router.get('/:id', (req, res) => {
  const guild = db.prepare('SELECT * FROM guilds WHERE id = ?').get(req.params.id)
  if (!guild) { res.status(404).json({ error: 'not found' }); return }
  const members = db.prepare(`
    SELECT p.id, p.name FROM guild_members gm
    JOIN players p ON p.id = gm.player_id
    WHERE gm.guild_id = ?
  `).all(req.params.id)
  res.json({ ...guild as object, members })
})

router.post('/', (req, res) => {
  const { name, playerId } = req.body as { name: string; playerId: string }
  if (!name || !playerId) { res.status(400).json({ error: 'name and playerId required' }); return }
  const existing = db.prepare('SELECT id FROM guild_members WHERE player_id = ?').get(playerId)
  if (existing) { res.status(400).json({ error: 'already in a guild' }); return }
  const id = randomUUID()
  const now = new Date().toISOString()
  db.prepare('INSERT INTO guilds (id, name, leader_id, created_at) VALUES (?, ?, ?, ?)').run(id, name, playerId, now)
  db.prepare('INSERT INTO guild_members (guild_id, player_id, joined_at) VALUES (?, ?, ?)').run(id, playerId, now)
  res.json({ id, name, leader_id: playerId })
})

router.post('/:id/join', (req, res) => {
  const { playerId } = req.body as { playerId: string }
  const guild = db.prepare('SELECT * FROM guilds WHERE id = ?').get(req.params.id)
  if (!guild) { res.status(404).json({ error: 'not found' }); return }
  const existing = db.prepare('SELECT id FROM guild_members WHERE player_id = ?').get(playerId)
  if (existing) { res.status(400).json({ error: 'already in a guild' }); return }
  db.prepare('INSERT INTO guild_members (guild_id, player_id, joined_at) VALUES (?, ?, ?)').run(req.params.id, playerId, new Date().toISOString())
  res.json({ ok: true })
})

router.delete('/:id/leave', (req, res) => {
  const { playerId } = req.body as { playerId: string }
  db.prepare('DELETE FROM guild_members WHERE guild_id = ? AND player_id = ?').run(req.params.id, playerId)
  const guild = db.prepare('SELECT * FROM guilds WHERE id = ?').get(req.params.id) as { leader_id: string } | undefined
  if (guild?.leader_id === playerId) {
    const next = db.prepare('SELECT player_id FROM guild_members WHERE guild_id = ? LIMIT 1').get(req.params.id) as { player_id: string } | undefined
    if (next) {
      db.prepare('UPDATE guilds SET leader_id = ? WHERE id = ?').run(next.player_id, req.params.id)
    } else {
      db.prepare('DELETE FROM guilds WHERE id = ?').run(req.params.id)
    }
  }
  res.json({ ok: true })
})

export default router
