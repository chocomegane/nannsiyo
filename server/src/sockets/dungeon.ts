import type { Server } from 'socket.io'
import { randomUUID } from 'crypto'

interface DungeonRoom {
  id: string
  players: string[]
  floor: number
  enemies: Enemy[]
  attackTimer?: ReturnType<typeof setInterval>
}

interface Enemy {
  id: string
  name: string
  hp: number
  maxHp: number
}

const ENEMY_TABLE = [
  { name: 'スライム', hp: 30 },
  { name: 'ゴブリン', hp: 60 },
  { name: 'オーク', hp: 120 },
]

const rooms = new Map<string, DungeonRoom>()

function spawnEnemies(floor: number): Enemy[] {
  const count = Math.min(floor, 3)
  return Array.from({ length: count }, () => {
    const base = ENEMY_TABLE[Math.floor(Math.random() * ENEMY_TABLE.length)]
    const scale = 1 + (floor - 1) * 0.2
    return { id: randomUUID(), name: base.name, hp: Math.floor(base.hp * scale), maxHp: Math.floor(base.hp * scale) }
  })
}

function startEnemyAttackTimer(ns: ReturnType<Server['of']>, room: DungeonRoom) {
  if (room.attackTimer) clearInterval(room.attackTimer)
  room.attackTimer = setInterval(() => {
    if (room.enemies.length === 0 || room.players.length === 0) return
    const enemy = room.enemies[Math.floor(Math.random() * room.enemies.length)]
    const targetSocketId = room.players[Math.floor(Math.random() * room.players.length)]
    const dmg = Math.floor(5 + Math.random() * 10 + room.floor * 2)
    ns.to(targetSocketId).emit('dungeon:attacked', { damage: dmg, enemyName: enemy.name })
  }, 3000 + Math.random() * 2000)
}

export function registerDungeonHandlers(io: Server) {
  const ns = io.of('/dungeon')

  ns.on('connection', (socket) => {
    socket.on('enter', () => {
      const roomId = randomUUID()
      const room: DungeonRoom = { id: roomId, players: [socket.id], floor: 1, enemies: spawnEnemies(1) }
      rooms.set(roomId, room)
      socket.join(roomId)
      socket.emit('dungeon:state', room)
      startEnemyAttackTimer(ns, room)
    })

    socket.on('join_room', (roomId: string) => {
      const room = rooms.get(roomId)
      if (!room || room.players.length >= 4) { socket.emit('dungeon:error', 'room full'); return }
      room.players.push(socket.id)
      socket.join(roomId)
      ns.to(roomId).emit('dungeon:state', room)
    })

    socket.on('attack', ({ roomId, enemyId }: { roomId: string; enemyId: string }) => {
      const room = rooms.get(roomId)
      if (!room) return
      const enemy = room.enemies.find((e) => e.id === enemyId)
      if (!enemy) return
      const dmg = 10 + Math.floor(Math.random() * 20)
      enemy.hp = Math.max(0, enemy.hp - dmg)
      if (enemy.hp === 0) room.enemies = room.enemies.filter((e) => e.id !== enemyId)
      if (room.enemies.length === 0) {
        room.floor++
        room.enemies = spawnEnemies(room.floor)
        ns.to(roomId).emit('dungeon:floor_clear', { floor: room.floor - 1 })
        startEnemyAttackTimer(ns, room)
      }
      ns.to(roomId).emit('dungeon:state', room)
    })

    socket.on('disconnect', () => {
      rooms.forEach((room, roomId) => {
        room.players = room.players.filter((id) => id !== socket.id)
        if (room.players.length === 0) {
          if (room.attackTimer) clearInterval(room.attackTimer)
          rooms.delete(roomId)
        }
      })
    })
  })
}
