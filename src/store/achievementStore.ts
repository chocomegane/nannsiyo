import { create } from 'zustand'
import { ACHIEVEMENTS } from '../data/achievements'
import type { AchievementStats } from '../data/achievements'

interface AchievementState {
  unlocked: string[]
  newUnlock: string | null
  check: (stats: AchievementStats) => void
  clearNewUnlock: () => void
}

export const useAchievementStore = create<AchievementState>((set, get) => ({
  unlocked: [],
  newUnlock: null,

  check: (stats) => {
    const { unlocked } = get()
    for (const ach of ACHIEVEMENTS) {
      if (!unlocked.includes(ach.id) && ach.check(stats)) {
        set({ unlocked: [...unlocked, ach.id], newUnlock: ach.id })
        return
      }
    }
  },

  clearNewUnlock: () => set({ newUnlock: null }),
}))
