import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useWorldStore } from './store/worldStore'
import { usePetStore } from './store/petStore'
import { usePlayerStore } from './store/playerStore'
import { loadState, saveState } from './lib/api'
import { PlayerIdContext } from './lib/playerContext'
import { useFurnitureStore } from './store/furnitureStore'
import { bgm, loadBgmTracks } from './lib/bgm'
import LoginScreen from './components/LoginScreen'
import Room from './components/Room'
import Park from './components/Park'
import Dungeon from './components/Dungeon'
import Lottery from './components/Lottery'
import Ranking from './components/Ranking'
import FurnitureShop from './components/FurnitureShop'
import type { Species } from './types'
import './index.css'

const SCENES = { room: Room, park: Park, dungeon: Dungeon, lottery: Lottery, ranking: Ranking, furniture: FurnitureShop }
const PLAYER_ID_KEY = 'nannsiyo_player_id'

export default function App() {
  const scene = useWorldStore((s) => s.scene)
  const SceneComponent = SCENES[scene]

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const playerIdRef = useRef<string | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => { if (loggedIn) bgm.play(scene) }, [scene, loggedIn])

  useEffect(() => {
    async function init() {
      await loadBgmTracks()
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
      const { playerName, money, inventory, foodInventory, totalEarned, battleWins, itemsCollected } = usePlayerStore.getState()
      const furniture = useFurnitureStore.getState().items
      saveState(playerIdRef.current!, { player: { name: playerName, money }, pet, inventory, foodInventory, furniture, stats: { totalEarned, battleWins, itemsCollected } })
    }, 2000)
  }

  const handleLoginSuccess = async (playerId: string, playerName: string, petName?: string, petSpecies?: Species) => {
    localStorage.setItem(PLAYER_ID_KEY, playerId)
    playerIdRef.current = playerId
    const data = await loadState(playerId)
    if (data) {
      applyState(data)
      if (!data.pet && petName && petSpecies) {
        usePetStore.setState((s) => ({ pet: { ...s.pet, name: petName, species: petSpecies, eatCount: {} } }))
      }
    } else {
      usePlayerStore.setState({ playerName })
      if (petName && petSpecies) {
        usePetStore.setState((s) => ({ pet: { ...s.pet, name: petName, species: petSpecies, eatCount: {} } }))
      }
    }
    setLoggedIn(true)
  }

  const handleLogout = () => {
    localStorage.removeItem(PLAYER_ID_KEY)
    playerIdRef.current = null
    usePetStore.setState({
      pet: { id: 'pet-1', name: 'ドラゴン', species: 'dragon', level: 1, exp: 0,
        stats: { happiness: 80, hunger: 60 }, appearance: { colorFilter: 'none', scale: 1, glow: false }, unlockedSkills: [], eatCount: {} },
    })
    usePlayerStore.setState({ playerName: 'プレイヤー1', money: 0, inventory: [], droppedItems: [], foodInventory: [], totalEarned: 0, battleWins: 0, itemsCollected: 0 })
    useFurnitureStore.setState({ items: [] })
    useWorldStore.setState({ scene: 'room' })
    setLoggedIn(false)
  }

  if (initializing) {
    return (
      <div className="w-full h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-white text-xl font-bold">読み込み中...</div>
      </div>
    )
  }

  if (!loggedIn) return <LoginScreen onSuccess={handleLoginSuccess} />

  return (
    <PlayerIdContext.Provider value={{ playerId: playerIdRef.current ?? '', logout: handleLogout }}>
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
    </PlayerIdContext.Provider>
  )
}

function applyState(data: {
  player: { name: string; money: number; total_earned?: number; battle_wins?: number; items_collected?: number }
  pet: { id: string; name: string; species: string; level: number; exp: number; happiness: number; hunger: number; unlocked_skills: string; eat_count: string } | null
  inventory: { id: string; item_id: string; name: string; sell_price: number }[]
  foodInventory: { id: string; food_id: string; name: string; price: number }[]
  furniture?: { id: string; furniture_id: string; name: string; placed: number }[]
}) {
  const { player, pet, inventory, foodInventory, furniture } = data
  usePlayerStore.setState({
    playerName: player.name,
    money: player.money,
    totalEarned: player.total_earned ?? 0,
    battleWins: player.battle_wins ?? 0,
    itemsCollected: player.items_collected ?? 0,
    inventory: inventory.map((i) => ({ id: i.id, itemId: i.item_id, name: i.name, sellPrice: i.sell_price, x: 10 + Math.random() * 75, y: 52 + Math.random() * 33 })),
    foodInventory: foodInventory.map((f) => ({ id: f.id, foodId: f.food_id, name: f.name, price: f.price })),
  })
  if (pet) {
    usePetStore.setState({
      pet: { id: pet.id, name: pet.name, species: pet.species as never, level: pet.level, exp: pet.exp,
        stats: { happiness: pet.happiness, hunger: pet.hunger },
        appearance: { colorFilter: 'none', scale: 1, glow: false },
        unlockedSkills: JSON.parse(pet.unlocked_skills ?? '[]'),
        eatCount: JSON.parse(pet.eat_count ?? '{}') },
    })
  }
  if (furniture) {
    useFurnitureStore.setState({
      items: furniture.map((f) => ({ id: f.id, furnitureId: f.furniture_id, name: f.name, placed: f.placed === 1 })),
    })
  }
}
