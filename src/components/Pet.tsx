import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Easing } from 'framer-motion'
import type { Pet as PetType } from '../types'
import { expToNextLevel } from '../data/experience'
import { getEvolutionStage, calcEatAppearance } from '../data/evolution'
import PixelPetCanvas from './PixelPetCanvas'
import type { Species } from '../lib/pixelpet'

const E = (e: Easing) => e

type Action = 'float' | 'jump' | 'wiggle' | 'spin' | 'look' | 'squish' | 'happy'
const ACTIONS: Action[] = ['float', 'float', 'float', 'jump', 'wiggle', 'spin', 'look', 'squish', 'happy']

function getAnimation(action: Action, dir: 1 | -1) {
  switch (action) {
    case 'jump':   return { y: [0,-40,-50,-40,-10,0,-5,0], scaleY:[1,1.1,1.2,1.1,0.85,1.15,0.95,1], scaleX:[1,0.9,0.85,0.9,1.15,0.9,1.05,1], transition:{duration:0.8,ease:E('easeOut')} }
    case 'wiggle': return { rotate:[0,-15,15,-12,12,-8,8,0], scaleX:[dir,dir*0.95,dir*1.05,dir*0.95,dir*1.05,dir,dir,dir], transition:{duration:0.7,ease:E('easeInOut')} }
    case 'spin':   return { rotate:[0,360], scaleX:[dir,dir], transition:{duration:0.6,ease:E('easeInOut')} }
    case 'look':   return { scaleX:[-dir,-dir,-dir,dir], transition:{duration:1.2,times:[0,0.3,0.7,1],ease:E('easeInOut')} }
    case 'squish': return { scaleY:[1,1.3,0.7,1.15,0.9,1], scaleX:[dir,dir*0.8,dir*1.25,dir*0.9,dir*1.05,dir], transition:{duration:0.5,ease:E('easeOut')} }
    case 'happy':  return { y:[0,-20,0,-15,0,-8,0], rotate:[0,-5,5,-5,5,0,0], scaleX:[dir,dir*1.05,dir,dir*1.05,dir,dir,dir], transition:{duration:1.2,ease:E('easeInOut')} }
    default:       return { y:[0,-10,0], scaleX:[dir,dir], transition:{duration:2.5,repeat:Infinity,ease:E('easeInOut')} }
  }
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="w-36">
      <div className="flex justify-between text-xs text-white/80 mb-0.5"><span>{label}</span><span>{value}</span></div>
      <div className="h-2 bg-white/30 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  )
}

function ExpBar({ exp, level }: { exp: number; level: number }) {
  const needed = expToNextLevel(level)
  const pct = needed === Infinity ? 100 : Math.floor((exp / needed) * 100)
  return (
    <div className="w-36">
      <div className="flex justify-between text-xs text-white/60 mb-0.5"><span>EXP</span><span>{exp}/{needed === Infinity ? 'MAX' : needed}</span></div>
      <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: '#a78bfa' }} />
      </div>
    </div>
  )
}

function FloatingOrb({ delay, x, emoji }: { delay: number; x: number; emoji: string }) {
  return (
    <motion.div
      className="absolute text-lg pointer-events-none select-none"
      style={{ left: `${x}%`, bottom: '80%' }}
      animate={{ y: [0, -8, 0], opacity: [0.6, 1, 0.6], scale: [0.9, 1.1, 0.9] }}
      transition={{ duration: 2 + delay, repeat: Infinity, delay, ease: E('easeInOut') }}
    >{emoji}</motion.div>
  )
}

interface Props { pet: PetType }

export default function Pet({ pet }: Props) {
  const [action, setAction] = useState<Action>('float')
  const [dir, setDir] = useState<1 | -1>(1)

  useEffect(() => {
    let tid: ReturnType<typeof setTimeout>
    function schedule() {
      tid = setTimeout(() => {
        const next = ACTIONS[Math.floor(Math.random() * ACTIONS.length)]
        if (next === 'look') setDir((d) => (d === 1 ? -1 : 1))
        setAction(next)
        setTimeout(() => setAction('float'), 1500)
        schedule()
      }, 2500 + Math.random() * 3500)
    }
    schedule()
    return () => clearTimeout(tid)
  }, [])

  const stage = getEvolutionStage(pet.species, pet.level)
  const eat = calcEatAppearance(pet.eatCount ?? {})
  const totalScale = stage.sizeBonus + eat.scaleBonus

  const filterParts: string[] = []
  if (eat.hueRotate !== 0) filterParts.push(`hue-rotate(${eat.hueRotate}deg)`)
  if (eat.saturate !== 1) filterParts.push(`saturate(${eat.saturate.toFixed(1)})`)
  if (eat.glowColor) filterParts.push(`drop-shadow(0 0 12px ${eat.glowColor})`)
  if (pet.level >= 50) filterParts.push('drop-shadow(0 0 20px gold)')
  else if (pet.level >= 20) filterParts.push('drop-shadow(0 0 8px #88aaff)')
  const filter = filterParts.join(' ') || 'none'

  const orbs = [
    { delay: 0,   x: -15, emoji: pet.level >= 50 ? '👑' : '✨' },
    { delay: 0.8, x: 110, emoji: eat.glowColor ? '💫' : '⭐' },
    { delay: 1.5, x: -20, emoji: '✨' },
  ]

  return (
    <div className="flex flex-col items-center select-none gap-2">
      <div className="relative flex items-center justify-center" style={{ width: 128, height: 128 }}>
        {orbs.map((o, i) => <FloatingOrb key={i} {...o} />)}
        <AnimatePresence mode="wait">
          <motion.div
            key={action}
            animate={getAnimation(action, dir)}
            style={{ transformOrigin: 'center bottom', display: 'inline-block', transform: `scale(${totalScale})`, transition: 'transform 0.5s' }}
          >
            <PixelPetCanvas
              species={pet.species as Species}
              level={pet.level}
              size={128}
              cssFilter={filter !== 'none' ? filter : undefined}
            />
          </motion.div>
        </AnimatePresence>
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-black/20 rounded-full"
          animate={action === 'jump' ? { scaleX:[1,1.4,1.6,1.4,0.8,1.1,0.95,1], scaleY:[1,0.6,0.4,0.6,1.3,0.85,1.05,1] } : { scaleX:1, scaleY:1 }}
          transition={{ duration: 0.8 }}
          style={{ width: 60, height: 12 }}
        />
      </div>

      <p className="text-lg font-bold text-white drop-shadow">{pet.name}</p>
      <p className="text-xs text-white/60 -mt-1">{stage.title} Lv.{pet.level}</p>
      <div className="flex flex-col gap-1 mt-1">
        <StatBar label="😊 機嫌" value={pet.stats.happiness} color="#facc15" />
        <StatBar label="🍖 空腹" value={pet.stats.hunger}    color="#f87171" />
        <ExpBar exp={pet.exp} level={pet.level} />
      </div>
    </div>
  )
}
