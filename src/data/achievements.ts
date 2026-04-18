export interface Achievement {
  id: string
  name: string
  description: string
  emoji: string
  check: (stats: AchievementStats) => boolean
}

export interface AchievementStats {
  money: number
  totalEarned: number
  level: number
  itemsCollected: number
  skillsUnlocked: number
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_gold',   name: '初めての金貨',   emoji: '🥇', description: '初めて100Gを稼ぐ',           check: (s) => s.totalEarned >= 100 },
  { id: 'rich',         name: 'お金持ち',        emoji: '💰', description: '所持金1000Gを達成',           check: (s) => s.money >= 1000 },
  { id: 'millionaire',  name: '大富豪',          emoji: '💎', description: '所持金10000Gを達成',          check: (s) => s.money >= 10_000 },
  { id: 'lv5',          name: 'Lv.5達成',        emoji: '⭐', description: 'ペットがレベル5になった',     check: (s) => s.level >= 5 },
  { id: 'lv10',         name: 'Lv.10達成',       emoji: '🌟', description: 'ペットがレベル10になった',    check: (s) => s.level >= 10 },
  { id: 'collector',    name: 'コレクター',      emoji: '📦', description: '100個のアイテムを回収',       check: (s) => s.itemsCollected >= 100 },
  { id: 'skillmaster',  name: 'スキルマスター',  emoji: '⚡', description: '5つ以上のスキルを解放',       check: (s) => s.skillsUnlocked >= 5 },
]
