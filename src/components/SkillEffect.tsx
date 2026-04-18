import { motion, AnimatePresence } from 'framer-motion'
import type { Skill } from '../types'

interface Props {
  skill: Skill | null
  onDone: () => void
}

const SKILL_VISUALS: Record<string, { emojis: string[]; color: string }> = {
  fire_breath:   { emojis: ['🔥','🔥','🔥'], color: '#ef4444' },
  emoji_pop:     { emojis: ['😆','😎','🥳','😍'], color: '#facc15' },
  party_cracker: { emojis: ['🎉','🎊','✨','🎈'], color: '#a78bfa' },
  candy_drop:    { emojis: ['🍬','🍭','🍡','🍩'], color: '#f9a8d4' },
  random_warp:   { emojis: ['🌀','✨','💫'], color: '#60a5fa' },
  heal_aura:     { emojis: ['💚','✨','💫'], color: '#4ade80' },
  prism_shift:   { emojis: ['🌈','✨','💎'], color: '#c084fc' },
}

export default function SkillEffect({ skill, onDone }: Props) {
  const visual = skill ? (SKILL_VISUALS[skill.id] ?? { emojis: ['✨'], color: '#fff' }) : null

  return (
    <AnimatePresence>
      {skill && visual && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={() => setTimeout(onDone, 1200)}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-3xl"
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{
                x: (Math.random() - 0.5) * 300,
                y: (Math.random() - 0.5) * 200,
                opacity: 0,
              }}
              transition={{ duration: 1, delay: i * 0.05 }}
            >
              {visual.emojis[i % visual.emojis.length]}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
