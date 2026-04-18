import { useState } from 'react'
import { usePlayerStore } from '../store/playerStore'
import { FOOD_TABLE } from '../data/foods'

export default function FoodMenu() {
  const [open, setOpen] = useState(false)
  const { money, foodInventory, buyFood, useFood } = usePlayerStore()

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="bg-white/90 rounded-2xl px-4 py-2 shadow-lg font-bold text-sm text-green-700 hover:bg-white transition-colors"
      >
        🍽️ 食事
        {foodInventory.length > 0 && (
          <span className="ml-1 bg-green-600 text-white rounded-full px-1.5 py-0.5 text-xs">
            {foodInventory.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-12 right-0 bg-white rounded-2xl shadow-xl p-3 w-64 z-20">
          {/* 所持食べ物 */}
          {foodInventory.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-bold text-gray-400 mb-1">所持中</p>
              <div className="flex flex-wrap gap-1">
                {foodInventory.map((item) => {
                  const master = FOOD_TABLE.find((f) => f.foodId === item.foodId)
                  return (
                    <button
                      key={item.id}
                      onClick={() => { useFood(item.id); setOpen(false) }}
                      className="bg-green-100 hover:bg-green-200 rounded-xl px-2 py-1 text-sm"
                      title={`${item.name}を使う`}
                    >
                      {master?.emoji} {item.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ショップ */}
          <p className="text-xs font-bold text-gray-400 mb-1">購入（所持金: {money.toLocaleString()}G）</p>
          <ul className="flex flex-col gap-1">
            {FOOD_TABLE.map((food) => (
              <li key={food.foodId}>
                <button
                  onClick={() => buyFood(food.foodId)}
                  disabled={money < food.price}
                  className="w-full flex justify-between items-center px-2 py-1 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  <span>{food.emoji} {food.name}</span>
                  <span className="font-bold text-yellow-700">{food.price}G</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
