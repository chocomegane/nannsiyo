export interface DropTableEntry {
  itemId: string
  name: string
  sellPrice: number
  weight: number
}

export const DROP_TABLE: Record<string, DropTableEntry[]> = {
  dragon: [
    { itemId: 'dragon_scale', name: 'ドラゴンの鱗', sellPrice: 100, weight: 70 },
    { itemId: 'dragon_claw',  name: 'ドラゴンの爪', sellPrice: 300, weight: 30 },
  ],
  unicorn: [
    { itemId: 'unicorn_hair', name: 'ユニコーンの毛', sellPrice: 150, weight: 60 },
    { itemId: 'unicorn_dust', name: '角の粉',         sellPrice: 250, weight: 40 },
  ],
  slime: [
    { itemId: 'slime_gel',  name: 'スライムゲル', sellPrice: 50,  weight: 80 },
    { itemId: 'slime_core', name: 'スライムコア', sellPrice: 200, weight: 20 },
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
