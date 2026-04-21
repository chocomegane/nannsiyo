import { useState } from 'react'
import { bgm, BGM_TRACKS } from '../lib/bgm'
import { useWorldStore } from '../store/worldStore'
import type { Scene } from '../types'

const SCENE_LABELS: Partial<Record<Scene, string>> = {
  room: '自室', furniture: '家具店', park: '公園', dungeon: 'ダンジョン', lottery: '宝くじ店', ranking: 'ランキング',
}
const SCENES: Scene[] = ['room', 'furniture', 'park', 'dungeon', 'lottery', 'ranking']

export default function BgmPlayer({ compact }: { compact?: boolean }) {
  const scene = useWorldStore((s) => s.scene)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(3)
  const [open, setOpen] = useState(false)
  const [selections, setSelections] = useState<Partial<Record<Scene, string>>>(() => {
    const obj: Partial<Record<Scene, string>> = {}
    SCENES.forEach((s) => { obj[s] = bgm.getSrc(s) })
    return obj
  })

  const toggleMute = () => { const next = bgm.toggleMute(); setMuted(next) }

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value)
    setVolume(v)
    bgm.setVolume(v / 100)
  }

  const handleTrackChange = (sc: Scene, src: string) => {
    setSelections((prev) => ({ ...prev, [sc]: src }))
    bgm.setSceneBgm(sc, src)
    if (sc === scene) bgm.play(scene)
  }

  const tracks = BGM_TRACKS.length > 0 ? BGM_TRACKS : [{ label: '(BGMファイルなし)', src: '' }]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title="BGM設定"
        className={compact
          ? 'mg-chip'
          : 'bg-white/80 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center shadow text-lg transition-colors'}
      >
        {muted ? '🔇' : '🎵'}
      </button>

      {open && (
        <div className="absolute top-11 right-0 bg-white rounded-2xl shadow-xl z-[300] w-72 p-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-gray-700 text-sm">🎵 BGM設定</p>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <button onClick={toggleMute} className="text-lg">{muted ? '🔇' : '🔊'}</button>
            <input
              type="range" min={0} max={100} value={volume}
              onChange={handleVolume}
              className="flex-1 accent-purple-500"
            />
            <span className="text-xs text-gray-500 w-8 text-right">{volume}%</span>
          </div>

          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
            {SCENES.map((sc) => (
              <div key={sc}>
                <p className="text-xs text-gray-400 font-bold mb-1">{SCENE_LABELS[sc]}</p>
                <select
                  value={selections[sc] ?? ''}
                  onChange={(e) => handleTrackChange(sc, e.target.value)}
                  className="w-full border rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-300"
                >
                  {tracks.map((t) => (
                    <option key={t.src} value={t.src}>{t.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
