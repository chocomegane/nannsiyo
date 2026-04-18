import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useWorldStore } from '../store/worldStore'
import type { Scene } from '../types'

const DESTINATIONS: { scene: Scene; label: string; emoji: string }[] = [
  { scene: 'room',      label: '自室',             emoji: '🏠' },
  { scene: 'furniture', label: 'インテリアショップ', emoji: '🛋️' },
  { scene: 'park',      label: '公園',             emoji: '🌳' },
  { scene: 'dungeon',   label: 'ダンジョン',       emoji: '⚔️' },
  { scene: 'lottery',   label: '宝くじ店',         emoji: '🎰' },
  { scene: 'ranking',   label: 'ランキング',       emoji: '🏆' },
]

export default function Teleport() {
  const [open, setOpen] = useState(false)
  const [warping, setWarping] = useState(false)
  const { scene, setScene } = useWorldStore()

  const handleTeleport = (dest: Scene) => {
    if (dest === scene) { setOpen(false); return }
    setWarping(true)
    setTimeout(() => {
      setScene(dest)
      setWarping(false)
      setOpen(false)
    }, 600)
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="bg-white/90 rounded-2xl px-4 py-2 shadow-lg font-bold text-sm text-indigo-700 hover:bg-white transition-colors"
      >
        🌀 テレポート
      </button>

      {open && (
        <div className="absolute top-12 left-0 bg-white rounded-2xl shadow-xl p-3 w-44 z-20">
          {DESTINATIONS.map((d) => (
            <button
              key={d.scene}
              onClick={() => handleTeleport(d.scene)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors mb-1 last:mb-0 ${scene === d.scene ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-50'}`}
            >
              <span>{d.emoji}</span>
              <span>{d.label}</span>
              {scene === d.scene && <span className="ml-auto text-xs text-indigo-400">現在地</span>}
            </button>
          ))}
        </div>
      )}

      {/* ワープアニメーション */}
      <AnimatePresence>
        {warping && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-900/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-8xl"
              animate={{ rotate: 720, scale: [1, 2, 0] }}
              transition={{ duration: 0.6 }}
            >
              🌀
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
