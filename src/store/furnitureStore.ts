import { create } from 'zustand'
import type { FurnitureItem } from '../types'
import { FURNITURE_TABLE } from '../data/furniture'
import { usePlayerStore } from './playerStore'
import { generateId } from '../lib/uuid'

interface FurnitureState {
  items: FurnitureItem[]
  buyFurniture: (furnitureId: string) => boolean
  togglePlace: (id: string) => void
  placedItems: () => FurnitureItem[]
}

export const useFurnitureStore = create<FurnitureState>((set, get) => ({
  items: [],

  buyFurniture: (furnitureId) => {
    const master = FURNITURE_TABLE.find((f) => f.furnitureId === furnitureId)
    if (!master) return false
    const { money } = usePlayerStore.getState()
    if (money < master.price) return false
    usePlayerStore.setState((s) => ({ money: s.money - master.price }))
    set((s) => ({
      items: [...s.items, { id: generateId(), furnitureId, name: master.name, placed: false }],
    }))
    return true
  },

  togglePlace: (id) =>
    set((s) => ({
      items: s.items.map((item) => item.id === id ? { ...item, placed: !item.placed } : item),
    })),

  placedItems: () => get().items.filter((i) => i.placed),
}))
