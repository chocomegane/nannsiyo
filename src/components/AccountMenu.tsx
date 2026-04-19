import { useState } from 'react'
import { usePetStore } from '../store/petStore'
import { usePlayerStore } from '../store/playerStore'
import { changePassword } from '../lib/api'
import StatsPanel from './StatsPanel'
import GuildPanel from './GuildPanel'
import FriendPanel from './FriendPanel'

interface Props {
  playerId: string
  onLogout: () => void
  onClose?: () => void
}

type View = 'menu' | 'info' | 'password'

export default function AccountMenu({ playerId, onLogout, onClose }: Props) {
  const [view, setView] = useState<View>('menu')
  const [showStats, setShowStats] = useState(false)
  const [showGuild, setShowGuild] = useState(false)
  const [showFriend, setShowFriend] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const playerName = usePlayerStore((s) => s.playerName)
  const money = usePlayerStore((s) => s.money)
  const pet = usePetStore((s) => s.pet)

  const close = () => { setView('menu'); setMsg(''); setCurrentPw(''); setNewPw(''); setConfirmPw('') }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPw !== confirmPw) { setMsg('新しいパスワードが一致しません'); return }
    if (newPw.length < 4) { setMsg('パスワードは4文字以上にしてください'); return }
    setLoading(true)
    const result = await changePassword(playerId, currentPw, newPw)
    setLoading(false)
    if ('error' in result) { setMsg(result.error) } else { setMsg('パスワードを変更しました'); setCurrentPw(''); setNewPw(''); setConfirmPw('') }
  }

  const handleClose = () => { close(); onClose?.() }

  return (
    <>
    {showStats && <StatsPanel onClose={() => setShowStats(false)} />}
    {showGuild && <GuildPanel onClose={() => setShowGuild(false)} />}
    {showFriend && <FriendPanel onClose={() => setShowFriend(false)} />}

    <div className="mg-modal" style={{ width: 300 }} onClick={(e) => e.stopPropagation()}>
      {view === 'menu' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ margin: 0 }}>⚙ アカウント</h2>
            <button className="mg-btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={handleClose}>✕</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button className="mg-navbtn" onClick={() => setView('info')}>📋 アカウント情報</button>
            <button className="mg-navbtn" onClick={() => { setShowStats(true) }}>📊 プレイ統計</button>
            <button className="mg-navbtn" onClick={() => { setShowGuild(true) }}>🏰 ギルド</button>
            <button className="mg-navbtn" onClick={() => { setShowFriend(true) }}>👥 フレンド</button>
            <button className="mg-navbtn" onClick={() => setView('password')}>🔑 パスワード変更</button>
            <hr style={{ borderColor: 'var(--ink-3)', margin: '2px 0' }} />
            <button className="mg-navbtn" style={{ color: 'var(--accent)' }}
              onClick={() => { handleClose(); onLogout() }}>
              🚪 ログアウト
            </button>
          </div>
        </>
      )}

      {view === 'info' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <button className="mg-btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setView('menu')}>←</button>
            <h2 style={{ margin: 0 }}>アカウント情報</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
            {[
              ['プレイヤー名', playerName],
              ['所持金', `${money.toLocaleString()}G`],
              ['ペット', `${pet.name} Lv.${pet.level}`],
              ['スキル解放数', `${pet.unlockedSkills.length}個`],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--paper-2)', borderRadius: 8, padding: '6px 10px' }}>
                <span style={{ color: 'var(--ink-2)' }}>{label}</span>
                <span style={{ fontWeight: 700 }}>{val}</span>
              </div>
            ))}
          </div>
          <button className="mg-btn" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }} onClick={handleClose}>閉じる</button>
        </>
      )}

      {view === 'password' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <button className="mg-btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => { setView('menu'); setMsg('') }}>←</button>
            <h2 style={{ margin: 0 }}>パスワード変更</h2>
          </div>
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input type="password" placeholder="現在のパスワード" value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)} className="mg-input" />
            <input type="password" placeholder="新しいパスワード" value={newPw}
              onChange={(e) => setNewPw(e.target.value)} className="mg-input" />
            <input type="password" placeholder="新しいパスワード（確認）" value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)} className="mg-input" />
            {msg && <p style={{ fontSize: 12, textAlign: 'center', color: msg.includes('変更しました') ? 'var(--accent-2)' : 'var(--accent)' }}>{msg}</p>}
            <button type="submit" disabled={loading} className="mg-btn primary" style={{ justifyContent: 'center' }}>
              {loading ? '変更中...' : '変更する'}
            </button>
          </form>
        </>
      )}
    </div>
    </>
  )
}
