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
