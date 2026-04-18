import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { parkSocket } from '../lib/socket'
import { useWorldStore } from '../store/worldStore'
import { usePetStore } from '../store/petStore'
import { usePlayerStore } from '../store/playerStore'
import BgmPlayer from './BgmPlayer'

const SPECIES_EMOJI: Record<string, string> = {
  dragon: '🐉', unicorn: '🦄', slime: '🟢', phoenix: '🦅', golem: '🪨',
}

interface ChatMessage { id: string; message: string }

export default function PetOverlay() {
  const { onlinePlayers, setOnlinePlayers, updatePlayerPos, removePlayer, addPlayer } = useWorldStore()
  const pet = usePetStore((s) => s.pet)
  const playerName = usePlayerStore((s) => s.playerName)
  const [chatInput, setChatInput] = useState('')
  const [chatBubbles, setChatBubbles] = useState<Map<string, string>>(new Map())

  useEffect(() => {
    const petEmoji = SPECIES_EMOJI[pet.species] ?? '🐾'

    const onConnect = () => {
      parkSocket.emit('join', { id: parkSocket.id, name: playerName, petEmoji })
    }

    parkSocket.on('connect', onConnect)
    parkSocket.on('players', setOnlinePlayers)
    parkSocket.on('player:join', addPlayer)
    parkSocket.on('player:move', ({ id, x, y }: { id: string; x: number; y: number }) => updatePlayerPos(id, x, y))
    parkSocket.on('player:leave', ({ id }: { id: string }) => removePlayer(id))
    parkSocket.on('park:chat', ({ id, message }: ChatMessage) => {
      setChatBubbles((prev) => new Map(prev).set(id, message))
      setTimeout(() => setChatBubbles((prev) => { const m = new Map(prev); m.delete(id); return m }), 4000)
    })

    parkSocket.connect()

    let moveTimer: ReturnType<typeof setTimeout>
    const scheduleMove = () => {
      moveTimer = setTimeout(() => {
        const x = 10 + Math.random() * 80
        const y = 60 + Math.random() * 25
        parkSocket.emit('move', { x, y })
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
    }
  }, [addPlayer, pet.species, playerName, removePlayer, setOnlinePlayers, updatePlayerPos])

  const sendChat = () => {
    if (!chatInput.trim()) return
    parkSocket.emit('chat', chatInput.trim())
    setChatInput('')
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {onlinePlayers.map((p) => (
        <motion.div
          key={p.id}
          className="absolute flex flex-col items-center select-none"
          animate={{ left: `${p.x}%`, top: `${p.y}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          {chatBubbles.has(p.id) && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white rounded-2xl px-3 py-1 shadow text-xs text-gray-700 whitespace-nowrap max-w-[140px] truncate border border-gray-100 pointer-events-none">
              {chatBubbles.get(p.id)}
              <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-gray-100 rotate-45" />
            </div>
          )}
          <motion.span
            className="text-3xl drop-shadow"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1.8 + Math.random(), repeat: Infinity, ease: 'easeInOut' }}
          >{p.petEmoji}</motion.span>
          <span className="text-[10px] text-white bg-black/40 rounded-full px-2 py-0.5 mt-0.5 whitespace-nowrap">{p.name}</span>
        </motion.div>
      ))}

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
