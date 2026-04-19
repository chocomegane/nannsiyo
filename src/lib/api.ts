const BASE = import.meta.env.VITE_API_URL ?? ''

export async function register(name: string, password: string): Promise<{ id: string; name: string } | { error: string }> {
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password }),
  })
  return res.json()
}

export async function login(name: string, password: string): Promise<{ id: string; name: string; money: number } | { error: string }> {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password }),
  })
  return res.json()
}

export async function changePassword(playerId: string, currentPassword: string, newPassword: string): Promise<{ ok: boolean } | { error: string }> {
  const res = await fetch(`${BASE}/api/auth/password`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId, currentPassword, newPassword }),
  })
  return res.json()
}

export async function loadState(playerId: string) {
  const res = await fetch(`${BASE}/api/players/${playerId}/state`)
  if (!res.ok) return null
  return res.json()
}

export async function saveState(playerId: string, state: object) {
  await fetch(`${BASE}/api/players/${playerId}/state`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  })
}

export async function fetchGuilds() {
  const res = await fetch(`${BASE}/api/guilds`)
  return res.json()
}

export async function createGuild(name: string, playerId: string) {
  const res = await fetch(`${BASE}/api/guilds`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, playerId }),
  })
  return res.json()
}

export async function joinGuild(guildId: string, playerId: string) {
  const res = await fetch(`${BASE}/api/guilds/${guildId}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId }),
  })
  return res.json()
}

export async function leaveGuild(guildId: string, playerId: string) {
  const res = await fetch(`${BASE}/api/guilds/${guildId}/leave`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId }),
  })
  return res.json()
}

export async function fetchFriends(playerId: string) {
  const res = await fetch(`${BASE}/api/friends/${playerId}`)
  return res.json()
}

export async function sendFriendRequest(playerId: string, targetName: string) {
  const res = await fetch(`${BASE}/api/friends/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId, targetName }),
  })
  return res.json()
}

export async function acceptFriend(requestId: string, playerId: string) {
  const res = await fetch(`${BASE}/api/friends/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId, playerId }),
  })
  return res.json()
}

export async function removeFriend(requestId: string) {
  const res = await fetch(`${BASE}/api/friends/${requestId}`, { method: 'DELETE' })
  return res.json()
}

export async function fetchRanking(): Promise<{ id: string; name: string; money: number; species: string | null; level: number | null }[]> {
  const res = await fetch(`${BASE}/api/ranking`)
  if (!res.ok) return []
  return res.json()
}

export async function playLottery(playerId: string, type: string): Promise<{ ok: boolean; result: unknown } | { error: string }> {
  const res = await fetch(`${BASE}/api/lottery/play`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId, type }),
  })
  return res.json()
}
