import { useWorldStore } from '../store/worldStore'
import { usePlayerStore } from '../store/playerStore'
import { usePlayerId } from '../lib/playerContext'
import { openBoard } from '../lib/sceneBuilders'
import BgmPlayer from './BgmPlayer'

const TITLES: Record<string, string> = {
  room:      '🏠 じぶんの部屋',
  park:      '🌳 ひかりの公園',
  dungeon:   '⚔️ ダンジョン',
  lottery:   '🎰 宝くじ店「幸運堂」',
  ranking:   '🏆 ランキング',
  furniture: '🛋️ インテリアショップ',
}

const WALK_SCENES = new Set(['park', 'radio'])

export default function Hud() {
  const scene = useWorldStore((s) => s.scene)
  const { money, inventory, sellAll } = usePlayerStore()
  const { playerId } = usePlayerId()
  const sellTotal = inventory.reduce((s, i) => s + i.sellPrice, 0)

  return (
    <div className="mg-hud">
      <span className="title">{TITLES[scene] ?? ''}</span>
      <span className="spacer" />
      <BgmPlayer compact />
      {!WALK_SCENES.has(scene) && (
        <button className="mg-chip" onClick={() => openBoard(scene, playerId)} title="掲示板">
          📋
        </button>
      )}
      {inventory.length > 0 && (
        <button className="mg-chip accent" onClick={sellAll}>
          全部売る
          <span style={{
            background: 'rgba(255,255,255,0.25)', borderRadius: 10,
            padding: '1px 6px', fontSize: 11,
          }}>
            +{sellTotal.toLocaleString()}G
          </span>
        </button>
      )}
      <span className="mg-chip mustard">
        🪙 {money.toLocaleString()} G
      </span>
    </div>
  )
}
