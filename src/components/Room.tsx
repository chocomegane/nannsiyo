import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { usePetStore } from '../store/petStore'
import { usePlayerStore } from '../store/playerStore'
import { startDropLoop } from '../systems/dropSystem'
import Pet from './Pet'
import DroppedItem from './DroppedItem'
import MoneyDisplay from './MoneyDisplay'
import InventoryPanel from './InventoryPanel'

export default function Room() {
  const pet = usePetStore((s) => s.pet)
  const { droppedItems, addDroppedItem, collectItem } = usePlayerStore()

  useEffect(() => {
    const stop = startDropLoop(() => usePetStore.getState().pet, addDroppedItem)
    return stop
  }, [addDroppedItem])

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #87ceeb 0%, #87ceeb 55%, #8bc34a 55%, #6aa84f 100%)',
      }}
    >
      {/* 所持金・プレイヤー名 */}
      <div className="absolute top-4 right-4 z-10">
        <MoneyDisplay />
      </div>

      {/* ペット（中央上寄り） */}
      <div className="absolute left-1/2 top-[28%] -translate-x-1/2 -translate-y-1/2">
        <Pet pet={pet} />
      </div>

      {/* ドロップアイテム */}
      <AnimatePresence>
        {droppedItems.map((item) => (
          <DroppedItem key={item.id} item={item} onCollect={collectItem} />
        ))}
      </AnimatePresence>

      {/* インベントリパネル */}
      <InventoryPanel />

      {/* ヒント */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm select-none whitespace-nowrap">
        アイテムをクリックして回収 → 「全部売る」でお金に変換
      </div>
    </div>
  )
}
