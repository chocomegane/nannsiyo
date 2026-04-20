import { useState } from 'react'
import { useWorldStore } from '../store/worldStore'
import { usePlayerStore } from '../store/playerStore'
import { usePetStore } from '../store/petStore'
import { usePlayerId } from '../lib/playerContext'
import type { Scene } from '../types'
import AccountMenu from './AccountMenu'

const NAV: { scene: Scene; ic: string; label: string }[] = [
  { scene: 'room',      ic: '🏠', label: 'じぶんの部屋' },
  { scene: 'park',      ic: '🌳', label: 'ひかりの公園' },
  { scene: 'dungeon',   ic: '⚔️', label: 'ダンジョン' },
  { scene: 'ranking',   ic: '🏆', label: 'ランキング' },
  { scene: 'furniture', ic: '🛋️', label: 'インテリア' },
  { scene: 'radio',     ic: '📻', label: 'ラジオルーム' },
]

interface Props { onLogout: () => void }

export default function Sidebar({ onLogout }: Props) {
  const { scene, setScene, setVisitingRoom } = useWorldStore()
  const playerName = usePlayerStore((s) => s.playerName)
  const pet = usePetStore((s) => s.pet)
  const { playerId } = usePlayerId()
  const [showAccount, setShowAccount] = useState(false)

  const navigate = (dest: Scene) => {
    if (dest === scene) return
    setVisitingRoom(null)
    setScene(dest)
  }

  return (
    <aside className="mg-sidebar">
      <div className="mg-logo">
        MOFU<br />GARDEN
        <span className="tag">もふガーデン α</span>
      </div>

      {NAV.map((n) => (
        <button
          key={n.scene}
          className={`mg-navbtn${scene === n.scene ? ' active' : ''}`}
          onClick={() => navigate(n.scene)}
        >
          <span className="ic">{n.ic}</span>
          {n.label}
        </button>
      ))}

      <div
        className="mg-player-card"
        onClick={() => setShowAccount(true)}
      >
        <div className="name">🧑‍🌾 {playerName}</div>
        <div className="row"><span>ペット</span><span>{pet.name} Lv.{pet.level}</span></div>
        <div className="row" style={{ marginTop: 6, color: 'var(--accent)' }}>
          <span>⚙ アカウント</span><span>▸</span>
        </div>
      </div>

      {showAccount && (
        <div className="mg-overlay" onClick={() => setShowAccount(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <AccountMenu playerId={playerId} onLogout={onLogout} onClose={() => setShowAccount(false)} />
          </div>
        </div>
      )}
    </aside>
  )
}
