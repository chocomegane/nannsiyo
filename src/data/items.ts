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
  fox: [
    { itemId: 'fox_tail',   name: 'キツネの尻尾',   sellPrice: 160, weight: 65, emoji: '🦊' },
    { itemId: 'fox_crystal',name: '妖狐の結晶',     sellPrice: 420, weight: 35, emoji: '🔮' },
  ],
  cat: [
    { itemId: 'cat_fur',    name: 'まほうネコの毛',  sellPrice: 130, weight: 70, emoji: '🐱' },
    { itemId: 'cat_bell',   name: '魔法の鈴',        sellPrice: 390, weight: 30, emoji: '🔔' },
  ],
  bunny: [
    { itemId: 'bunny_ear',  name: 'ウサギの耳',      sellPrice: 110, weight: 75, emoji: '🐰' },
    { itemId: 'bunny_paw',  name: 'ラッキーポウ',    sellPrice: 480, weight: 25, emoji: '🍀' },
  ],
  penguin: [
    { itemId: 'penguin_feather', name: 'ペンギンの羽根', sellPrice: 140, weight: 70, emoji: '🐧' },
    { itemId: 'penguin_gem',     name: '氷の宝石',        sellPrice: 400, weight: 30, emoji: '💠' },
  ],
  wolf: [
    { itemId: 'wolf_fang',  name: 'ウルフの牙',      sellPrice: 200, weight: 60, emoji: '🐺' },
    { itemId: 'wolf_howl',  name: '月の叫び',        sellPrice: 550, weight: 40, emoji: '🌕' },
  ],
  bear: [
    { itemId: 'bear_honey', name: 'クマのハチミツ',  sellPrice: 90,  weight: 75, emoji: '🍯' },
    { itemId: 'bear_claw',  name: 'クマの爪',        sellPrice: 350, weight: 25, emoji: '🐻' },
  ],
  panda: [
    { itemId: 'panda_leaf', name: 'パンダの竹',      sellPrice: 100, weight: 70, emoji: '🎋' },
    { itemId: 'panda_fur',  name: '黒白の毛',        sellPrice: 360, weight: 30, emoji: '🐼' },
  ],
  tiger: [
    { itemId: 'tiger_stripe', name: 'トラのたてがみ', sellPrice: 220, weight: 60, emoji: '🐯' },
    { itemId: 'tiger_fang',   name: '虎の牙',         sellPrice: 580, weight: 40, emoji: '⚡' },
  ],
  fairy: [
    { itemId: 'fairy_dust',   name: 'フェアリーダスト', sellPrice: 250, weight: 55, emoji: '✨' },
    { itemId: 'fairy_wing',   name: '妖精の翅',         sellPrice: 700, weight: 45, emoji: '🧚' },
  ],
  ghost: [
    { itemId: 'ghost_orb',   name: '霊魂のオーブ',    sellPrice: 180, weight: 65, emoji: '👻' },
    { itemId: 'ghost_flame', name: '青い炎',           sellPrice: 520, weight: 35, emoji: '🔵' },
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
