import type { Server } from 'socket.io'

interface ParkPlayer {
  id: string
  name: string
  species: string
  level: number
  x: number
  y: number
  scene: string
}

const parkPlayers = new Map<string, ParkPlayer>()

export function registerParkHandlers(io: Server) {
  const ns = io.of('/park')

  ns.on('connection', (socket) => {
    socket.on('join', (data: { id: string; name: string; species: string; level: number; scene?: string }) => {
      const x = 15 + Math.random() * 70
      const y = 55 + Math.random() * 25
      const scene = data.scene ?? 'park'
      const player: ParkPlayer = { ...data, x, y, scene }
      parkPlayers.set(socket.id, player)

      const sameScene = Array.from(parkPlayers.values()).filter((p) => p.scene === scene)
      socket.emit('players', sameScene)

      parkPlayers.forEach((p, sid) => {
        if (sid !== socket.id && p.scene === scene) {
          ns.to(sid).emit('player:join', player)
        }
      })
    })

    socket.on('chat', (message: string) => {
      const player = parkPlayers.get(socket.id)
      if (!player) return
      parkPlayers.forEach((p, sid) => {
        if (p.scene === player.scene) {
          ns.to(sid).emit('park:chat', { id: socket.id, name: player.name, species: player.species, message: String(message).slice(0, 60) })
        }
      })
    })

    socket.on('move', (pos: { x: number; y: number }) => {
      const player = parkPlayers.get(socket.id)
      if (!player) return
      player.x = pos.x
      player.y = pos.y
      parkPlayers.forEach((p, sid) => {
        if (sid !== socket.id && p.scene === player.scene) {
          ns.to(sid).emit('player:move', { id: player.id, x: pos.x, y: pos.y })
        }
      })
    })

    socket.on('disconnect', () => {
      const player = parkPlayers.get(socket.id)
      if (player) {
        parkPlayers.forEach((p, sid) => {
          if (sid !== socket.id && p.scene === player.scene) {
            ns.to(sid).emit('player:leave', { id: player.id })
          }
        })
      }
      parkPlayers.delete(socket.id)
    })
  })
}
