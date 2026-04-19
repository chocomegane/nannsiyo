import { usePetStore } from '../store/petStore'
import { usePlayerStore } from '../store/playerStore'

export interface GameState {
  coin: number
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
}

export function buildGameState(toastEl: HTMLElement | null): GameState {
  const pet = usePetStore.getState().pet
  const player = usePlayerStore.getState()

  const stage = pet.level >= 50 ? 3 : pet.level >= 20 ? 2 : 1

  return {
    coin: player.money,
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
      t.style.cssText = 'position:absolute; right:16px; top:16px; z-index:50; animation: toastIn 0.3s ease-out;'
      toastEl.appendChild(t)
      setTimeout(() => t.remove(), 2600)
    },
    setCoin(n: number) {
      const next = Math.max(0, n)
      this.coin = next
      usePlayerStore.setState({ money: next })
    },
  }
}
