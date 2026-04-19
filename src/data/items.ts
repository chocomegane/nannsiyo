export interface DropTableEntry {
  itemId: string
  name: string
  sellPrice: number
  weight: number
  emoji: string
}

export const DROP_TABLE: Record<string, DropTableEntry[]> = {
  dragon: [
    { itemId: 'dragon_scale', name: 'ドラゴンの鱗', sellPrice: 120, weight: 70, emoji: '🔸' },
    { itemId: 'dragon_claw',  name: 'ドラゴンの爪', sellPrice: 450, weight: 30, emoji: '🐉' },
  ],
  unicorn: [
    { itemId: 'unicorn_hair', name: 'ユニコーンの毛', sellPrice: 180, weight: 60, emoji: '✨' },
    { itemId: 'unicorn_dust', name: '角の粉',         sellPrice: 380, weight: 40, emoji: '🌟' },
  ],
  slime: [
    { itemId: 'slime_gel',  name: 'スライムゲル', sellPrice: 70,  weight: 80, emoji: '💚' },
    { itemId: 'slime_core', name: 'スライムコア', sellPrice: 320, weight: 20, emoji: '💎' },
  ],
  phoenix: [
    { itemId: 'phoenix_feather', name: 'フェニックスの羽', sellPrice: 500, weight: 60, emoji: '🪶' },
    { itemId: 'phoenix_tear',    name: '不死鳥の涙',       sellPrice: 1000, weight: 40, emoji: '💧' },
  ],
  golem: [
    { itemId: 'golem_stone', name: 'ゴーレムストーン', sellPrice: 300, weight: 70, emoji: '🪨' },
    { itemId: 'golem_core',  name: 'ゴーレムコア',     sellPrice: 750, weight: 30, emoji: '⚙️' },
  ],
}

export function weightedRandom(entries: DropTableEntry[]): DropTableEntry {
  const total = entries.reduce((sum, e) => sum + e.weight, 0)
  let r = Math.random() * total
  for (const entry of entries) {
    r -= entry.weight
    if (r <= 0) return entry
  }
  return entries[entries.length - 1]
}
