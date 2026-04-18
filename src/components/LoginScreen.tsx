import { useState } from 'react'
import { register, login } from '../lib/api'

interface Props {
  onSuccess: (playerId: string, playerName: string) => void
}

export default function LoginScreen({ onSuccess }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !password.trim()) { setError('名前とパスワードを入力してください'); return }
    setLoading(true)
    setError('')

    const result = mode === 'register'
      ? await register(name.trim(), password)
      : await login(name.trim(), password)

    setLoading(false)

    if ('error' in result) {
      setError(result.error)
    } else {
      onSuccess(result.id, result.name)
    }
  }

  return (
    <div
      className="w-full h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
    >
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-80">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🐉</div>
          <h1 className="text-2xl font-bold text-purple-700">ペット育成ゲーム</h1>
        </div>

        <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
          <button
            onClick={() => { setMode('login'); setError('') }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${mode === 'login' ? 'bg-white shadow text-purple-700' : 'text-gray-400'}`}
          >
            ログイン
          </button>
          <button
            onClick={() => { setMode('register'); setError('') }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${mode === 'register' ? 'bg-white shadow text-purple-700' : 'text-gray-400'}`}
          >
            新規登録
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">プレイヤー名</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              placeholder="名前を入力"
              className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl transition-colors mt-1"
          >
            {loading ? '処理中...' : mode === 'login' ? 'ログイン' : '登録してはじめる'}
          </button>
        </form>
      </div>
    </div>
  )
}
