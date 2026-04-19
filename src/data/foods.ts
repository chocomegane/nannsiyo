import type { FoodEffect } from '../types'

export interface FoodMaster {
  foodId: string
  name: string
  emoji: string
  price: number
  effect: FoodEffect
}

export const FOOD_TABLE: FoodMaster[] = [
  { foodId: 'apple',        name: 'りんご',           emoji: '🍎', price: 50,   effect: { happinessDelta: 10, hungerDelta: -20 } },
  { foodId: 'meat',         name: 'お肉',             emoji: '🍖', price: 120,  effect: { happinessDelta: 20, hungerDelta: -40 } },
  { foodId: 'magic_herb',   name: '魔法草',           emoji: '🌿', price: 200,  effect: { happinessDelta: 30, hungerDelta: -30, colorEffect: 'hue-rotate(120deg)', duration: 60_000 } },
  { foodId: 'star_candy',   name: '星のキャンディ',   emoji: '⭐', price: 300,  effect: { happinessDelta: 40, hungerDelta: -10, glowEffect: true, sizeEffect: 1.2, duration: 30_000 } },
  { foodId: 'dragon_fruit', name: 'ドラゴンフルーツ', emoji: '🍈', price: 500,  effect: { happinessDelta: 50, hungerDelta: -50, colorEffect: 'saturate(2) hue-rotate(30deg)', sizeEffect: 1.3, glowEffect: true, duration: 120_000 } },
  { foodId: 'banana',       name: 'バナナ',           emoji: '🍌', price: 40,   effect: { happinessDelta: 8,  hungerDelta: -15 } },
  { foodId: 'strawberry',   name: 'いちご',           emoji: '🍓', price: 60,   effect: { happinessDelta: 12, hungerDelta: -12 } },
  { foodId: 'cake',         name: 'ケーキ',           emoji: '🎂', price: 180,  effect: { happinessDelta: 30, hungerDelta: -20 } },
  { foodId: 'pizza',        name: 'ピザ',             emoji: '🍕', price: 140,  effect: { happinessDelta: 22, hungerDelta: -45 } },
  { foodId: 'ramen',        name: 'ラーメン',         emoji: '🍜', price: 100,  effect: { happinessDelta: 18, hungerDelta: -50 } },
  { foodId: 'sushi',        name: 'おすし',           emoji: '🍣', price: 160,  effect: { happinessDelta: 25, hungerDelta: -40 } },
  { foodId: 'cookie',       name: 'クッキー',         emoji: '🍪', price: 50,   effect: { happinessDelta: 15, hungerDelta: -10 } },
  { foodId: 'donut',        name: 'ドーナツ',         emoji: '🍩', price: 70,   effect: { happinessDelta: 18, hungerDelta: -15 } },
  { foodId: 'rice',         name: 'おにぎり',         emoji: '🍙', price: 80,   effect: { happinessDelta: 10, hungerDelta: -35 } },
  { foodId: 'fish',         name: '焼き魚',           emoji: '🐟', price: 110,  effect: { happinessDelta: 20, hungerDelta: -38 } },
  { foodId: 'corn',         name: 'とうもろこし',     emoji: '🌽', price: 55,   effect: { happinessDelta: 10, hungerDelta: -22 } },
  { foodId: 'mushroom',     name: 'きのこ',           emoji: '🍄', price: 90,   effect: { happinessDelta: 12, hungerDelta: -30 } },
  { foodId: 'honey',        name: 'はちみつ',         emoji: '🍯', price: 130,  effect: { happinessDelta: 22, hungerDelta: -18 } },
  { foodId: 'cheese',       name: 'チーズ',           emoji: '🧀', price: 85,   effect: { happinessDelta: 15, hungerDelta: -25 } },
  { foodId: 'icecream',     name: 'アイスクリーム',   emoji: '🍦', price: 95,   effect: { happinessDelta: 20, hungerDelta: -12, glowEffect: true, duration: 15_000 } },
  { foodId: 'chocolate',    name: 'チョコレート',     emoji: '🍫', price: 120,  effect: { happinessDelta: 25, hungerDelta: -15 } },
  { foodId: 'potion',       name: '元気の薬',         emoji: '⚗️', price: 250,  effect: { happinessDelta: 40, hungerDelta: -5,  colorEffect: 'hue-rotate(60deg)', duration: 45_000 } },
  { foodId: 'moon_cake',    name: '月のお菓子',       emoji: '🌙', price: 350,  effect: { happinessDelta: 45, hungerDelta: -30, glowEffect: true, colorEffect: 'brightness(1.2)', duration: 60_000 } },
  { foodId: 'rainbow_jelly',name: 'にじゼリー',       emoji: '🌈', price: 450,  effect: { happinessDelta: 50, hungerDelta: -25, colorEffect: 'hue-rotate(180deg) saturate(1.5)', sizeEffect: 1.15, glowEffect: true, duration: 90_000 } },
  { foodId: 'star_soup',    name: '星くずスープ',     emoji: '⭐', price: 600,  effect: { happinessDelta: 60, hungerDelta: -60, colorEffect: 'brightness(1.3) saturate(2)', sizeEffect: 1.4, glowEffect: true, duration: 150_000 } },
]
