import type { Skill } from '../types'

export const SKILL_TABLE: Skill[] = [
  { id: 'fire_breath',    name: '火炎ブレス',       category: 'attack',    unlockLevel: 3,  description: '炎を吐いて攻撃する' },
  { id: 'emoji_pop',      name: '顔文字ポップ',     category: 'expression',unlockLevel: 2,  description: '顔文字が飛び出す' },
  { id: 'party_cracker',  name: 'パーティークラッカー', category: 'party', unlockLevel: 5,  description: '紙吹雪が舞う' },
  { id: 'candy_drop',     name: 'キャンディドロップ', category: 'item',   unlockLevel: 4,  description: 'お菓子をばら撒く' },
  { id: 'random_warp',    name: 'ランダムワープ',    category: 'move',    unlockLevel: 6,  description: 'ランダムな場所にテレポート' },
  { id: 'heal_aura',      name: 'ヒールオーラ',      category: 'support', unlockLevel: 8,  description: '周囲を回復する光を放つ' },
  { id: 'prism_shift',    name: 'プリズムシフト',    category: 'transform',unlockLevel: 10, description: '一時的に外見が変化する' },
]

export function getSkillsByLevel(level: number): Skill[] {
  return SKILL_TABLE.filter((s) => s.unlockLevel <= level)
}
