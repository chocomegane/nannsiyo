import type { FoodEffect } from '../types'

export interface FoodMaster {
  foodId: string
  name: string
  emoji: string
  price: number
  category: 'basic' | 'meal' | 'sweet' | 'special' | 'legendary'
  effect: FoodEffect
}

export const FOOD_TABLE: FoodMaster[] = [
  // ── 基本 (basic) ──
  { foodId: 'apple',         name: 'りんご',           emoji: '🍎', price: 30,   category: 'basic',     effect: { happinessDelta: 8,  hungerDelta: -20 } },
  { foodId: 'banana',        name: 'バナナ',           emoji: '🍌', price: 30,   category: 'basic',     effect: { happinessDelta: 8,  hungerDelta: -18 } },
  { foodId: 'strawberry',    name: 'いちご',           emoji: '🍓', price: 40,   category: 'basic',     effect: { happinessDelta: 10, hungerDelta: -15 } },
  { foodId: 'corn',          name: 'とうもろこし',     emoji: '🌽', price: 35,   category: 'basic',     effect: { happinessDelta: 8,  hungerDelta: -22 } },
  { foodId: 'carrot',        name: 'にんじん',         emoji: '🥕', price: 30,   category: 'basic',     effect: { happinessDelta: 7,  hungerDelta: -20 } },
  { foodId: 'grape',         name: 'ぶどう',           emoji: '🍇', price: 45,   category: 'basic',     effect: { happinessDelta: 10, hungerDelta: -16 } },
  { foodId: 'watermelon',    name: 'すいか',           emoji: '🍉', price: 50,   category: 'basic',     effect: { happinessDelta: 12, hungerDelta: -18 } },
  { foodId: 'peach',         name: 'もも',             emoji: '🍑', price: 55,   category: 'basic',     effect: { happinessDelta: 12, hungerDelta: -20 } },
  { foodId: 'pineapple',     name: 'パイナップル',     emoji: '🍍', price: 60,   category: 'basic',     effect: { happinessDelta: 13, hungerDelta: -22 } },
  { foodId: 'mushroom',      name: 'きのこ',           emoji: '🍄', price: 50,   category: 'basic',     effect: { happinessDelta: 10, hungerDelta: -25 } },

  // ── 食事 (meal) ──
  { foodId: 'rice',          name: 'おにぎり',         emoji: '🍙', price: 80,   category: 'meal',      effect: { happinessDelta: 12, hungerDelta: -35 } },
  { foodId: 'ramen',         name: 'ラーメン',         emoji: '🍜', price: 100,  category: 'meal',      effect: { happinessDelta: 18, hungerDelta: -50 } },
  { foodId: 'sushi',         name: 'おすし',           emoji: '🍣', price: 160,  category: 'meal',      effect: { happinessDelta: 25, hungerDelta: -40 } },
  { foodId: 'pizza',         name: 'ピザ',             emoji: '🍕', price: 140,  category: 'meal',      effect: { happinessDelta: 22, hungerDelta: -45 } },
  { foodId: 'meat',          name: 'お肉',             emoji: '🍖', price: 120,  category: 'meal',      effect: { happinessDelta: 20, hungerDelta: -40 } },
  { foodId: 'fish',          name: '焼き魚',           emoji: '🐟', price: 110,  category: 'meal',      effect: { happinessDelta: 18, hungerDelta: -38 } },
  { foodId: 'burger',        name: 'バーガー',         emoji: '🍔', price: 130,  category: 'meal',      effect: { happinessDelta: 20, hungerDelta: -45 } },
  { foodId: 'curry',         name: 'カレー',           emoji: '🍛', price: 120,  category: 'meal',      effect: { happinessDelta: 22, hungerDelta: -48 } },
  { foodId: 'hotpot',        name: 'おでん',           emoji: '🍢', price: 100,  category: 'meal',      effect: { happinessDelta: 18, hungerDelta: -42 } },
  { foodId: 'egg',           name: 'たまごやき',       emoji: '🥚', price: 70,   category: 'meal',      effect: { happinessDelta: 14, hungerDelta: -30 } },
  { foodId: 'cheese',        name: 'チーズ',           emoji: '🧀', price: 85,   category: 'meal',      effect: { happinessDelta: 15, hungerDelta: -28 } },
  { foodId: 'salad',         name: 'サラダ',           emoji: '🥗', price: 75,   category: 'meal',      effect: { happinessDelta: 13, hungerDelta: -25 } },
  { foodId: 'sandwich',      name: 'サンドイッチ',     emoji: '🥪', price: 90,   category: 'meal',      effect: { happinessDelta: 16, hungerDelta: -35 } },
  { foodId: 'soup',          name: 'スープ',           emoji: '🍲', price: 85,   category: 'meal',      effect: { happinessDelta: 14, hungerDelta: -32 } },
  { foodId: 'yakitori',      name: 'やきとり',         emoji: '🍡', price: 110,  category: 'meal',      effect: { happinessDelta: 19, hungerDelta: -38 } },

  // ── スイーツ (sweet) ──
  { foodId: 'cookie',        name: 'クッキー',         emoji: '🍪', price: 50,   category: 'sweet',     effect: { happinessDelta: 15, hungerDelta: -10 } },
  { foodId: 'donut',         name: 'ドーナツ',         emoji: '🍩', price: 70,   category: 'sweet',     effect: { happinessDelta: 18, hungerDelta: -15 } },
  { foodId: 'cake',          name: 'ケーキ',           emoji: '🎂', price: 180,  category: 'sweet',     effect: { happinessDelta: 30, hungerDelta: -20 } },
  { foodId: 'chocolate',     name: 'チョコレート',     emoji: '🍫', price: 120,  category: 'sweet',     effect: { happinessDelta: 25, hungerDelta: -15 } },
  { foodId: 'icecream',      name: 'アイスクリーム',   emoji: '🍦', price: 95,   category: 'sweet',     effect: { happinessDelta: 20, hungerDelta: -12, glowEffect: true, duration: 15_000 } },
  { foodId: 'honey',         name: 'はちみつ',         emoji: '🍯', price: 130,  category: 'sweet',     effect: { happinessDelta: 22, hungerDelta: -18 } },
  { foodId: 'candy',         name: 'キャンディ',       emoji: '🍬', price: 40,   category: 'sweet',     effect: { happinessDelta: 12, hungerDelta: -8  } },
  { foodId: 'lollipop',      name: 'ぺろぺろキャンディ',emoji: '🍭', price: 55,  category: 'sweet',     effect: { happinessDelta: 15, hungerDelta: -8  } },
  { foodId: 'pudding',       name: 'プリン',           emoji: '🍮', price: 100,  category: 'sweet',     effect: { happinessDelta: 22, hungerDelta: -18 } },
  { foodId: 'macaron',       name: 'マカロン',         emoji: '🫐', price: 150,  category: 'sweet',     effect: { happinessDelta: 28, hungerDelta: -15 } },

  // ── スペシャル (special) ──
  { foodId: 'magic_herb',    name: '魔法草',           emoji: '🌿', price: 200,  category: 'special',   effect: { happinessDelta: 30, hungerDelta: -30, colorEffect: 'hue-rotate(120deg)', duration: 60_000 } },
  { foodId: 'star_candy',    name: '星のキャンディ',   emoji: '⭐', price: 300,  category: 'special',   effect: { happinessDelta: 40, hungerDelta: -10, glowEffect: true, sizeEffect: 1.2, duration: 30_000 } },
  { foodId: 'potion',        name: '元気の薬',         emoji: '⚗️', price: 250,  category: 'special',   effect: { happinessDelta: 40, hungerDelta: -5,  colorEffect: 'hue-rotate(60deg)', duration: 45_000 } },
  { foodId: 'moon_cake',     name: '月のお菓子',       emoji: '🌙', price: 350,  category: 'special',   effect: { happinessDelta: 45, hungerDelta: -30, glowEffect: true, colorEffect: 'brightness(1.2)', duration: 60_000 } },
  { foodId: 'rainbow_jelly', name: 'にじゼリー',       emoji: '🌈', price: 450,  category: 'special',   effect: { happinessDelta: 50, hungerDelta: -25, colorEffect: 'hue-rotate(180deg) saturate(1.5)', sizeEffect: 1.15, glowEffect: true, duration: 90_000 } },
  { foodId: 'fairy_bread',   name: '妖精のパン',       emoji: '🧚', price: 280,  category: 'special',   effect: { happinessDelta: 38, hungerDelta: -40, colorEffect: 'brightness(1.1) hue-rotate(30deg)', duration: 45_000 } },
  { foodId: 'thunder_jerky', name: '雷干し肉',         emoji: '⚡', price: 320,  category: 'special',   effect: { happinessDelta: 35, hungerDelta: -55, sizeEffect: 1.1, duration: 30_000 } },
  { foodId: 'crystal_water', name: '水晶の水',         emoji: '💎', price: 380,  category: 'special',   effect: { happinessDelta: 42, hungerDelta: -20, glowEffect: true, colorEffect: 'saturate(1.8)', duration: 60_000 } },
  { foodId: 'dream_fruit',   name: '夢の実',           emoji: '🫧', price: 420,  category: 'special',   effect: { happinessDelta: 48, hungerDelta: -35, colorEffect: 'hue-rotate(240deg)', sizeEffect: 1.2, duration: 75_000 } },

  // ── レジェンダリー (legendary) ──
  { foodId: 'dragon_fruit',  name: 'ドラゴンフルーツ', emoji: '🍈', price: 500,  category: 'legendary', effect: { happinessDelta: 50, hungerDelta: -50, colorEffect: 'saturate(2) hue-rotate(30deg)', sizeEffect: 1.3, glowEffect: true, duration: 120_000 } },
  { foodId: 'star_soup',     name: '星くずスープ',     emoji: '🌟', price: 600,  category: 'legendary', effect: { happinessDelta: 60, hungerDelta: -60, colorEffect: 'brightness(1.3) saturate(2)', sizeEffect: 1.4, glowEffect: true, duration: 150_000 } },
  { foodId: 'phoenix_egg',   name: 'フェニックスの卵', emoji: '🔥', price: 800,  category: 'legendary', effect: { happinessDelta: 70, hungerDelta: -60, colorEffect: 'hue-rotate(15deg) saturate(3)', sizeEffect: 1.5, glowEffect: true, duration: 180_000 } },
  { foodId: 'gods_nectar',   name: '神々の蜜',         emoji: '✨', price: 1000, category: 'legendary', effect: { happinessDelta: 80, hungerDelta: -70, colorEffect: 'brightness(1.5) saturate(2) hue-rotate(45deg)', sizeEffect: 1.6, glowEffect: true, duration: 240_000 } },
  { foodId: 'universe_seed', name: '宇宙の種',         emoji: '🌌', price: 1500, category: 'legendary', effect: { happinessDelta: 99, hungerDelta: -99, colorEffect: 'hue-rotate(360deg) saturate(3) brightness(1.4)', sizeEffect: 1.8, glowEffect: true, duration: 300_000 } },
]

export const FOOD_CATEGORIES: { id: FoodMaster['category']; label: string }[] = [
  { id: 'basic',     label: '🌿 くだもの・野菜' },
  { id: 'meal',      label: '🍽️ ごはん' },
  { id: 'sweet',     label: '🍰 スイーツ' },
  { id: 'special',   label: '✨ スペシャル' },
  { id: 'legendary', label: '👑 レジェンダリー' },
]
