export interface Pet {
  id: string
  name: string
  species: 'dragon' | 'unicorn' | 'slime'
  level: number
  stats: {
    happiness: number
    hunger: number
  }
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
