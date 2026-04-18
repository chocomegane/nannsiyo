import { createContext, useContext } from 'react'

export const PlayerIdContext = createContext<{ playerId: string; logout: () => void }>({ playerId: '', logout: () => {} })
export const usePlayerId = () => useContext(PlayerIdContext)
