import { useEffect, useRef } from 'react'
import { buildGameState } from '../lib/sceneGame'
import { buildRoom, buildPark, buildDungeon, buildLottery, buildRanking, buildFurniture, buildFriendRoom } from '../lib/sceneBuilders'
import { useWorldStore } from '../store/worldStore'
import type { Scene } from '../types'

const BUILDERS = {
  room: buildRoom,
  park: buildPark,
  dungeon: buildDungeon,
  lottery: buildLottery,
  ranking: buildRanking,
  furniture: buildFurniture,
  friend: buildFriendRoom,
}

export default function SceneMount({ sceneKey }: { sceneKey: string }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const toastRef = useRef<HTMLDivElement>(null)
  const setScene = useWorldStore(s => s.setScene)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    root.innerHTML = ''
    const game = buildGameState(toastRef.current)
    const showScene = (k: string) => setScene(k as Scene)
    const builder = BUILDERS[sceneKey as keyof typeof BUILDERS]
    if (builder) builder(root, game, showScene)
    return () => {
      root.querySelectorAll('canvas').forEach((c) => (c as HTMLCanvasElement & { destroy?: () => void }).destroy?.())
      root.innerHTML = ''
    }
  }, [sceneKey, setScene])

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div ref={rootRef} style={{ position: 'absolute', inset: 0 }} />
      <div ref={toastRef} style={{ position: 'absolute', top: 0, right: 0, zIndex: 50 }} />
    </div>
  )
}
