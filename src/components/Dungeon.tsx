import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { dungeonSocket } from '../lib/socket'
import Teleport from './Teleport'

interface Enemy {
  id: string
  name: string
  hp: number
  maxHp: number
}

interface DungeonState {
  id: string
  floor: number
  enemies: Enemy[]
}

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
      style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)' }}
    >
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <div className="bg-white/10 rounded-2xl px-4 py-2 text-white font-bold text-sm">
          ⚔️ {state ? `Floor ${state.floor}` : '接続中...'}
        </div>
        <Teleport />
      </div>

      {/* 敵一覧 */}
      <div className="flex-1 flex items-center justify-center gap-8 px-8">
        {state?.enemies.map((enemy) => (
          <motion.div
            key={enemy.id}
            className="flex flex-col items-center gap-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <div className="text-6xl">👾</div>
            <p className="text-white font-bold">{enemy.name}</p>
            <div className="w-32 h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all"
                style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
              />
            </div>
            <p className="text-white/60 text-xs">{enemy.hp}/{enemy.maxHp}</p>
            <button
              onClick={() => attack(enemy.id, enemy.name)}
              className="mt-1 px-4 py-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm transition-colors"
            >
              攻撃
            </button>
          </motion.div>
        ))}
        {state?.enemies.length === 0 && (
          <p className="text-white/60 text-lg">次のフロアへ...</p>
        )}
      </div>

      {/* バトルログ */}
      <div className="absolute bottom-4 left-4 bg-black/40 rounded-xl p-3 w-56 max-h-32 overflow-y-auto">
        {log.map((l, i) => (
          <p key={i} className="text-xs text-white/70">{l}</p>
        ))}
      </div>
    </div>
  )
}
