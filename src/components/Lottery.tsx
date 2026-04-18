import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '../store/playerStore'
import Teleport from './Teleport'

const PRIZES = [
  { label: '大当たり！', emoji: '🏆', amount: 5000, chance: 0.01 },
  { label: '中当たり', emoji: '🎊', amount: 1000, chance: 0.09 },
  { label: '小当たり', emoji: '🎉', amount: 200,  chance: 0.30 },
  { label: 'ハズレ',   emoji: '😢', amount: 0,    chance: 0.60 },
]
const TICKET_PRICE = 100

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
      style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)' }}
    >
      <div className="absolute top-4 right-4 z-10">
        <Teleport />
      </div>

      <h1 className="text-4xl font-black text-white drop-shadow-lg">🎰 宝くじ店</h1>
      <p className="text-white/80">1回 {TICKET_PRICE}G / 所持金: {money.toLocaleString()}G</p>

      <motion.button
        onClick={draw}
        disabled={money < TICKET_PRICE || spinning}
        className="px-10 py-4 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed text-yellow-900 font-black text-xl rounded-3xl shadow-xl transition-colors"
        whileTap={{ scale: 0.95 }}
      >
        {spinning ? '🎰 抽選中...' : '引く！'}
      </motion.button>

      <AnimatePresence>
        {result && !spinning && (
          <motion.div
            className="flex flex-col items-center gap-2"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            key={result.label + Date.now()}
          >
            <span className="text-8xl">{result.emoji}</span>
            <p className="text-3xl font-black text-white drop-shadow">{result.label}</p>
            {result.amount > 0 && (
              <p className="text-xl text-yellow-200 font-bold">+{result.amount.toLocaleString()}G</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
