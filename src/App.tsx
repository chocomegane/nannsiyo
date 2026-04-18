import { AnimatePresence, motion } from 'framer-motion'
import { useWorldStore } from './store/worldStore'
import Room from './components/Room'
import Park from './components/Park'
import Dungeon from './components/Dungeon'
import Lottery from './components/Lottery'
import Ranking from './components/Ranking'
import './index.css'

const SCENES = { room: Room, park: Park, dungeon: Dungeon, lottery: Lottery, ranking: Ranking }

export default function App() {
  const scene = useWorldStore((s) => s.scene)
  const SceneComponent = SCENES[scene]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={scene}
        className="w-full h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <SceneComponent />
      </motion.div>
    </AnimatePresence>
  )
}
