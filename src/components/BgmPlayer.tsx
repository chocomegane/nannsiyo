import { useState } from 'react'
import { bgm } from '../lib/bgm'

export default function BgmPlayer() {
  const [muted, setMuted] = useState(false)

  const toggle = () => {
    const next = bgm.toggleMute()
    setMuted(next)
  }

  return (
    <button
      onClick={toggle}
      title={muted ? 'BGM ON' : 'BGM OFF'}
      className="bg-white/80 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center shadow text-lg transition-colors"
    >
      {muted ? '🔇' : '🎵'}
    </button>
  )
}
