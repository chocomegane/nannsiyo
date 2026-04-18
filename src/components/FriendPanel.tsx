import { useEffect, useState } from 'react'
import { fetchFriends, sendFriendRequest, acceptFriend, removeFriend } from '../lib/api'
import { usePlayerId } from '../lib/playerContext'
import { useWorldStore } from '../store/worldStore'

interface FriendEntry { id: string; name: string; status: string; request_id: string; direction: string }

interface Props { onClose: () => void }

export default function FriendPanel({ onClose }: Props) {
  const { playerId } = usePlayerId()
  const { setVisitingRoom, setScene } = useWorldStore()
  const [friends, setFriends] = useState<FriendEntry[]>([])
  const [targetName, setTargetName] = useState('')
  const [msg, setMsg] = useState('')

  const load = async () => setFriends(await fetchFriends(playerId))

  useEffect(() => { load() }, [])

  const handleRequest = async () => {
    if (!targetName.trim()) return
    const res = await sendFriendRequest(playerId, targetName.trim())
    if ('error' in res) { setMsg(res.error); return }
    setMsg('フレンド申請を送りました！')
    setTargetName('')
    load()
  }

  const handleAccept = async (requestId: string) => {
    await acceptFriend(requestId, playerId)
    load()
  }

  const handleRemove = async (requestId: string) => {
    await removeFriend(requestId)
    load()
  }

  const accepted = friends.filter((f) => f.status === 'accepted')
  const pending = friends.filter((f) => f.status === 'pending')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl p-5 w-80 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-700 text-lg">👥 フレンド</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="flex gap-2 mb-3">
          <input
            value={targetName} onChange={(e) => setTargetName(e.target.value)}
            placeholder="プレイヤー名"
            className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          <button onClick={handleRequest} className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl text-sm transition-colors">
            申請
          </button>
        </div>
        {msg && <p className="text-xs text-center text-blue-500 mb-2">{msg}</p>}

        {pending.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-400 font-bold mb-1">📬 申請中</p>
            {pending.map((f) => (
              <div key={f.request_id} className="flex items-center justify-between bg-yellow-50 rounded-xl px-3 py-2 mb-1">
                <span className="text-sm font-medium">{f.name}</span>
                <div className="flex gap-1">
                  {f.direction === 'received' && (
                    <button onClick={() => handleAccept(f.request_id)} className="px-2 py-1 bg-green-500 text-white text-xs rounded-lg">承認</button>
                  )}
                  <button onClick={() => handleRemove(f.request_id)} className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-lg">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div>
          <p className="text-xs text-gray-400 font-bold mb-1">👫 フレンド ({accepted.length})</p>
          {accepted.length === 0 && <p className="text-sm text-gray-400 text-center py-2">フレンドがいません</p>}
          {accepted.map((f) => (
            <div key={f.request_id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 mb-1">
              <span className="text-sm font-medium">🟢 {f.name}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => { setVisitingRoom({ playerId: f.id, playerName: f.name }); setScene('room'); onClose() }}
                  className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors"
                >訪問</button>
                <button onClick={() => handleRemove(f.request_id)} className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-lg">削除</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
