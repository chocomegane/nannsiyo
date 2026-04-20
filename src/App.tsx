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
import Sidebar from './components/Sidebar'
import Hud from './components/Hud'
import SceneMount from './components/SceneMount'
import { startDropLoop } from './systems/dropSystem'
import type { Species } from './types'
import './index.css'

const PLAYER_ID_KEY = 'nannsiyo_player_id'

export default function App() {
  const scene = useWorldStore((s) => s.scene)

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const playerIdRef = useRef<string | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    if (!loggedIn) return
    if (scene === 'radio') { bgm.stop(); return }
    bgm.play(scene)
  }, [scene, loggedIn])

  useEffect(() => {
    async function init() {
      await loadBgmTracks()
      const savedId = localStorage.getItem(PLAYER_ID_KEY)
      if (savedId) {
        const data = await loadState(savedId)
        if (data) {
          applyState(data)
          playerIdRef.current = savedId
          bgm.loadFromDb(savedId)
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
    const stopDrop = startDropLoop(
      () => usePetStore.getState().pet,
      (item) => usePlayerStore.getState().addDroppedItem(item),
    )
    return () => { unsubPet(); unsubPlayer(); stopDrop() }
  }, [loggedIn])

  function scheduleSave() {
    if (!playerIdRef.current) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      const pet = usePetStore.getState().pet
      const { playerName, money, inventory, foodInventory, totalEarned, battleWins, itemsCollected, dungeonFloor, dungeonWins } = usePlayerStore.getState()
      const furniture = useFurnitureStore.getState().items
      saveState(playerIdRef.current!, { player: { name: playerName, money }, pet, inventory, foodInventory, furniture, stats: { totalEarned, battleWins, itemsCollected, dungeonFloor, dungeonWins } })
    }, 2000)
  }

  const handleLoginSuccess = async (playerId: string, playerName: string, petName?: string, petSpecies?: Species) => {
    playerIdRef.current = playerId
    localStorage.setItem(PLAYER_ID_KEY, playerId)
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
    bgm.loadFromDb(playerId)
    setLoggedIn(true)
  }

  const handleLogout = () => {
    localStorage.removeItem(PLAYER_ID_KEY)
    playerIdRef.current = null
    if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null }
    usePetStore.setState({
      pet: { id: 'pet-1', name: 'ドラゴン', species: 'dragon', level: 1, exp: 0,
        stats: { happiness: 80, hunger: 60 }, appearance: { colorFilter: 'none', scale: 1, glow: false }, unlockedSkills: [], eatCount: {} },
    })
    usePlayerStore.setState({ playerName: 'プレイヤー1', money: 0, inventory: [], droppedItems: [], foodInventory: [], totalEarned: 0, battleWins: 0, itemsCollected: 0 })
    useFurnitureStore.setState({ items: [] })
    useWorldStore.setState({ scene: 'room' })
    setLoggedIn(false)
  }

  useEffect(() => {
    function rescale() {
      const frame = document.querySelector<HTMLElement>('.mg-frame')
      if (!frame) return
      const s = Math.min(window.innerWidth / 1280, window.innerHeight / 800)
      frame.style.transform = `scale(${s})`
    }
    window.addEventListener('resize', rescale)
    rescale()
    return () => window.removeEventListener('resize', rescale)
  }, [loggedIn])

  if (initializing) {
    return (
      <div className="mg-stage">
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 13, color: 'var(--ink-2)' }}>
          読み込み中...
        </div>
      </div>
    )
  }

  if (!loggedIn) return <LoginScreen onSuccess={handleLoginSuccess} />

  return (
    <PlayerIdContext.Provider value={{ playerId: playerIdRef.current ?? '', logout: handleLogout }}>
      <div className="mg-stage">
        <div className="mg-frame">
          <Sidebar onLogout={handleLogout} />
          <Hud />
          <main className="mg-scene">
            <AnimatePresence mode="wait">
              <motion.div
                key={scene}
                style={{ position: 'absolute', inset: 0 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <SceneMount sceneKey={scene} />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </PlayerIdContext.Provider>
  )
}

function applyState(data: {
  player: { name: string; money: number; total_earned?: number; battle_wins?: number; items_collected?: number; dungeon_floor?: number; dungeon_wins?: number }
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
    dungeonFloor: player.dungeon_floor ?? 1,
    dungeonWins: player.dungeon_wins ?? 0,
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
