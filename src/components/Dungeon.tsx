import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { dungeonSocket } from '../lib/socket'
import Teleport from './Teleport'

interface Enemy { id: string; name: string; hp: number; maxHp: number }
interface DungeonState { id: string; floor: number; enemies: Enemy[] }

const TORCHES = [5, 20, 35, 65, 80, 95]
const SKULLS  = [15, 40, 60, 85]
const BATS    = [{ x: 15, delay: 0 }, { x: 55, delay: 2 }, { x: 80, delay: 4 }]
const PILLARS = [0, 25, 50, 75, 100]

export default function Dungeon() {
  const [state, setState] = useState<DungeonState | null>(null)
  const [log, setLog] = useState<string[]>([])
  const [_floorClear, setFloorClear] = useState(false)

  useEffect(() => {
    dungeonSocket.connect()
    dungeonSocket.emit('enter')
    dungeonSocket.on('dungeon:state', (s: DungeonState) => { setState(s); setFloorClear(false) })
    dungeonSocket.on('dungeon:floor_clear', ({ floor }: { floor: number }) => {
      setLog((l) => [`🎉 Floor ${floor} クリア！`, ...l.slice(0, 9)])
      setFloorClear(true)
    })
    return () => {
      dungeonSocket.off('dungeon:state')
      dungeonSocket.off('dungeon:floor_clear')
      dungeonSocket.disconnect()
    }
  }, [])

  const attack = (enemyId: string, enemyName: string) => {
    if (!state) return
    dungeonSocket.emit('attack', { roomId: state.id, enemyId })
    setLog((l) => [`⚔️ ${enemyName}を攻撃！`, ...l.slice(0, 9)])
  }

  return (
    <div
      className="relative w-full h-screen overflow-hidden flex flex-col"
      style={{ background: 'linear-gradient(180deg, #0d0d1a 0%, #1a1a2e 50%, #0d0d0d 100%)' }}
    >
      {PILLARS.map((x, i) => (
        <div key={i} className="absolute bottom-0 text-5xl select-none pointer-events-none opacity-30"
          style={{ left: `${x}%`, transform: 'translateX(-50%)' }}>
          🏛️
        </div>
      ))}

      {TORCHES.map((x, i) => (
        <div key={i} className="absolute select-none pointer-events-none" style={{ left: `${x}%`, top: '15%' }}>
          <motion.div
            className="text-3xl"
            animate={{ scale: [1, 1.15, 0.95, 1.1, 1], rotate: [-3, 3, -2, 2, 0] }}
            transition={{ duration: 0.8 + i * 0.1, repeat: Infinity, ease: 'easeInOut' }}
          >🔥</motion.div>
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ background: 'radial-gradient(circle, rgba(255,150,0,0.3) 0%, transparent 70%)', width: 60, height: 60, transform: 'translate(-50%, -50%)', top: '50%', left: '50%' }}
          />
        </div>
      ))}

      {SKULLS.map((x, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl select-none pointer-events-none opacity-40"
          style={{ left: `${x}%`, bottom: '12%' }}
          animate={{ rotate: [-5, 5, -5] }}
          transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut' }}
        >💀</motion.div>
      ))}

      {BATS.map((b, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl select-none pointer-events-none"
          style={{ left: `${b.x}%`, top: '30%' }}
          animate={{ x: [0, 40, 80, 40, 0], y: [0, -20, 5, -15, 0] }}
          transition={{ duration: 6 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: b.delay }}
        >🦇</motion.div>
      ))}

      <div className="absolute bottom-0 w-full h-16 opacity-20 select-none pointer-events-none flex items-end justify-around text-4xl">
        {'🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨'.split('').map((s, i) => <span key={i}>{s}</span>)}
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <div className="bg-white/10 rounded-2xl px-4 py-2 text-white font-bold text-sm">
          ⚔️ {state ? `Floor ${state.floor}` : '接続中...'}
        </div>
        <Teleport />
      </div>

      <div className="flex-1 flex items-center justify-center gap-8 px-8 relative z-10">
        {state?.enemies.map((enemy) => (
          <motion.div
            key={enemy.id}
            className="flex flex-col items-center gap-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <motion.div
              className="text-6xl"
              animate={{ y: [0, -8, 0], rotate: [-3, 3, -3] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >👾</motion.div>
            <p className="text-white font-bold">{enemy.name}</p>
            <div className="w-32 h-3 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full transition-all"
                style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} />
            </div>
            <p className="text-white/60 text-xs">{enemy.hp}/{enemy.maxHp}</p>
            <button
              onClick={() => attack(enemy.id, enemy.name)}
              className="mt-1 px-4 py-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm transition-colors"
            >攻撃</button>
          </motion.div>
        ))}
        {state?.enemies.length === 0 && (
          <p className="text-white/60 text-lg">次のフロアへ...</p>
        )}
      </div>

      <div className="absolute bottom-4 left-4 bg-black/60 border border-white/10 rounded-xl p-3 w-56 max-h-32 overflow-y-auto z-10">
        {log.map((l, i) => (
          <p key={i} className="text-xs text-white/70">{l}</p>
        ))}
      </div>
    </div>
  )
}
