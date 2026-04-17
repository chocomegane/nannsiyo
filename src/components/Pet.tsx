import { motion } from 'framer-motion'
import { Pet as PetType } from '../types'

const SPECIES_EMOJI: Record<PetType['species'], string> = {
  dragon: '🐉',
  unicorn: '🦄',
  slime: '🟢',
}

interface Props {
  pet: PetType
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="w-32">
      <div className="flex justify-between text-xs text-white/80 mb-0.5">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 bg-white/30 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  )
}

export default function Pet({ pet }: Props) {
  return (
    <div className="flex flex-col items-center select-none gap-2">
      <motion.div
        className="text-8xl"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {SPECIES_EMOJI[pet.species]}
      </motion.div>
      <p className="text-lg font-bold text-white drop-shadow">{pet.name}</p>
      <p className="text-sm text-white/70 -mt-1">Lv.{pet.level}</p>
      <div className="flex flex-col gap-1 mt-1">
        <StatBar label="😊 機嫌" value={pet.stats.happiness} color="#facc15" />
        <StatBar label="🍖 空腹" value={pet.stats.hunger}    color="#f87171" />
      </div>
    </div>
  )
}
