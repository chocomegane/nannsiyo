import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '../store/playerStore'
import Teleport from './Teleport'

const PRIZES = [
  { label: '大当たり！', emoji: '🏆', amount: 5000, chance: 0.01 },
  { label: '中当たり',   emoji: '🎊', amount: 1000, chance: 0.09 },
  { label: '小当たり',   emoji: '🎉', amount: 200,  chance: 0.30 },
  { label: 'ハズレ',     emoji: '😢', amount: 0,    chance: 0.60 },
]
const TICKET_PRICE = 100

const STARS = Array.from({ length: 20 }, (_, i) => ({
  x: Math.random() * 100, y: Math.random() * 100,
  delay: i * 0.3, size: ['text-xl', 'text-2xl', 'text-3xl'][i % 3],
}))
const COINS = [
  { x: 8, delay: 0 }, { x: 20, delay: 1 }, { x: 75, delay: 0.5 }, { x: 88, delay: 1.5 },
]
const NEONS = ['🎰', '💰', '🎫', '⭐', '🌟']

function drawLottery() {
  const r = Math.random()
  let cum = 0
  for (const prize of PRIZES) {
    cum += prize.chance
    if (r < cum) return prize
  }
  return PRIZES[PRIZES.length - 1]
}

export default function Lottery() {
  const { money } = usePlayerStore()
  const [result, setResult] = useState<(typeof PRIZES)[0] | null>(null)
  const [spinning, setSpinning] = useState(false)

  const draw = () => {
    if (money < TICKET_PRICE || spinning) return
    usePlayerStore.setState((s) => ({ money: s.money - TICKET_PRICE }))
    setSpinning(true)
    setTimeout(() => {
      const prize = drawLottery()
      if (prize.amount > 0) usePlayerStore.setState((s) => ({ money: s.money + prize.amount }))
      setResult(prize)
      setSpinning(false)
    }, 1000)
  }

  return (
    <div
      className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center gap-6"
      style={{ background: 'linear-gradient(135deg, #1a0533 0%, #4a0080 50%, #1a0533 100%)' }}
    >
      {/* 星のキラキラ */}
      {STARS.map((s, i) => (
        <motion.div
          key={i}
          className={`absolute select-none pointer-events-none ${s.size}`}
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.5 + s.delay, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
        >✨</motion.div>
      ))}

      {/* コイン */}
      {COINS.map((c, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl select-none pointer-events-none"
          style={{ left: `${c.x}%`, top: '20%' }}
          animate={{ y: [0, 40, 80, 120, 160, 200], opacity: [1, 1, 1, 0.5, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: c.delay, ease: 'easeIn' }}
        >🪙</motion.div>
      ))}

      {/* ネオン看板 */}
      <div className="absolute top-20 left-0 right-0 flex justify-around pointer-events-none select-none">
        {NEONS.map((n, i) => (
          <motion.div
            key={i}
            className="text-4xl"
            animate={{ opacity: [1, 0.3, 1], scale: [1, 0.9, 1] }}
            transition={{ duration: 0.8 + i * 0.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
          >{n}</motion.div>
        ))}
      </div>

      {/* 縦の光線 */}
      {[20, 50, 80].map((x, i) => (
        <motion.div
          key={i}
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{ left: `${x}%`, width: 2, background: 'linear-gradient(180deg, transparent, rgba(255,200,0,0.15), transparent)' }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2 + i, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* メインUI */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <motion.h1
          className="text-4xl font-black text-yellow-300 drop-shadow-lg"
          animate={{ textShadow: ['0 0 10px #ffcc00', '0 0 30px #ffcc00', '0 0 10px #ffcc00'] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >🎰 宝くじ店</motion.h1>
        <p className="text-white/80">1回 {TICKET_PRICE}G / 所持金: {money.toLocaleString()}G</p>

        <motion.button
          onClick={draw}
          disabled={money < TICKET_PRICE || spinning}
          className="px-10 py-4 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed text-yellow-900 font-black text-xl rounded-3xl shadow-xl transition-colors"
          whileTap={{ scale: 0.95 }}
          animate={spinning ? { rotate: [0, -5, 5, -5, 5, 0] } : {}}
          transition={{ duration: 0.3, repeat: spinning ? Infinity : 0 }}
        >
          {spinning ? '🎰 抽選中...' : '引く！'}
        </motion.button>

        <AnimatePresence>
          {result && !spinning && (
            <motion.div
              className="flex flex-col items-center gap-2"
              initial={{ scale: 0.3, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              key={result.label + Date.now()}
            >
              <motion.span
                className="text-8xl"
                animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
              >{result.emoji}</motion.span>
              <p className="text-3xl font-black text-white drop-shadow">{result.label}</p>
              {result.amount > 0 && (
                <p className="text-xl text-yellow-300 font-bold">+{result.amount.toLocaleString()}G 獲得！</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute top-4 right-4 z-20">
        <Teleport />
      </div>
    </div>
  )
}
