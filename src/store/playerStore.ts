import { create } from 'zustand'
import type { DroppedItem, FoodItem } from '../types'
import { FOOD_TABLE } from '../data/foods'
import { usePetStore } from './petStore'
import { generateId } from '../lib/uuid'

interface PlayerState {
  playerName: string
  money: number
  inventory: DroppedItem[]
  droppedItems: DroppedItem[]
  foodInventory: FoodItem[]
  addDroppedItem: (item: DroppedItem) => void
  collectItem: (id: string) => void
  sellAll: () => void
  buyFood: (foodId: string) => boolean
  useFood: (foodItemId: string) => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  playerName: 'プレイヤー1',
  money: 0,
  inventory: [],
  droppedItems: [],
  foodInventory: [],

  addDroppedItem: (item) =>
    set((state) => ({ droppedItems: [...state.droppedItems, item] })),

  collectItem: (id) =>
    set((state) => {
      const item = state.droppedItems.find((i) => i.id === id)
      if (!item) return {}
      // アイテム回収で経験値獲得
      usePetStore.getState().gainExp(10)
      return {
        droppedItems: state.droppedItems.filter((i) => i.id !== id),
        inventory: [...state.inventory, item],
      }
    }),

  sellAll: () =>
    set((state) => {
      const earned = state.inventory.reduce((sum, i) => sum + i.sellPrice, 0)
      if (earned > 0) usePetStore.getState().gainExp(Math.floor(earned / 10))
      return { money: state.money + earned, inventory: [] }
    }),

  buyFood: (foodId) => {
    const food = FOOD_TABLE.find((f) => f.foodId === foodId)
    if (!food) return false
    const { money } = get()
    if (money < food.price) return false
    const newItem: FoodItem = {
      id: generateId(),
      foodId: food.foodId,
      name: food.name,
      price: food.price,
    }
    set((state) => ({
      money: state.money - food.price,
      foodInventory: [...state.foodInventory, newItem],
    }))
    return true
  },

  useFood: (foodItemId) =>
    set((state) => {
      const item = state.foodInventory.find((f) => f.id === foodItemId)
      if (!item) return {}
      usePetStore.getState().feedPet(item.foodId)
      return { foodInventory: state.foodInventory.filter((f) => f.id !== foodItemId) }
    }),
}))
