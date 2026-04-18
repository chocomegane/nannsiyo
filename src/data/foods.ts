import type { FoodEffect } from '../types'

export interface FoodMaster {
  foodId: string
  name: string
  emoji: string
  price: number
  effect: FoodEffect
}

export const FOOD_TABLE: FoodMaster[] = [
  {
    foodId: 'apple',
    name: 'りんご',
    emoji: '🍎',
    price: 50,
    effect: { happinessDelta: 10, hungerDelta: -20 },
  },
  {
    foodId: 'meat',
    name: 'お肉',
    emoji: '🍖',
    price: 120,
    effect: { happinessDelta: 20, hungerDelta: -40 },
  },
  {
    foodId: 'magic_herb',
    name: '魔法草',
    emoji: '🌿',
    price: 200,
    effect: { happinessDelta: 30, hungerDelta: -30, colorEffect: 'hue-rotate(120deg)', duration: 60_000 },
  },
  {
    foodId: 'star_candy',
    name: '星のキャンディ',
    emoji: '⭐',
    price: 300,
    effect: { happinessDelta: 40, hungerDelta: -10, glowEffect: true, sizeEffect: 1.2, duration: 30_000 },
  },
  {
    foodId: 'dragon_fruit',
    name: 'ドラゴンフルーツ',
    emoji: '🍈',
    price: 500,
    effect: { happinessDelta: 50, hungerDelta: -50, colorEffect: 'saturate(2) hue-rotate(30deg)', sizeEffect: 1.3, glowEffect: true, duration: 120_000 },
  },
]
