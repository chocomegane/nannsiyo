import { useState } from 'react'
import { usePetStore } from '../store/petStore'
import { usePlayerStore } from '../store/playerStore'
import { changePassword } from '../lib/api'

interface Props {
  playerId: string
  onLogout: () => void
}

type View = 'menu' | 'info' | 'password'

export default function AccountMenu({ playerId, onLogout }: Props) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<View>('menu')
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const playerName = usePlayerStore((s) => s.playerName)
  const money = usePlayerStore((s) => s.money)
  const pet = usePetStore((s) => s.pet)

  const close = () => { setOpen(false); setView('menu'); setMsg(''); setCurrentPw(''); setNewPw(''); setConfirmPw('') }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPw !== confirmPw) { setMsg('新しいパスワードが一致しません'); return }
    if (newPw.length < 4) { setMsg('パスワードは4文字以上にしてください'); return }
    setLoading(true)
    const result = await changePassword(playerId, currentPw, newPw)
    setLoading(false)
    if ('error' in result) { setMsg(result.error) } else { setMsg('パスワードを変更しました'); setCurrentPw(''); setNewPw(''); setConfirmPw('') }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="bg-white/90 rounded-2xl px-4 py-2 shadow-lg font-bold text-sm text-gray-700 hover:bg-white transition-colors flex items-center gap-1"
      >
        👤 {playerName}
      </button>

      {open && (
        <div className="absolute top-12 right-0 bg-white rounded-2xl shadow-xl z-20 w-64 overflow-hidden">
          {view === 'menu' && (
            <div className="p-3 flex flex-col gap-1">
              <button onClick={() => setView('info')}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 text-sm font-medium flex items-center gap-2">
                📋 アカウント情報
              </button>
              <button onClick={() => setView('password')}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 text-sm font-medium flex items-center gap-2">
                🔑 パスワード変更
              </button>
              <hr className="my-1" />
              <button onClick={() => { close(); onLogout() }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 text-sm font-medium text-red-500 flex items-center gap-2">
                🚪 ログアウト
              </button>
            </div>
          )}

          {view === 'info' && (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <button onClick={() => setView('menu')} className="text-gray-400 hover:text-gray-600">←</button>
                <p className="font-bold text-gray-700">アカウント情報</p>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between bg-gray-50 rounded-xl px-3 py-2">
                  <span className="text-gray-500">プレイヤー名</span>
                  <span className="font-bold">{playerName}</span>
                </div>
                <div className="flex justify-between bg-gray-50 rounded-xl px-3 py-2">
                  <span className="text-gray-500">所持金</span>
                  <span className="font-bold text-yellow-600">{money.toLocaleString()}G</span>
                </div>
                <div className="flex justify-between bg-gray-50 rounded-xl px-3 py-2">
                  <span className="text-gray-500">ペット</span>
                  <span className="font-bold">{pet.name} Lv.{pet.level}</span>
                </div>
                <div className="flex justify-between bg-gray-50 rounded-xl px-3 py-2">
                  <span className="text-gray-500">スキル解放数</span>
                  <span className="font-bold">{pet.unlockedSkills.length}個</span>
                </div>
              </div>
              <button onClick={close} className="mt-3 w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors">
                閉じる
              </button>
            </div>
          )}

          {view === 'password' && (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <button onClick={() => { setView('menu'); setMsg('') }} className="text-gray-400 hover:text-gray-600">←</button>
                <p className="font-bold text-gray-700">パスワード変更</p>
              </div>
              <form onSubmit={handleChangePassword} className="flex flex-col gap-2">
                <input type="password" placeholder="現在のパスワード" value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                <input type="password" placeholder="新しいパスワード" value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                <input type="password" placeholder="新しいパスワード（確認）" value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                {msg && <p className={`text-xs text-center ${msg.includes('変更しました') ? 'text-green-500' : 'text-red-500'}`}>{msg}</p>}
                <button type="submit" disabled={loading}
                  className="py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors">
                  {loading ? '変更中...' : '変更する'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
