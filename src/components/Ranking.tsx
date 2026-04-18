import { useEffect, useState } from 'react'
import Teleport from './Teleport'
import { usePlayerStore } from '../store/playerStore'
import { ACHIEVEMENTS } from '../data/achievements'
import { useAchievementStore } from '../store/achievementStore'

interface RankEntry {
  id: string
  name: string
  money: number
  total_earned: number
  sell_count: number
}

export default function Ranking() {
  const [ranking, setRanking] = useState<RankEntry[]>([])
  const [loading, setLoading] = useState(true)
  const playerMoney = usePlayerStore((s) => s.money)
  const unlocked = useAchievementStore((s) => s.unlocked)

  useEffect(() => {
    const API = import.meta.env.VITE_API_URL ?? ''
    fetch(`${API}/api/ranking`)
      .then((r) => r.json())
      .then((data: RankEntry[]) => { setRanking(data); setLoading(false) })
      .catch(() => {
        // オフライン時はローカルデータのみ表示
        setRanking([{ id: 'local', name: 'あなた', money: playerMoney, total_earned: 0, sell_count: 0 }])
        setLoading(false)
      })
  }, [playerMoney])

  return (
    <div
      className="relative w-full h-screen overflow-hidden flex flex-col"
      style={{ background: 'linear-gradient(135deg, #1e3c72, #2a5298)' }}
    >
      <div className="absolute top-4 right-4 z-10">
        <Teleport />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-16 pb-8">
        <h1 className="text-3xl font-black text-white text-center mb-6">🏆 ランキング</h1>

        {/* ランキング表 */}
        <div className="bg-white/10 rounded-2xl overflow-hidden mb-6">
          {loading ? (
            <p className="text-white/60 text-center py-8">読み込み中...</p>
          ) : ranking.map((entry, i) => (
            <div key={entry.id} className={`flex items-center gap-3 px-4 py-3 border-b border-white/10 last:border-none ${i === 0 ? 'bg-yellow-500/20' : i === 1 ? 'bg-gray-300/10' : i === 2 ? 'bg-orange-400/10' : ''}`}>
              <span className="text-2xl w-8 text-center">{['🥇','🥈','🥉'][i] ?? `${i+1}`}</span>
              <span className="flex-1 text-white font-bold">{entry.name}</span>
              <span className="text-yellow-300 font-bold">{entry.money.toLocaleString()}G</span>
            </div>
          ))}
        </div>

        {/* 実績 */}
        <h2 className="text-xl font-black text-white mb-3">🏅 実績</h2>
        <div className="grid grid-cols-2 gap-2">
          {ACHIEVEMENTS.map((ach) => {
            const done = unlocked.includes(ach.id)
            return (
              <div key={ach.id} className={`rounded-xl p-3 flex items-center gap-2 ${done ? 'bg-yellow-400/20' : 'bg-white/5 opacity-50'}`}>
                <span className="text-2xl">{ach.emoji}</span>
                <div>
                  <p className="text-white text-sm font-bold">{ach.name}</p>
                  <p className="text-white/60 text-xs">{ach.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
