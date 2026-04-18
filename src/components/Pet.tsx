import { motion } from 'framer-motion'
import type { Pet as PetType } from '../types'
import { expToNextLevel } from '../data/experience'

const SPECIES_EMOJI: Record<string, string> = {
  dragon: '🐉', unicorn: '🦄', slime: '🟢', phoenix: '🦅', golem: '🪨',
}

interface Props {
  pet: PetType
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="w-36">
      <div className="flex justify-between text-xs text-white/80 mb-0.5">
        <span>{label}</span>
        <span>{value}</span>
      </div>
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
      <div className="flex justify-between text-xs text-white/60 mb-0.5">
        <span>EXP</span>
        <span>{exp}/{needed === Infinity ? 'MAX' : needed}</span>
      </div>
      <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: '#a78bfa' }} />
      </div>
    </div>
  )
}

export default function Pet({ pet }: Props) {
  const { colorFilter, scale, glow } = pet.appearance
  return (
    <div className="flex flex-col items-center select-none gap-2">
      <motion.div
        className="text-8xl"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          filter: `${colorFilter} ${glow ? 'drop-shadow(0 0 16px #fff)' : ''}`,
          transform: `scale(${scale})`,
          transition: 'filter 0.5s, transform 0.5s',
        }}
      >
        {SPECIES_EMOJI[pet.species] ?? '🐾'}
      </motion.div>
      <p className="text-lg font-bold text-white drop-shadow">{pet.name}</p>
      <p className="text-sm text-white/70 -mt-1">Lv.{pet.level}</p>
      <div className="flex flex-col gap-1 mt-1">
        <StatBar label="😊 機嫌" value={pet.stats.happiness} color="#facc15" />
        <StatBar label="🍖 空腹" value={pet.stats.hunger}    color="#f87171" />
        <ExpBar exp={pet.exp} level={pet.level} />
      </div>
    </div>
  )
}
