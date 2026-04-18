import { usePlayerStore } from '../store/playerStore'

export default function MoneyDisplay() {
  const { money, inventory, sellAll } = usePlayerStore()
  const sellTotal = inventory.reduce((s, i) => s + i.sellPrice, 0)

  return (
    <div className="flex items-center gap-3 bg-white/90 rounded-2xl px-4 py-2 shadow-lg">
        <span className="text-2xl">💰</span>
        <span className="text-xl font-bold text-yellow-700">{money.toLocaleString()}G</span>
        <button
          onClick={sellAll}
          disabled={inventory.length === 0}
          className="ml-2 px-3 py-1 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed text-yellow-900 font-bold rounded-xl text-sm transition-colors"
        >
          全部売る
          {inventory.length > 0 && (
            <span className="ml-1 bg-yellow-700 text-white rounded-full px-1.5 py-0.5 text-xs">
              +{sellTotal.toLocaleString()}G
            </span>
          )}
        </button>
    </div>
  )
}
