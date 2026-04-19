import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { parkSocket } from '../lib/socket'
import { usePetStore } from '../store/petStore'
import { usePlayerStore } from '../store/playerStore'
import { useWorldStore } from '../store/worldStore'
import BgmPlayer from './BgmPlayer'
import PixelPetCanvas from './PixelPetCanvas'
import type { Species } from '../lib/pixelpet'

interface OnlinePlayer { id: string; name: string; species: string; level: number; x: number; y: number }

interface Props { visitScene?: string }

export default function PetOverlay({ visitScene }: Props) {
  const pet = usePetStore((s) => s.pet)
  const playerName = usePlayerStore((s) => s.playerName)
  const worldScene = useWorldStore((s) => s.scene)
  const scene = visitScene ?? worldScene
  const [players, setPlayers] = useState<OnlinePlayer[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatBubbles, setChatBubbles] = useState<Map<string, string>>(new Map())

  useEffect(() => {
    const onConnect = () => {
      parkSocket.emit('join', { id: parkSocket.id, name: playerName, species: pet.species, level: pet.level, scene })
    }

    parkSocket.on('connect', onConnect)
    parkSocket.on('players', (list: OnlinePlayer[]) => setPlayers(list))
    parkSocket.on('player:join', (p: OnlinePlayer) =>
      setPlayers((prev) => [...prev.filter((x) => x.id !== p.id), p]))
    parkSocket.on('player:move', ({ id, x, y }: { id: string; x: number; y: number }) =>
      setPlayers((prev) => prev.map((p) => p.id === id ? { ...p, x, y } : p)))
    parkSocket.on('player:leave', ({ id }: { id: string }) =>
      setPlayers((prev) => prev.filter((p) => p.id !== id)))
    parkSocket.on('park:chat', ({ id, message }: { id: string; message: string }) => {
      setChatBubbles((prev) => new Map(prev).set(id, message))
      setTimeout(() => setChatBubbles((prev) => { const m = new Map(prev); m.delete(id); return m }), 4000)
    })

    parkSocket.connect()

    let moveTimer: ReturnType<typeof setTimeout>
    const scheduleMove = () => {
      moveTimer = setTimeout(() => {
        parkSocket.emit('move', { x: 10 + Math.random() * 80, y: 60 + Math.random() * 25 })
        scheduleMove()
      }, 4000 + Math.random() * 4000)
    }
    scheduleMove()

    return () => {
      clearTimeout(moveTimer)
      parkSocket.off('connect', onConnect)
      parkSocket.off('players')
      parkSocket.off('player:join')
      parkSocket.off('player:move')
      parkSocket.off('player:leave')
      parkSocket.off('park:chat')
      parkSocket.disconnect()
      setPlayers([])
    }
  }, [pet.species, pet.level, playerName, scene])

  const sendChat = () => {
    if (!chatInput.trim()) return
    parkSocket.emit('chat', chatInput.trim())
    setChatInput('')
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {players.map((p) => {
        const displayY = Math.max(55, Math.min(85, p.y))
        return (
          <motion.div
            key={p.id}
            className="absolute flex flex-col items-center select-none"
            animate={{ left: `${p.x}%`, top: `${displayY}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            {chatBubbles.has(p.id) && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-2xl px-3 py-1 shadow text-xs text-gray-700 whitespace-nowrap max-w-[140px] truncate border border-gray-100 pointer-events-none">
                {chatBubbles.get(p.id)}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-gray-100 rotate-45 -mt-1.5" />
              </div>
            )}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <PixelPetCanvas species={p.species as Species} level={p.level} size={48} />
            </motion.div>
            <span className="text-[10px] text-white bg-black/40 rounded-full px-2 py-0.5 mt-0.5 whitespace-nowrap">{p.name}</span>
          </motion.div>
        )
      })}

      <div className="absolute top-4 left-4 pointer-events-auto">
        <BgmPlayer />
      </div>

      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto">
        <input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') sendChat() }}
          placeholder="チャット (Enter)"
          className="bg-white/90 rounded-2xl px-4 py-2 text-sm shadow w-48 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button
          onClick={sendChat}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-2xl px-4 py-2 text-sm font-bold shadow transition-colors"
        >送信</button>
      </div>
    </div>
  )
}
