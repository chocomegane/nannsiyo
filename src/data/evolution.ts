import type { Species } from '../types'

export interface EvolutionStage {
  minLevel: number
  title: string
  sizeBonus: number
}

export const EVOLUTION_TABLE: Record<Species, EvolutionStage[]> = {
  dragon:  [
    { minLevel: 1,  title: 'ちびドラゴン', sizeBonus: 1.0 },
    { minLevel: 20, title: 'ドラゴン',     sizeBonus: 1.2 },
    { minLevel: 50, title: '古龍',         sizeBonus: 1.45 },
  ],
  unicorn: [
    { minLevel: 1,  title: 'こうまちゃん', sizeBonus: 1.0 },
    { minLevel: 20, title: 'ユニコーン',   sizeBonus: 1.2 },
    { minLevel: 50, title: '天馬',         sizeBonus: 1.45 },
  ],
  slime: [
    { minLevel: 1,  title: 'ぷちスライム', sizeBonus: 1.0 },
    { minLevel: 20, title: 'スライム',     sizeBonus: 1.2 },
    { minLevel: 50, title: 'キングスライム', sizeBonus: 1.45 },
  ],
  phoenix: [
    { minLevel: 1,  title: 'ひなとり',     sizeBonus: 1.0 },
    { minLevel: 20, title: 'フェニックス', sizeBonus: 1.2 },
    { minLevel: 50, title: '不死鳥神',     sizeBonus: 1.45 },
  ],
  golem: [
    { minLevel: 1,  title: 'こごーれむ',   sizeBonus: 1.0 },
    { minLevel: 20, title: 'ゴーレム',     sizeBonus: 1.2 },
    { minLevel: 50, title: '鋼鉄巨人',     sizeBonus: 1.45 },
  ],
}

export function getEvolutionStage(species: Species, level: number): EvolutionStage {
  const stages = EVOLUTION_TABLE[species]
  return [...stages].reverse().find((s) => level >= s.minLevel) ?? stages[0]
}

const FOOD_HUE: Record<string, number> = {
  apple: 0, meat: 20, magic_herb: 120, star_candy: 200, dragon_fruit: 270,
}
const FOOD_GLOW: Record<string, string | null> = {
  apple: null, meat: null, magic_herb: '#66ff88', star_candy: '#ffff44', dragon_fruit: '#ff66ff',
}

export function calcEatAppearance(eatCount: Record<string, number>): {
  hueRotate: number; saturate: number; glowColor: string | null; scaleBonus: number
} {
  let totalEats = 0
  let weightedHue = 0
  let glowColor: string | null = null
  let maxGlowEats = 0

  for (const [foodId, count] of Object.entries(eatCount)) {
    totalEats += count
    weightedHue += (FOOD_HUE[foodId] ?? 0) * count
    const fc = FOOD_GLOW[foodId]
    if (fc && count > maxGlowEats) { glowColor = fc; maxGlowEats = count }
  }

  if (totalEats === 0) return { hueRotate: 0, saturate: 1, glowColor: null, scaleBonus: 0 }

  const hueRotate = Math.round(weightedHue / totalEats)
  const saturate = Math.min(1 + totalEats * 0.04, 2.5)
  const scaleBonus = Math.min(totalEats * 0.005, 0.3)
  const showGlow = maxGlowEats >= 3

  return { hueRotate, saturate, glowColor: showGlow ? glowColor : null, scaleBonus }
}
