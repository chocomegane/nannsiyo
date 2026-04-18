import { useEffect, useState } from 'react'
import { fetchGuilds, createGuild, joinGuild, leaveGuild } from '../lib/api'
import { usePlayerId } from '../lib/playerContext'

interface Guild { id: string; name: string; leader_name: string; member_count: number }

interface Props { onClose: () => void }

export default function GuildPanel({ onClose }: Props) {
  const { playerId } = usePlayerId()
  const [guilds, setGuilds] = useState<Guild[]>([])
  const [newName, setNewName] = useState('')
  const [myGuildId, setMyGuildId] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  const load = async () => {
    const data = await fetchGuilds()
    setGuilds(data)
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    const res = await createGuild(newName.trim(), playerId)
    if ('error' in res) { setMsg(res.error); return }
    setMyGuildId(res.id)
    setNewName('')
    setMsg('ギルドを作成しました！')
    load()
  }

  const handleJoin = async (guildId: string) => {
    const res = await joinGuild(guildId, playerId)
    if ('error' in res) { setMsg(res.error); return }
    setMyGuildId(guildId)
    setMsg('ギルドに参加しました！')
    load()
  }

  const handleLeave = async () => {
    if (!myGuildId) return
    await leaveGuild(myGuildId, playerId)
    setMyGuildId(null)
    setMsg('ギルドを退出しました')
    load()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl p-5 w-80 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-700 text-lg">🏰 ギルド</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {myGuildId ? (
          <button onClick={handleLeave} className="w-full py-2 mb-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-sm font-medium transition-colors">
            退出する
          </button>
        ) : (
          <div className="flex gap-2 mb-3">
            <input
              value={newName} onChange={(e) => setNewName(e.target.value)}
              placeholder="ギルド名"
              className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
            <button onClick={handleCreate} className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-white font-bold rounded-xl text-sm transition-colors">
              作成
            </button>
          </div>
        )}

        {msg && <p className="text-xs text-center text-blue-500 mb-2">{msg}</p>}

        <div className="flex flex-col gap-2">
          {guilds.map((g) => (
            <div key={g.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
              <div>
                <p className="font-bold text-sm">{g.name}</p>
                <p className="text-xs text-gray-400">GL: {g.leader_name} · {g.member_count}人</p>
              </div>
              {!myGuildId && (
                <button onClick={() => handleJoin(g.id)} className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors">
                  参加
                </button>
              )}
              {myGuildId === g.id && <span className="text-xs text-green-500 font-bold">所属中</span>}
            </div>
          ))}
          {guilds.length === 0 && <p className="text-sm text-gray-400 text-center py-4">ギルドがありません</p>}
        </div>
      </div>
    </div>
  )
}
