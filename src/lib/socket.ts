import { io } from 'socket.io-client'

const BASE = import.meta.env.VITE_API_URL ?? ''

export const parkSocket = io(`${BASE}/park`, { autoConnect: false })
export const dungeonSocket = io(`${BASE}/dungeon`, { autoConnect: false })
