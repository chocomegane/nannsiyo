import type { Server } from 'socket.io'

interface ParkPlayer {
  id: string
  name: string
  petEmoji: string
  x: number
  y: number
}

const parkPlayers = new Map<string, ParkPlayer>()

export function registerParkHandlers(io: Server) {
  const ns = io.of('/park')

  ns.on('connection', (socket) => {
    socket.on('join', (data: { id: string; name: string; petEmoji: string }) => {
      const x = 15 + Math.random() * 70
      const y = 55 + Math.random() * 25
      const player: ParkPlayer = { ...data, x, y }
      parkPlayers.set(socket.id, player)
      socket.emit('players', Array.from(parkPlayers.values()))
      socket.broadcast.emit('player:join', player)
    })

    socket.on('move', (pos: { x: number; y: number }) => {
      const player = parkPlayers.get(socket.id)
      if (!player) return
      player.x = pos.x
      player.y = pos.y
      socket.broadcast.emit('player:move', { id: player.id, x: pos.x, y: pos.y })
    })

    socket.on('disconnect', () => {
      const player = parkPlayers.get(socket.id)
      if (player) ns.emit('player:leave', { id: player.id })
      parkPlayers.delete(socket.id)
    })
  })
}
