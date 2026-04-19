import { useState } from 'react'
import { register, login } from '../lib/api'
import type { Species } from '../types'
import PixelPetCanvas from './PixelPetCanvas'

interface Props {
  onSuccess: (playerId: string, playerName: string, petName?: string, petSpecies?: Species) => void
}

const SPECIES_LIST: { species: Species; label: string; desc: string }[] = [
  { species: 'dragon',  label: 'ドラゴン',     desc: 'ドロップが豪華！' },
  { species: 'unicorn', label: 'ユニコーン',   desc: '機嫌が上がりやすい' },
  { species: 'slime',   label: 'スライム',     desc: 'ドロップが早い！' },
  { species: 'phoenix', label: 'フェニックス', desc: '高レアが出やすい' },
  { species: 'golem',   label: 'ゴーレム',     desc: '安定したドロップ' },
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
    <div className="mg-stage" style={{ background: '#d8cfb8' }}>
      <div className="mg-modal" style={{ width: 340, maxHeight: '90vh' }}>
        {step === 1 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                <PixelPetCanvas species="dragon" level={1} size={64} />
              </div>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, lineHeight: 1.8, color: 'var(--ink)' }}>
                MOFU<br />GARDEN
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 4 }}>もふガーデン α</div>
            </div>

            <div style={{ display: 'flex', background: 'var(--paper-2)', borderRadius: 10, padding: 4, marginBottom: 16, border: '2px solid var(--ink)' }}>
              {(['login', 'register'] as const).map((m) => (
                <button key={m} onClick={() => switchMode(m)}
                  className={mode === m ? 'mg-btn primary' : 'mg-btn'}
                  style={{ flex: 1, justifyContent: 'center', fontSize: 13, boxShadow: mode === m ? '2px 2px 0 var(--ink)' : 'none', border: mode === m ? '2px solid var(--ink)' : '2px solid transparent' }}>
                  {m === 'login' ? 'ログイン' : '新規登録'}
                </button>
              ))}
            </div>

            <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 4 }}>プレイヤー名</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={20}
                  placeholder="名前を入力" className="mg-input" />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 4 }}>パスワード</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワードを入力" className="mg-input" />
              </div>
              {error && <p style={{ fontSize: 12, color: 'var(--accent)', textAlign: 'center' }}>{error}</p>}
              <button type="submit" disabled={loading} className="mg-btn primary" style={{ justifyContent: 'center', marginTop: 4 }}>
                {loading ? '処理中...' : mode === 'login' ? 'ログイン' : '次へ →'}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                <PixelPetCanvas species={petSpecies} level={1} size={64} />
              </div>
              <h2 style={{ margin: 0, fontSize: 16 }}>ペットを選ぼう！</h2>
              <p style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 4 }}>最初のパートナーを決めてください</p>
            </div>

            <form onSubmit={handleStep2} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 4 }}>ペットの名前</label>
                <input type="text" value={petName} onChange={(e) => setPetName(e.target.value)} maxLength={20}
                  placeholder="名前を入力" className="mg-input" />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>種族を選択</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 260, overflowY: 'auto' }}>
                  {SPECIES_LIST.map((s) => (
                    <button key={s.species} type="button" onClick={() => setPetSpecies(s.species)}
                      className="mg-navbtn"
                      style={{
                        border: petSpecies === s.species ? '2px solid var(--ink)' : '2px solid var(--paper-3)',
                        background: petSpecies === s.species ? 'var(--paper)' : 'transparent',
                        boxShadow: petSpecies === s.species ? '2px 2px 0 var(--ink)' : 'none',
                      }}>
                      <PixelPetCanvas species={s.species} level={1} size={36} />
                      <div style={{ textAlign: 'left' }}>
                        <p style={{ fontSize: 13, fontWeight: 700 }}>{s.label}</p>
                        <p style={{ fontSize: 11, color: 'var(--ink-2)' }}>{s.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {error && <p style={{ fontSize: 12, color: 'var(--accent)', textAlign: 'center' }}>{error}</p>}
              <button type="submit" className="mg-btn primary" style={{ justifyContent: 'center', marginTop: 4 }}>
                冒険をはじめる！
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
