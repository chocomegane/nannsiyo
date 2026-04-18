import { usePlayerStore } from '../store/playerStore'
import { usePetStore } from '../store/petStore'

interface Props { onClose: () => void }

export default function StatsPanel({ onClose }: Props) {
  const totalEarned = usePlayerStore((s) => s.totalEarned)
  const battleWins = usePlayerStore((s) => s.battleWins)
  const itemsCollected = usePlayerStore((s) => s.itemsCollected)
  const pet = usePetStore((s) => s.pet)

  const stats = [
    { label: '総獲得金額', value: `${totalEarned.toLocaleString()}G`, emoji: '💰' },
    { label: 'バトル勝利数', value: `${battleWins}回`, emoji: '⚔️' },
    { label: 'アイテム回収数', value: `${itemsCollected}個`, emoji: '📦' },
    { label: 'ペットレベル', value: `Lv.${pet.level}`, emoji: '⭐' },
    { label: '解放スキル数', value: `${pet.unlockedSkills.length}個`, emoji: '✨' },
    { label: '幸福度', value: `${pet.stats.happiness}`, emoji: '😊' },
    { label: '満腹度', value: `${pet.stats.hunger}`, emoji: '🍖' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-72" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-700 text-lg">📊 プレイ統計</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="flex flex-col gap-2">
          {stats.map((s) => (
            <div key={s.label} className="flex justify-between items-center bg-gray-50 rounded-xl px-3 py-2">
              <span className="text-sm text-gray-500">{s.emoji} {s.label}</span>
              <span className="font-bold text-gray-800 text-sm">{s.value}</span>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-4 w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors">
          閉じる
        </button>
      </div>
    </div>
  )
}
