import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useWorldStore } from './store/worldStore'
import { usePetStore } from './store/petStore'
import { usePlayerStore } from './store/playerStore'
import { createPlayer, loadState, saveState } from './lib/api'
import Room from './components/Room'
import Park from './components/Park'
import Dungeon from './components/Dungeon'
import Lottery from './components/Lottery'
import Ranking from './components/Ranking'
import './index.css'

const SCENES = { room: Room, park: Park, dungeon: Dungeon, lottery: Lottery, ranking: Ranking }
const PLAYER_ID_KEY = 'nannsiyo_player_id'

export default function App() {
  const scene = useWorldStore((s) => s.scene)
  const SceneComponent = SCENES[scene]
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const playerIdRef = useRef<string | null>(null)

  // 起動時: DBからステートをロード（なければ新規作成）
  useEffect(() => {
    async function init() {
      let playerId = localStorage.getItem(PLAYER_ID_KEY)

      if (playerId) {
        const data = await loadState(playerId)
        if (!data) {
          // DBにデータがなければ再作成
          playerId = null
        } else {
          applyState(data)
        }
      }

      if (!playerId) {
        const { playerName } = usePlayerStore.getState()
        const newPlayer = await createPlayer(playerName)
        playerId = newPlayer.id
        localStorage.setItem(PLAYER_ID_KEY, playerId)
      }

      playerIdRef.current = playerId
    }
    init()
  }, [])

  // ストア変更を監視して2秒デバウンスで保存
  useEffect(() => {
    const unsubPet = usePetStore.subscribe(() => scheduleSave())
    const unsubPlayer = usePlayerStore.subscribe(() => scheduleSave())
    return () => { unsubPet(); unsubPlayer() }
  }, [])

  function scheduleSave() {
    if (!playerIdRef.current) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      const pet = usePetStore.getState().pet
      const { playerName, money, inventory, foodInventory } = usePlayerStore.getState()
      saveState(playerIdRef.current!, {
        player: { name: playerName, money },
        pet,
        inventory,
        foodInventory,
      })
    }, 2000)
  }

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

function applyState(data: {
  player: { name: string; money: number }
  pet: { id: string; name: string; species: string; level: number; exp: number; happiness: number; hunger: number; unlocked_skills: string } | null
  inventory: { id: string; item_id: string; name: string; sell_price: number }[]
  foodInventory: { id: string; food_id: string; name: string; price: number }[]
}) {
  const { player, pet, inventory, foodInventory } = data

  usePlayerStore.setState({
    playerName: player.name,
    money: player.money,
    inventory: inventory.map((i) => ({
      id: i.id,
      itemId: i.item_id,
      name: i.name,
      sellPrice: i.sell_price,
      x: 10 + Math.random() * 75,
      y: 52 + Math.random() * 33,
    })),
    foodInventory: foodInventory.map((f) => ({
      id: f.id,
      foodId: f.food_id,
      name: f.name,
      price: f.price,
    })),
  })

  if (pet) {
    usePetStore.setState({
      pet: {
        id: pet.id,
        name: pet.name,
        species: pet.species as never,
        level: pet.level,
        exp: pet.exp,
        stats: { happiness: pet.happiness, hunger: pet.hunger },
        appearance: { colorFilter: 'none', scale: 1, glow: false },
        unlockedSkills: JSON.parse(pet.unlocked_skills ?? '[]'),
      },
    })
  }
}
