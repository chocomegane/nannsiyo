import { useState } from 'react'
import { register, login } from '../lib/api'
import type { Species } from '../types'

interface Props {
  onSuccess: (playerId: string, playerName: string, petName?: string, petSpecies?: Species) => void
}

const SPECIES_LIST: { species: Species; emoji: string; label: string; desc: string }[] = [
  { species: 'dragon',  emoji: '🐉', label: 'ドラゴン',     desc: 'ドロップが豪華！' },
  { species: 'unicorn', emoji: '🦄', label: 'ユニコーン',   desc: '機嫌が上がりやすい' },
  { species: 'slime',   emoji: '🟢', label: 'スライム',     desc: 'ドロップが早い！' },
  { species: 'phoenix', emoji: '🦅', label: 'フェニックス', desc: '高レアが出やすい' },
  { species: 'golem',   emoji: '🪨', label: 'ゴーレム',     desc: '安定したドロップ' },
]

export default function LoginScreen({ onSuccess }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [step, setStep] = useState<1 | 2>(1)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [petName, setPetName] = useState('')
  const [petSpecies, setPetSpecies] = useState<Species>('dragon')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingPlayer, setPendingPlayer] = useState<{ id: string; name: string } | null>(null)

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !password.trim()) { setError('名前とパスワードを入力してください'); return }
    setLoading(true); setError('')

    if (mode === 'login') {
      const result = await login(name.trim(), password)
      setLoading(false)
      if ('error' in result) { setError(result.error) } else { onSuccess(result.id, result.name) }
    } else {
      const result = await register(name.trim(), password)
      setLoading(false)
      if ('error' in result) { setError(result.error) } else {
        setPendingPlayer({ id: result.id, name: result.name })
        setPetName(result.name + 'のペット')
        setStep(2)
      }
    }
  }

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!petName.trim()) { setError('ペットの名前を入力してください'); return }
    if (!pendingPlayer) return
    onSuccess(pendingPlayer.id, pendingPlayer.name, petName.trim(), petSpecies)
  }

  const switchMode = (m: 'login' | 'register') => { setMode(m); setError(''); setStep(1) }

  return (
    <div className="w-full h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-80">

        {step === 1 && (
          <>
            <div className="text-center mb-6">
              <div className="text-5xl mb-2">🐉</div>
              <h1 className="text-2xl font-bold text-purple-700">ペット育成ゲーム</h1>
            </div>
            <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
              <button onClick={() => switchMode('login')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${mode === 'login' ? 'bg-white shadow text-purple-700' : 'text-gray-400'}`}>
                ログイン
              </button>
              <button onClick={() => switchMode('register')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${mode === 'register' ? 'bg-white shadow text-purple-700' : 'text-gray-400'}`}>
                新規登録
              </button>
            </div>
            <form onSubmit={handleStep1} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">プレイヤー名</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={20}
                  placeholder="名前を入力"
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">パスワード</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワードを入力"
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>
              {error && <p className="text-xs text-red-500 text-center">{error}</p>}
              <button type="submit" disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl transition-colors mt-1">
                {loading ? '処理中...' : mode === 'login' ? 'ログイン' : '次へ →'}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-center mb-4">
              <div className="text-4xl mb-1">🐾</div>
              <h2 className="text-xl font-bold text-purple-700">ペットを選ぼう！</h2>
              <p className="text-xs text-gray-400 mt-1">最初のパートナーを決めてください</p>
            </div>
            <form onSubmit={handleStep2} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">ペットの名前</label>
                <input type="text" value={petName} onChange={(e) => setPetName(e.target.value)} maxLength={20}
                  placeholder="名前を入力"
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-2 block">種族を選択</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {SPECIES_LIST.map((s) => (
                    <button key={s.species} type="button"
                      onClick={() => setPetSpecies(s.species)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl border-2 transition-colors text-left ${petSpecies === s.species ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-200'}`}>
                      <span className="text-2xl">{s.emoji}</span>
                      <div>
                        <p className="text-sm font-bold">{s.label}</p>
                        <p className="text-xs text-gray-400">{s.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {error && <p className="text-xs text-red-500 text-center">{error}</p>}
              <button type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl transition-colors">
                冒険をはじめる！🎉
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
