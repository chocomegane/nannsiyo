import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { parkSocket } from '../lib/socket'
import { useWorldStore } from '../store/worldStore'
import { usePetStore } from '../store/petStore'
import { usePlayerStore } from '../store/playerStore'
import Teleport from './Teleport'

const SPECIES_EMOJI: Record<string, string> = {
  dragon: '🐉', unicorn: '🦄', slime: '🟢', phoenix: '🦅', golem: '🪨',
}

const CLOUDS = [
  { x: 5,  y: 8,  size: 'text-5xl', delay: 0,   dur: 18 },
  { x: 30, y: 4,  size: 'text-4xl', delay: 4,   dur: 22 },
  { x: 60, y: 10, size: 'text-6xl', delay: 8,   dur: 16 },
  { x: 80, y: 6,  size: 'text-3xl', delay: 2,   dur: 20 },
]
const TREES = [
  { x: 2,  size: 'text-7xl' }, { x: 12, size: 'text-8xl' }, { x: 22, size: 'text-6xl' },
  { x: 70, size: 'text-7xl' }, { x: 82, size: 'text-8xl' }, { x: 92, size: 'text-6xl' },
]
const FLOWERS = [
  { x: 18, emoji: '🌸' }, { x: 28, emoji: '🌼' }, { x: 38, emoji: '🌺' },
  { x: 50, emoji: '🌸' }, { x: 62, emoji: '🌼' }, { x: 73, emoji: '🌸' },
]
const OBJECTS = [
  { x: 44, emoji: '🪑', label: 'ベンチ' },
  { x: 55, emoji: '⛲', label: '噴水' },
]

interface ChatMessage { id: string; name: string; petEmoji: string; message: string }
interface SelectedPlayer { name: string; petEmoji: string }

export default function Park() {
  const { onlinePlayers, setOnlinePlayers, updatePlayerPos, removePlayer, addPlayer } = useWorldStore()
  const pet = usePetStore((s) => s.pet)
  const playerName = usePlayerStore((s) => s.playerName)
  const [chatInput, setChatInput] = useState('')
  const [chatBubbles, setChatBubbles] = useState<Map<string, string>>(new Map())
  const [selected, setSelected] = useState<SelectedPlayer | null>(null)

  useEffect(() => {
    const petEmoji = SPECIES_EMOJI[pet.species] ?? '🐾'

    const onConnect = () => {
      parkSocket.emit('join', {
        id: parkSocket.id,
        name: playerName,
        petEmoji,
      })
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
        const x = 15 + Math.random() * 70
        const y = 55 + Math.random() * 25
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

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #87ceeb 0%, #b8f0a8 55%, #6aa84f 55%, #4a7c3f 100%)' }}
    >
      {CLOUDS.map((c, i) => (
        <motion.div
          key={i}
          className={`absolute select-none pointer-events-none ${c.size}`}
          style={{ left: `${c.x}%`, top: `${c.y}%` }}
          animate={{ x: ['0%', '8%', '0%'] }}
          transition={{ duration: c.dur, repeat: Infinity, delay: c.delay, ease: 'easeInOut' }}
        >☁️</motion.div>
      ))}

      {TREES.map((t, i) => (
        <motion.div
          key={i}
          className={`absolute select-none pointer-events-none ${t.size}`}
          style={{ left: `${t.x}%`, bottom: '40%' }}
          animate={{ rotate: [-1, 1, -1] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
        >🌳</motion.div>
      ))}

      {FLOWERS.map((f, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl select-none pointer-events-none"
          style={{ left: `${f.x}%`, bottom: '38%' }}
          animate={{ rotate: [-5, 5, -5], scale: [1, 1.1, 1] }}
          transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
        >{f.emoji}</motion.div>
      ))}

      {OBJECTS.map((o, i) => (
        <div key={i} className="absolute text-4xl select-none pointer-events-none" style={{ left: `${o.x}%`, bottom: '39%' }}>
          {o.emoji}
        </div>
      ))}

      <motion.div
        className="absolute text-2xl select-none pointer-events-none"
        animate={{ x: [0, 80, 160, 80, 0], y: [0, -30, 0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{ left: '20%', top: '50%' }}
      >🦋</motion.div>
      <motion.div
        className="absolute text-xl select-none pointer-events-none"
        animate={{ x: [0, -60, 0, 60, 0], y: [0, 15, -10, 5, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        style={{ left: '60%', top: '55%' }}
      >🦋</motion.div>

      <div className="absolute top-4 left-4 bg-white/80 rounded-2xl px-4 py-2 shadow text-sm font-bold text-green-700 z-10">
        🌳 公園
      </div>
      <div className="absolute top-4 right-4 z-10">
        <Teleport />
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-xs bg-black/20 rounded-full px-3 py-1">
        オンライン: {onlinePlayers.length}人
      </div>

      {onlinePlayers.map((p) => (
        <motion.div
          key={p.id}
          className="absolute flex flex-col items-center select-none z-10 cursor-pointer"
          animate={{ left: `${p.x}%`, top: `${p.y}%` }}
          transition={{ type: 'spring', stiffness: 150 }}
          style={{ transform: 'translate(-50%, -50%)' }}
          onClick={() => setSelected({ name: p.name, petEmoji: p.petEmoji })}
        >
          {chatBubbles.has(p.id) && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white rounded-2xl px-3 py-1 shadow text-xs text-gray-700 whitespace-nowrap max-w-[140px] truncate border border-gray-100">
              {chatBubbles.get(p.id)}
              <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-gray-100 rotate-45" />
            </div>
          )}
          <motion.span
            className="text-4xl"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >{p.petEmoji}</motion.span>
          <span className="text-xs text-white bg-black/40 rounded-full px-2 py-0.5">{p.name}</span>
        </motion.div>
      ))}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        <input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && chatInput.trim()) {
              parkSocket.emit('chat', chatInput.trim())
              setChatInput('')
            }
          }}
          placeholder="チャット (Enter で送信)"
          className="bg-white/90 rounded-2xl px-4 py-2 text-sm shadow w-56 focus:outline-none focus:ring-2 focus:ring-green-300"
        />
        <button
          onClick={() => { if (chatInput.trim()) { parkSocket.emit('chat', chatInput.trim()); setChatInput('') } }}
          className="bg-green-500 hover:bg-green-600 text-white rounded-2xl px-4 py-2 text-sm font-bold shadow transition-colors"
        >送信</button>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-56 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-6xl mb-2">{selected.petEmoji}</div>
            <p className="font-bold text-gray-700 text-lg mb-3">{selected.name}</p>
            <p className="text-gray-400 text-sm">公園で遊んでいます</p>
            <button onClick={() => setSelected(null)} className="mt-4 w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors">閉じる</button>
          </div>
        </div>
      )}
    </div>
  )
}
