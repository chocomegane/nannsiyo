import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { usePetStore } from '../store/petStore'
import { usePlayerStore } from '../store/playerStore'
import { startDropLoop } from '../systems/dropSystem'
import type { Skill } from '../types'
import Pet from './Pet'
import DroppedItem from './DroppedItem'
import MoneyDisplay from './MoneyDisplay'
import InventoryPanel from './InventoryPanel'
import FoodMenu from './FoodMenu'
import SkillPanel from './SkillPanel'
import LevelUpEffect from './LevelUpEffect'
import SkillEffect from './SkillEffect'

export default function Room() {
  const pet = usePetStore((s) => s.pet)
  const levelUpPending = usePetStore((s) => s.levelUpPending)
  const clearLevelUpPending = usePetStore((s) => s.clearLevelUpPending)
  const updateStats = usePetStore((s) => s.updateStats)
  const { droppedItems, addDroppedItem, collectItem } = usePlayerStore()
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null)

  // ドロップループ
  useEffect(() => {
    const stop = startDropLoop(() => usePetStore.getState().pet, addDroppedItem)
    return stop
  }, [addDroppedItem])

  // 空腹・幸福の時間経過減少（30秒ごとに-1）
  useEffect(() => {
    const id = setInterval(() => updateStats(-0.5, -1), 30_000)
    return () => clearInterval(id)
  }, [updateStats])

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #87ceeb 0%, #87ceeb 55%, #8bc34a 55%, #6aa84f 100%)' }}
    >
      {/* 右上: 所持金・スキル・食事 */}
      <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
        <MoneyDisplay />
        <div className="flex gap-2">
          <FoodMenu />
          <SkillPanel onUseSkill={setActiveSkill} />
        </div>
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

      {/* レベルアップエフェクト */}
      <LevelUpEffect
        level={pet.level}
        visible={levelUpPending}
        onDone={clearLevelUpPending}
      />

      {/* スキルエフェクト */}
      <SkillEffect skill={activeSkill} onDone={() => setActiveSkill(null)} />

      {/* ヒント */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm select-none whitespace-nowrap">
        アイテムをクリックして回収 → 「全部売る」でお金に変換
      </div>
    </div>
  )
}
