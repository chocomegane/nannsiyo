import { create } from 'zustand'
import type { Pet } from '../types'
import { FOOD_TABLE } from '../data/foods'
import { getSkillsByLevel } from '../data/skills'
import { expToNextLevel, MAX_LEVEL } from '../data/experience'

interface PetState {
  pet: Pet
  levelUpPending: boolean
  feedPet: (foodId: string) => void
  gainExp: (amount: number) => void
  updateStats: (happinessDelta: number, hungerDelta: number) => void
  clearLevelUpPending: () => void
}

const clamp = (v: number) => Math.max(0, Math.min(100, v))

export const usePetStore = create<PetState>((set) => ({
  pet: {
    id: 'pet-1',
    name: 'ドラゴン',
    species: 'dragon',
    level: 1,
    exp: 0,
    stats: { happiness: 80, hunger: 60 },
    appearance: { colorFilter: 'none', scale: 1, glow: false },
    unlockedSkills: [],
  },
  levelUpPending: false,

  feedPet: (foodId) =>
    set((state) => {
      const food = FOOD_TABLE.find((f) => f.foodId === foodId)
      if (!food) return {}
      const { happinessDelta, hungerDelta, colorEffect, sizeEffect, glowEffect, duration } = food.effect
      const newAppearance = {
        colorFilter: colorEffect ?? 'none',
        scale: sizeEffect ?? 1,
        glow: glowEffect ?? false,
      }
      if (duration) {
        setTimeout(() => {
          usePetStore.setState((s) => ({
            pet: { ...s.pet, appearance: { colorFilter: 'none', scale: 1, glow: false } },
          }))
        }, duration)
      }
      return {
        pet: {
          ...state.pet,
          stats: {
            happiness: clamp(state.pet.stats.happiness + happinessDelta),
            hunger: clamp(state.pet.stats.hunger + hungerDelta),
          },
          appearance: newAppearance,
        },
      }
    }),

  gainExp: (amount) =>
    set((state) => {
      const pet = state.pet
      if (pet.level >= MAX_LEVEL) return {}
      const newExp = pet.exp + amount
      const needed = expToNextLevel(pet.level)
      if (newExp >= needed) {
        const newLevel = pet.level + 1
        const newSkills = getSkillsByLevel(newLevel).map((s) => s.id)
        return {
          pet: { ...pet, level: newLevel, exp: newExp - needed, unlockedSkills: newSkills },
          levelUpPending: true,
        }
      }
      return { pet: { ...pet, exp: newExp } }
    }),

  updateStats: (happinessDelta, hungerDelta) =>
    set((state) => ({
      pet: {
        ...state.pet,
        stats: {
          happiness: clamp(state.pet.stats.happiness + happinessDelta),
          hunger: clamp(state.pet.stats.hunger + hungerDelta),
        },
      },
    })),

  clearLevelUpPending: () => set({ levelUpPending: false }),
}))
