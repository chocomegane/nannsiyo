import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  level: number
  visible: boolean
  onDone: () => void
}

export default function LevelUpEffect({ level, visible, onDone }: Props) {
  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onAnimationComplete={() => setTimeout(onDone, 1800)}
        >
          <motion.div
            className="text-6xl font-black text-yellow-300 drop-shadow-lg"
            initial={{ scale: 0.3, y: 40 }}
            animate={{ scale: 1.2, y: 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            LEVEL UP!
          </motion.div>
          <motion.div
            className="text-4xl font-bold text-white mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Lv.{level}
          </motion.div>
          {/* 紙吹雪 */}
          {Array.from({ length: 16 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-sm"
              style={{ background: ['#facc15','#f87171','#60a5fa','#4ade80','#c084fc'][i % 5] }}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{
                x: (Math.random() - 0.5) * 400,
                y: (Math.random() + 0.5) * 300,
                opacity: 0,
                rotate: Math.random() * 720,
              }}
              transition={{ duration: 1.5, delay: 0.1 }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
