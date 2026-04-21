import { useState } from 'react'
import { useFurnitureStore } from '../store/furnitureStore'
import { FURNITURE_TABLE } from '../data/furniture'

export default function FurniturePanel() {
  const { items, togglePlace } = useFurnitureStore()
  const [open, setOpen] = useState(false)

  if (items.length === 0) return null

  return (
    <div className="absolute bottom-4 right-4 z-10">
      <button
        onClick={() => setOpen((o) => !o)}
        className="bg-white/90 rounded-2xl px-4 py-2 shadow-lg font-bold text-sm text-amber-700 hover:bg-white transition-colors"
      >
        🛋️ 家具 ({items.filter((i) => i.placed).length}/{items.length})
      </button>

      {open && (
        <div className="absolute bottom-12 right-0 bg-white rounded-2xl shadow-xl p-3 w-56 z-20 max-h-72 overflow-y-auto">
          <p className="text-xs font-bold text-gray-500 mb-2">🛋️ 所持家具</p>
          <div className="flex flex-col gap-2">
            {items.map((item) => {
              const master = FURNITURE_TABLE.find((f) => f.furnitureId === item.furnitureId)
              return (
                <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                  <span className="text-sm">
                    <span className="mr-1">{master?.emoji}</span>
                    {item.name}
                  </span>
                  <button
                    onClick={() => togglePlace(item.id)}
                    className={`text-xs font-bold px-2 py-1 rounded-lg transition-colors ${
                      item.placed
                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {item.placed ? '配置中' : '配置'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
