import { useState } from 'react'
import { useFurnitureStore } from '../store/furnitureStore'
import { usePlayerStore } from '../store/playerStore'
import { FURNITURE_TABLE } from '../data/furniture'
import Teleport from './Teleport'
import PetOverlay from './PetOverlay'

export default function FurnitureShop() {
  const [tab, setTab] = useState<'shop' | 'owned'>('shop')
  const { items, buyFurniture, togglePlace } = useFurnitureStore()
  const money = usePlayerStore((s) => s.money)

  const ownedIds = items.map((i) => i.furnitureId)

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col"
      style={{ background: 'linear-gradient(180deg, #ffecd2 0%, #fcb69f 100%)' }}>

      <div className="absolute top-4 right-4 z-10"><Teleport /></div>

      <div className="flex-1 flex flex-col p-6 pt-16 gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-orange-800">🏠 インテリアショップ</h1>
          <span className="bg-yellow-400 text-yellow-900 font-bold px-3 py-1 rounded-full text-sm">
            💰 {money.toLocaleString()}G
          </span>
        </div>

        <div className="flex rounded-xl bg-white/50 p-1 gap-1">
          <button onClick={() => setTab('shop')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${tab === 'shop' ? 'bg-white shadow text-orange-700' : 'text-gray-500'}`}>
            🛒 ショップ
          </button>
          <button onClick={() => setTab('owned')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${tab === 'owned' ? 'bg-white shadow text-orange-700' : 'text-gray-500'}`}>
            📦 所持中 ({items.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === 'shop' && (
            <div className="grid grid-cols-2 gap-3">
              {FURNITURE_TABLE.map((f) => {
                const owned = ownedIds.includes(f.furnitureId)
                return (
                  <div key={f.furnitureId}
                    className="bg-white rounded-2xl p-3 shadow flex flex-col items-center gap-2">
                    <span className="text-4xl">{f.emoji}</span>
                    <p className="text-sm font-bold text-gray-700">{f.name}</p>
                    <p className="text-xs text-yellow-600 font-bold">{f.price}G</p>
                    <button
                      onClick={() => buyFurniture(f.furnitureId)}
                      disabled={money < f.price}
                      className="w-full py-1.5 rounded-xl text-xs font-bold transition-colors bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white">
                      {owned ? 'もう1つ買う' : '購入'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {tab === 'owned' && (
            <div className="flex flex-col gap-2">
              {items.length === 0 && (
                <p className="text-center text-gray-400 text-sm mt-8">まだ家具がありません</p>
              )}
              {items.map((item) => {
                const master = FURNITURE_TABLE.find((f) => f.furnitureId === item.furnitureId)
                return (
                  <div key={item.id} className="bg-white rounded-2xl px-4 py-3 shadow flex items-center gap-3">
                    <span className="text-3xl">{master?.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-700">{item.name}</p>
                      <p className="text-xs text-gray-400">{master?.slot}</p>
                    </div>
                    <button
                      onClick={() => togglePlace(item.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${item.placed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
                      {item.placed ? '配置中 ✓' : '配置する'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <PetOverlay />
    </div>
  )
}
