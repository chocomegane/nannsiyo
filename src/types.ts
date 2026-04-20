export type Species = 'dragon' | 'unicorn' | 'slime' | 'phoenix' | 'golem'
  | 'fox' | 'cat' | 'bunny' | 'penguin' | 'wolf'
  | 'bear' | 'panda' | 'tiger' | 'fairy' | 'ghost'

export type SkillCategory = 'attack' | 'expression' | 'party' | 'item' | 'move' | 'support' | 'transform'

export interface Skill {
  id: string
  name: string
  category: SkillCategory
  unlockLevel: number
  description: string
}

export interface FoodItem {
  id: string
  foodId: string
  name: string
  price: number
}

export interface FoodEffect {
  happinessDelta: number
  hungerDelta: number
  colorEffect?: string
  sizeEffect?: number
  glowEffect?: boolean
  duration?: number
}

export interface Pet {
  id: string
  name: string
  species: Species
  level: number
  exp: number
  stats: {
    happiness: number
    hunger: number
  }
  appearance: {
    colorFilter: string
    scale: number
    glow: boolean
  }
  unlockedSkills: string[]
  eatCount: Record<string, number>
}

export interface FurnitureItem {
  id: string
  furnitureId: string
  name: string
  placed: boolean
}

export interface DroppedItem {
  id: string
  itemId: string
  name: string
  sellPrice: number
  x: number
  y: number
}

export interface Player {
  money: number
  inventory: DroppedItem[]
}

export type Scene = 'room' | 'park' | 'dungeon' | 'ranking' | 'furniture' | 'radio'
