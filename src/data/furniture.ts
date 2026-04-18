export type FurnitureSlot = 'wall-left' | 'wall-center' | 'wall-right' | 'floor-left' | 'floor-center' | 'floor-right'

export interface FurnitureMaster {
  furnitureId: string
  name: string
  emoji: string
  price: number
  slot: FurnitureSlot
}

export const FURNITURE_TABLE: FurnitureMaster[] = [
  { furnitureId: 'plant',     name: '観葉植物', emoji: '🪴', price: 100,  slot: 'floor-left' },
  { furnitureId: 'lamp',      name: 'ランプ',   emoji: '🪔', price: 150,  slot: 'floor-left' },
  { furnitureId: 'bear',      name: 'ぬいぐるみ', emoji: '🧸', price: 180, slot: 'floor-right' },
  { furnitureId: 'carpet',    name: 'カーペット', emoji: '🟥', price: 200, slot: 'floor-center' },
  { furnitureId: 'bookshelf', name: '本棚',     emoji: '📚', price: 250,  slot: 'wall-left' },
  { furnitureId: 'clock',     name: '時計',     emoji: '🕰️', price: 280, slot: 'wall-center' },
  { furnitureId: 'painting',  name: '絵画',     emoji: '🖼️', price: 300, slot: 'wall-right' },
  { furnitureId: 'tv',        name: 'テレビ',   emoji: '📺', price: 350,  slot: 'wall-left' },
  { furnitureId: 'aquarium',  name: '水槽',     emoji: '🐠', price: 400,  slot: 'wall-right' },
  { furnitureId: 'sofa',      name: 'ソファ',   emoji: '🛋️', price: 500, slot: 'floor-right' },
]

export const SLOT_POSITION: Record<FurnitureSlot, { left: string; bottom: string; fontSize: string }> = {
  'wall-left':    { left: '8%',  bottom: '62%', fontSize: '3rem' },
  'wall-center':  { left: '44%', bottom: '64%', fontSize: '3rem' },
  'wall-right':   { left: '80%', bottom: '62%', fontSize: '3rem' },
  'floor-left':   { left: '12%', bottom: '42%', fontSize: '3.5rem' },
  'floor-center': { left: '44%', bottom: '40%', fontSize: '4rem' },
  'floor-right':  { left: '76%', bottom: '42%', fontSize: '3.5rem' },
}
