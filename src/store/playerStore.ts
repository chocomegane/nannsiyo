import { create } from 'zustand'
import { DroppedItem } from '../types'

interface PlayerState {
  playerName: string
  money: number
  inventory: DroppedItem[]
  droppedItems: DroppedItem[]
  addDroppedItem: (item: DroppedItem) => void
  collectItem: (id: string) => void
  sellAll: () => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
  playerName: 'プレイヤー1',
  money: 0,
  inventory: [],
  droppedItems: [],

  addDroppedItem: (item) =>
    set((state) => ({ droppedItems: [...state.droppedItems, item] })),

  collectItem: (id) =>
    set((state) => {
      const item = state.droppedItems.find((i) => i.id === id)
      if (!item) return {}
      return {
        droppedItems: state.droppedItems.filter((i) => i.id !== id),
        inventory: [...state.inventory, item],
      }
    }),

  sellAll: () =>
    set((state) => {
      const earned = state.inventory.reduce((sum, i) => sum + i.sellPrice, 0)
      return { money: state.money + earned, inventory: [] }
    }),
}))
