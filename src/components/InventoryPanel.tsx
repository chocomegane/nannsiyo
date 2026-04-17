import { usePlayerStore } from '../store/playerStore'

export default function InventoryPanel() {
  const inventory = usePlayerStore((s) => s.inventory)

  if (inventory.length === 0) return null

  return (
    <div className="absolute bottom-4 left-4 bg-white/90 rounded-2xl shadow-lg p-3 w-52 max-h-56 overflow-y-auto">
      <p className="text-xs font-bold text-gray-500 mb-2">📦 インベントリ ({inventory.length})</p>
      <ul className="flex flex-col gap-1">
        {inventory.map((item) => (
          <li key={item.id} className="flex justify-between text-xs text-gray-700 bg-gray-50 rounded-lg px-2 py-1">
            <span>✨ {item.name}</span>
            <span className="font-bold text-yellow-700">{item.sellPrice}G</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
