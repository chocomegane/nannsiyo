import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { parkSocket } from '../lib/socket'
import { useWorldStore } from '../store/worldStore'
import { usePetStore } from '../store/petStore'
import { usePlayerStore } from '../store/playerStore'
import Teleport from './Teleport'

const SPECIES_EMOJI: Record<string, string> = {
  dragon: '🐉', unicorn: '🦄', slime: '🟢', phoenix: '🦅', golem: '🪨',
}

export default function Park() {
  const { onlinePlayers, setOnlinePlayers, updatePlayerPos, removePlayer, addPlayer } = useWorldStore()
  const pet = usePetStore((s) => s.pet)
  const playerName = usePlayerStore((s) => s.playerName)
  const myPos = useRef({ x: 50, y: 50 })

  useEffect(() => {
    parkSocket.connect()
    parkSocket.emit('join', {
      id: parkSocket.id,
      name: playerName,
      petEmoji: SPECIES_EMOJI[pet.species] ?? '🐾',
    })
    parkSocket.on('players', setOnlinePlayers)
    parkSocket.on('player:join', addPlayer)
    parkSocket.on('player:move', ({ id, x, y }: { id: string; x: number; y: number }) => updatePlayerPos(id, x, y))
    parkSocket.on('player:leave', ({ id }: { id: string }) => removePlayer(id))
    return () => {
      parkSocket.off('players')
      parkSocket.off('player:join')
      parkSocket.off('player:move')
      parkSocket.off('player:leave')
      parkSocket.disconnect()
    }
  }, [addPlayer, pet.species, playerName, removePlayer, setOnlinePlayers, updatePlayerPos])

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    myPos.current = { x, y }
    parkSocket.emit('move', { x, y })
  }

  return (
    <div
      className="relative w-full h-screen overflow-hidden cursor-pointer"
      style={{ background: 'linear-gradient(180deg, #a8edea 0%, #fed6e3 100%)' }}
      onClick={handleClick}
    >
      <div className="absolute top-4 left-4 bg-white/80 rounded-2xl px-4 py-2 shadow text-sm font-bold text-green-700">
        🌳 公園 — クリックで移動
      </div>
      <div className="absolute top-4 right-4 z-10">
        <Teleport />
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-xs">
        オンライン: {onlinePlayers.length}人
      </div>

      {onlinePlayers.map((p) => (
        <motion.div
          key={p.id}
          className="absolute flex flex-col items-center select-none"
          animate={{ left: `${p.x}%`, top: `${p.y}%` }}
          transition={{ type: 'spring', stiffness: 150 }}
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          <span className="text-4xl">{p.petEmoji}</span>
          <span className="text-xs text-white bg-black/30 rounded px-1">{p.name}</span>
        </motion.div>
      ))}
    </div>
  )
}
