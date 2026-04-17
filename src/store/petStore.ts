import { create } from 'zustand'
import { Pet } from '../types'

interface PetState {
  pet: Pet
}

export const usePetStore = create<PetState>(() => ({
  pet: {
    id: 'pet-1',
    name: 'ドラゴン',
    species: 'dragon',
    level: 1,
    stats: {
      happiness: 80,
      hunger: 60,
    },
  },
}))
