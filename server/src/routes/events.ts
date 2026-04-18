import { Router } from 'express'

const router = Router()

// 季節イベントマスター（Phase 4で本格化）
const EVENTS = [
  { id: 'halloween', name: 'ハロウィン', startMonth: 10, endMonth: 10, bonusMultiplier: 1.5 },
  { id: 'christmas', name: 'クリスマス', startMonth: 12, endMonth: 12, bonusMultiplier: 2.0 },
  { id: 'newyear',   name: 'お正月',     startMonth: 1,  endMonth: 1,  bonusMultiplier: 1.8 },
]

router.get('/current', (_req, res) => {
  const month = new Date().getMonth() + 1
  const active = EVENTS.filter((e) => month >= e.startMonth && month <= e.endMonth)
  res.json(active)
})

export default router
