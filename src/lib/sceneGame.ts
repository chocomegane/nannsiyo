import { usePetStore } from '../store/petStore'
import { usePlayerStore } from '../store/playerStore'
import { useFurnitureStore } from '../store/furnitureStore'
import type { DroppedItem } from '../types'

export interface GameState {
  playerId: string
  coin: number
  get droppedItems(): DroppedItem[]
  pet: {
    species: string
    stage: number
    lv: number
    xp: number
    hap: number
    hun: number
    name: string
  }
  time: 'day' | 'dusk' | 'night'
  toast(msg: string): void
  setCoin(n: number): void
  collectItem(id: string): void
  sellAll(): void
  feedPet(): void
  petPet(): void
  inventoryTotal(): number
  buyFurniture(furnitureId: string): boolean
  subscribe(cb: () => void): () => void
}

export function buildGameState(toastEl: HTMLElement | null, playerId: string): GameState {
  const pet = usePetStore.getState().pet
  const player = usePlayerStore.getState()
  const stage = pet.level >= 50 ? 3 : pet.level >= 20 ? 2 : 1

  return {
    playerId,
    coin: player.money,
    get droppedItems() { return usePlayerStore.getState().droppedItems },
    pet: {
      species: pet.species,
      stage,
      lv: pet.level,
      xp: Math.min(1, pet.exp / Math.max(1, pet.level * 10)),
      hap: pet.stats.happiness / 100,
      hun: pet.stats.hunger / 100,
      name: pet.name,
    },
    time: 'day',
    toast(msg: string) {
      if (!toastEl) return
      const t = document.createElement('div')
      t.className = 'mg-toast'
      t.textContent = msg
      t.style.cssText = 'position:absolute; right:16px; top:16px; z-index:50;'
      toastEl.appendChild(t)
      setTimeout(() => t.remove(), 2600)
    },
    setCoin(n: number) {
      const next = Math.max(0, n)
      this.coin = next
      usePlayerStore.setState({ money: next })
    },
    collectItem(id: string) {
      usePlayerStore.getState().collectItem(id)
      this.coin = usePlayerStore.getState().money
    },
    sellAll() {
      usePlayerStore.getState().sellAll()
      this.coin = usePlayerStore.getState().money
    },
    feedPet() {
      usePetStore.getState().updateStats(10, 20)
    },
    petPet() {
      usePetStore.getState().updateStats(10, 0)
    },
    inventoryTotal() {
      return usePlayerStore.getState().inventory.reduce((s, i) => s + i.sellPrice, 0)
    },
    buyFurniture(furnitureId: string) {
      return useFurnitureStore.getState().buyFurniture(furnitureId)
    },
    subscribe(cb: () => void) {
      const unsub1 = usePlayerStore.subscribe(cb)
      const unsub2 = usePetStore.subscribe(cb)
      const unsub3 = useFurnitureStore.subscribe(cb)
      return () => { unsub1(); unsub2(); unsub3() }
    },
  }
}
