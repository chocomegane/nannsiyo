import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePetStore } from '../store/petStore'
import { usePlayerStore } from '../store/playerStore'
import { useWorldStore } from '../store/worldStore'
import { useAchievementStore } from '../store/achievementStore'
import { usePlayerId } from '../lib/playerContext'
import { startDropLoop } from '../systems/dropSystem'
import { ACHIEVEMENTS } from '../data/achievements'
import { loadState } from '../lib/api'
import type { Skill, FurnitureItem } from '../types'
import Pet from './Pet'
import DroppedItem from './DroppedItem'
import MoneyDisplay from './MoneyDisplay'
import InventoryPanel from './InventoryPanel'
import FoodMenu from './FoodMenu'
import SkillPanel from './SkillPanel'
import LevelUpEffect from './LevelUpEffect'
import SkillEffect from './SkillEffect'
import Teleport from './Teleport'
import AccountMenu from './AccountMenu'
import RoomDecorations from './RoomDecorations'
import PetOverlay from './PetOverlay'
import BgmPlayer from './BgmPlayer'
import PixelPetCanvas from './PixelPetCanvas'
import type { Species } from '../lib/pixelpet'

interface VisitData {
  species: string
  petName: string
  petLevel: number
  furniture: FurnitureItem[]
}

export default function Room() {
  const { playerId, logout } = usePlayerId()
  const pet = usePetStore((s) => s.pet)
  const levelUpPending = usePetStore((s) => s.levelUpPending)
  const clearLevelUpPending = usePetStore((s) => s.clearLevelUpPending)
  const updateStats = usePetStore((s) => s.updateStats)
  const { droppedItems, addDroppedItem, collectItem } = usePlayerStore()
  const { check, newUnlock, clearNewUnlock } = useAchievementStore()
  const { visitingRoom, setVisitingRoom } = useWorldStore()
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null)
  const [visitData, setVisitData] = useState<VisitData | null>(null)
  const itemsCollected = useRef(0)

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

  // 実績チェック
  useEffect(() => {
    const { money } = usePlayerStore.getState()
    check({
      money,
      totalEarned: money,
      level: pet.level,
      itemsCollected: itemsCollected.current,
      skillsUnlocked: pet.unlockedSkills.length,
    })
  }, [check, pet.level, pet.unlockedSkills.length])

  // フレンドの部屋データ読み込み
  useEffect(() => {
    if (!visitingRoom) { setVisitData(null); return }
    loadState(visitingRoom.playerId).then((data) => {
      if (!data) return
      const p = data.pet
      setVisitData({
        species: p ? p.species : 'dragon',
        petName: p ? p.name : '？',
        petLevel: p ? p.level : 1,
        furniture: (data.furniture ?? []).map((f: { id: string; furniture_id: string; name: string; placed: number }) => ({
          id: f.id, furnitureId: f.furniture_id, name: f.name, placed: f.placed === 1,
        })),
      })
    })
  }, [visitingRoom])

  const handleCollect = (id: string) => {
    collectItem(id)
    itemsCollected.current++
  }

  const newAch = ACHIEVEMENTS.find((a) => a.id === newUnlock)

  if (visitingRoom) {
    return (
      <div
        className="relative w-full h-screen overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #87ceeb 0%, #87ceeb 55%, #8bc34a 55%, #6aa84f 100%)' }}
      >
        {/* 訪問バナー */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-pink-100 border border-pink-300 rounded-2xl px-5 py-2 shadow text-pink-700 font-bold text-sm flex items-center gap-2">
          🏠 {visitingRoom.playerName}の部屋を訪問中
          <button
            onClick={() => setVisitingRoom(null)}
            className="ml-2 px-3 py-1 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-bold transition-colors"
          >戻る</button>
        </div>

        {/* フレンドのペット */}
        {visitData && (
          <div className="absolute left-1/2 top-[28%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center select-none">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <PixelPetCanvas species={visitData.species as Species} level={visitData.petLevel} size={128} />
            </motion.div>
            <span className="mt-2 text-white bg-black/40 rounded-full px-3 py-1 text-sm font-bold">
              {visitData.petName} Lv.{visitData.petLevel}
            </span>
          </div>
        )}

        {visitData && <RoomDecorations overrideItems={visitData.furniture} />}

        {/* 訪問者オーバーレイ（同じ部屋にいるフレンド） */}
        <PetOverlay visitScene={`room_${visitingRoom.playerId}`} />

        {/* 左上: 戻るボタン（モバイル用） */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-xs select-none">
          {visitingRoom.playerName}の部屋
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #87ceeb 0%, #87ceeb 55%, #8bc34a 55%, #6aa84f 100%)' }}
    >
      {/* 右上: 所持金・スキル・食事 */}
      <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
        <div className="flex gap-2 items-center">
          <MoneyDisplay />
          <AccountMenu playerId={playerId} onLogout={logout} />
        </div>
        <div className="flex gap-2">
          <FoodMenu />
          <SkillPanel onUseSkill={setActiveSkill} />
        </div>
      </div>

      {/* 左上: テレポート・BGM */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Teleport />
        <BgmPlayer />
      </div>

      {/* ペット（中央上寄り） */}
      <div className="absolute left-1/2 top-[28%] -translate-x-1/2 -translate-y-1/2">
        <Pet pet={pet} />
      </div>

      {/* ドロップアイテム */}
      <AnimatePresence>
        {droppedItems.map((item) => (
          <DroppedItem key={item.id} item={item} onCollect={handleCollect} />
        ))}
      </AnimatePresence>

      <RoomDecorations />

      {/* インベントリパネル */}
      <InventoryPanel />

      {/* レベルアップエフェクト */}
      <LevelUpEffect level={pet.level} visible={levelUpPending} onDone={clearLevelUpPending} />

      {/* スキルエフェクト */}
      <SkillEffect skill={activeSkill} onDone={() => setActiveSkill(null)} />

      {/* 実績解放トースト */}
      <AnimatePresence>
        {newAch && (
          <motion.div
            className="absolute top-20 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 font-bold px-6 py-3 rounded-2xl shadow-xl z-50 flex items-center gap-2"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            onAnimationComplete={() => setTimeout(clearNewUnlock, 2500)}
          >
            {newAch.emoji} 実績解放: {newAch.name}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ヒント */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm select-none whitespace-nowrap">
        アイテムをクリックして回収 → 「全部売る」でお金に変換
      </div>
    </div>
  )
}
