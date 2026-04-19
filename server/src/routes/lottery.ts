import { Router } from 'express'
import db from '../db/database'

const router = Router()

const SYMBOLS = ['💎', '🪙', '⭐', '🔔', '🍀', '🐉']

function garaponPrize(): { label: string; prize: number } {
  const r = Math.random()
  if (r < 0.01) return { label: '🏆 大当たり', prize: 5000 }
  if (r < 0.10) return { label: '🎊 中当たり', prize: 1000 }
  if (r < 0.40) return { label: '🎉 小当たり', prize: 200 }
  return { label: '😢 ハズレ', prize: 0 }
}

router.post('/play', (req, res) => {
  const { playerId, type } = req.body as { playerId: string; type: string }
  const player = db.prepare('SELECT money FROM players WHERE id = ?').get(playerId) as { money: number } | undefined
  if (!player) { res.status(404).json({ error: 'プレイヤーが見つかりません' }); return }

  const now = new Date().toISOString()

  if (type === 'garapon') {
    if (player.money < 100) { res.status(400).json({ error: 'コイン不足' }); return }
    const result = garaponPrize()
    db.prepare('UPDATE players SET money = money - 100 + ?, updated_at = ? WHERE id = ?')
      .run(result.prize, now, playerId)
    res.json({ ok: true, result })

  } else if (type === 'garapon10') {
    if (player.money < 1000) { res.status(400).json({ error: 'コイン不足' }); return }
    const results = Array.from({ length: 10 }, () => garaponPrize())
    const totalPrize = results.reduce((s, r) => s + r.prize, 0)
    db.prepare('UPDATE players SET money = money - 1000 + ?, updated_at = ? WHERE id = ?')
      .run(totalPrize, now, playerId)
    res.json({ ok: true, result: { results, totalPrize } })

  } else if (type === 'scratch') {
    if (player.money < 100) { res.status(400).json({ error: 'コイン不足' }); return }
    const cards = Array.from({ length: 6 }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
    const counts: Record<string, number> = {}
    cards.forEach(s => { counts[s] = (counts[s] ?? 0) + 1 })
    const prize = Math.max(...Object.values(counts)) >= 3 ? 1000 : 0
    db.prepare('UPDATE players SET money = money - 100 + ?, updated_at = ? WHERE id = ?')
      .run(prize, now, playerId)
    res.json({ ok: true, result: { cards, prize } })

  } else if (type === 'slot') {
    if (player.money < 100) { res.status(400).json({ error: 'コイン不足' }); return }
    const reels = Array.from({ length: 3 }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
    let prize = 0
    if (reels[0] === reels[1] && reels[1] === reels[2]) prize = 5000
    else if (reels[0] === reels[1] || reels[1] === reels[2]) prize = 200
    db.prepare('UPDATE players SET money = money - 100 + ?, updated_at = ? WHERE id = ?')
      .run(prize, now, playerId)
    res.json({ ok: true, result: { reels, prize } })

  } else {
    res.status(400).json({ error: '不正なタイプ' })
  }
})

export default router
