import { create } from 'zustand'
import type { Scene } from '../types'

interface OnlinePlayer {
  id: string
  name: string
  petEmoji: string
  x: number
  y: number
}

interface WorldState {
  scene: Scene
  onlinePlayers: OnlinePlayer[]
  visitingRoom: { playerId: string; playerName: string } | null
  setScene: (scene: Scene) => void
  setOnlinePlayers: (players: OnlinePlayer[]) => void
  updatePlayerPos: (id: string, x: number, y: number) => void
  removePlayer: (id: string) => void
  addPlayer: (player: OnlinePlayer) => void
  setVisitingRoom: (room: { playerId: string; playerName: string } | null) => void
}

export const useWorldStore = create<WorldState>((set) => ({
  scene: 'room',
  onlinePlayers: [],
  visitingRoom: null,
  setScene: (scene) => set({ scene }),
  setVisitingRoom: (visitingRoom) => set({ visitingRoom }),
  setOnlinePlayers: (players) => set({ onlinePlayers: players }),
  updatePlayerPos: (id, x, y) =>
    set((state) => ({
      onlinePlayers: state.onlinePlayers.map((p) => p.id === id ? { ...p, x, y } : p),
    })),
  removePlayer: (id) =>
    set((state) => ({ onlinePlayers: state.onlinePlayers.filter((p) => p.id !== id) })),
  addPlayer: (player) =>
    set((state) => ({ onlinePlayers: [...state.onlinePlayers.filter((p) => p.id !== player.id), player] })),
}))
