import type { Server } from 'socket.io'

interface RadioPlayer {
  id: string
  name: string
  species: string
  level: number
  x: number
  y: number
}

const radioPlayers = new Map<string, RadioPlayer>()
let currentStation = 0  // index into STATIONS; shared across all clients

export function registerRadioHandlers(io: Server) {
  const ns = io.of('/radio')

  ns.on('connection', (socket) => {
    socket.on('join', (data: { id: string; name: string; species: string; level: number }) => {
      const x = 150 + Math.random() * 780
      const y = 420
      const player: RadioPlayer = { ...data, x, y }
      radioPlayers.set(socket.id, player)

      const others = Array.from(radioPlayers.values()).filter((_, k) => k !== socket.id)
      socket.emit('players', others)
      socket.emit('station', { index: currentStation })

      radioPlayers.forEach((p, sid) => {
        if (sid !== socket.id) {
          ns.to(sid).emit('player:join', player)
        }
      })
    })

    socket.on('change_station', (data: { index: number }) => {
      const idx = Number(data.index)
      if (!Number.isFinite(idx)) return
      currentStation = idx
      ns.emit('station', { index: currentStation })
    })

    socket.on('move', (pos: { x: number; y: number }) => {
      const player = radioPlayers.get(socket.id)
      if (!player) return
      player.x = pos.x
      player.y = pos.y
      radioPlayers.forEach((_, sid) => {
        if (sid !== socket.id) {
          ns.to(sid).emit('player:move', { id: player.id, x: pos.x, y: pos.y })
        }
      })
    })

    socket.on('chat', (message: string) => {
      const player = radioPlayers.get(socket.id)
      if (!player) return
      ns.emit('radio:chat', { id: socket.id, name: player.name, species: player.species, message: String(message).slice(0, 60) })
    })

    socket.on('disconnect', () => {
      const player = radioPlayers.get(socket.id)
      if (player) {
        radioPlayers.forEach((_, sid) => {
          if (sid !== socket.id) {
            ns.to(sid).emit('player:leave', { id: player.id })
          }
        })
      }
      radioPlayers.delete(socket.id)
    })
  })
}
