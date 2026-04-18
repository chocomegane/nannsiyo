import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useWorldStore } from './store/worldStore'
import { usePetStore } from './store/petStore'
import { usePlayerStore } from './store/playerStore'
import { loadState, saveState } from './lib/api'
import LoginScreen from './components/LoginScreen'
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
  const [loggedIn, setLoggedIn] = useState(false)
  const [initializing, setInitializing] = useState(true)

  // 起動時: 保存済みセッションがあればDBからロード
  useEffect(() => {
    async function init() {
      const savedId = localStorage.getItem(PLAYER_ID_KEY)
      if (savedId) {
        const data = await loadState(savedId)
        if (data) {
          applyState(data)
          playerIdRef.current = savedId
          setLoggedIn(true)
        } else {
          localStorage.removeItem(PLAYER_ID_KEY)
        }
      }
      setInitializing(false)
    }
    init()
  }, [])

  // ストア変更を監視して2秒デバウンスで保存
  useEffect(() => {
    if (!loggedIn) return
    const unsubPet = usePetStore.subscribe(() => scheduleSave())
    const unsubPlayer = usePlayerStore.subscribe(() => scheduleSave())
    return () => { unsubPet(); unsubPlayer() }
  }, [loggedIn])

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

  const handleLoginSuccess = async (playerId: string, playerName: string) => {
    localStorage.setItem(PLAYER_ID_KEY, playerId)
    playerIdRef.current = playerId
    const data = await loadState(playerId)
    if (data) {
      applyState(data)
    } else {
      usePlayerStore.setState({ playerName })
    }
    setLoggedIn(true)
  }

  if (initializing) {
    return (
      <div className="w-full h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-white text-xl font-bold">読み込み中...</div>
      </div>
    )
  }

  if (!loggedIn) {
    return <LoginScreen onSuccess={handleLoginSuccess} />
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
