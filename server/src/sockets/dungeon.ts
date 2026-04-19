import type { Server } from 'socket.io'
import { randomUUID } from 'crypto'

const ENEMIES = [
  { name:'スライムJr.',   emoji:'🟢', lv:1,  hp:40,  atk:4,  reward:80  },
  { name:'コウモリ',       emoji:'🦇', lv:3,  hp:60,  atk:6,  reward:120 },
  { name:'ゴブリン',       emoji:'👺', lv:5,  hp:90,  atk:9,  reward:180 },
  { name:'オーク',         emoji:'👹', lv:8,  hp:130, atk:13, reward:260 },
  { name:'スケルトン',     emoji:'💀', lv:12, hp:180, atk:17, reward:360 },
  { name:'ダークウィザード',emoji:'🧙', lv:16, hp:240, atk:22, reward:480 },
  { name:'ドラゴンゾンビ', emoji:'🐲', lv:22, hp:320, atk:28, reward:650 },
  { name:'闇の騎士',       emoji:'⚔️', lv:30, hp:420, atk:35, reward:900 },
  { name:'リッチ王',       emoji:'☠️', lv:40, hp:560, atk:44, reward:1200 },
  { name:'魔王',           emoji:'😈', lv:50, hp:800, atk:60, reward:2000 },
]

interface DungeonPlayer {
  socketId: string
  playerId: string
  name: string
  species: string
  level: number
  hp: number
  maxHp: number
  defending: boolean
  alive: boolean
}

interface EnemyState {
  name: string; emoji: string; lv: number
  hp: number; maxHp: number; atk: number; reward: number
}

interface DungeonParty {
  id: string
  players: DungeonPlayer[]
  floor: number
  enemy: EnemyState
  turnIdx: number   // index into players (alive players only for cycling)
  phase: 'battle' | 'animating' | 'victory' | 'defeat'
}

const parties = new Map<string, DungeonParty>()
// socketId → partyId
const playerParty = new Map<string, string>()

function buildEnemy(floor: number): EnemyState {
  const idx = Math.min(Math.floor((floor - 1) / 3), ENEMIES.length - 1)
  const base = ENEMIES[idx]
  const scale = 1 + (floor - 1) * 0.08
  return {
    name: base.name, emoji: base.emoji,
    lv: base.lv + floor - 1,
    hp: Math.round(base.hp * scale),
    maxHp: Math.round(base.hp * scale),
    atk: Math.round(base.atk * scale),
    reward: Math.round(base.reward * scale),
  }
}

function alivePlayers(party: DungeonParty) {
  return party.players.filter(p => p.alive)
}

function currentTurnSocketId(party: DungeonParty): string | null {
  const alive = alivePlayers(party)
  if (alive.length === 0) return null
  return alive[party.turnIdx % alive.length].socketId
}

function toClientState(party: DungeonParty) {
  return {
    partyId: party.id,
    floor: party.floor,
    enemy: party.enemy,
    players: party.players.map(p => ({
      playerId: p.playerId, name: p.name, species: p.species,
      level: p.level, hp: p.hp, maxHp: p.maxHp, alive: p.alive, defending: p.defending,
    })),
    currentTurnPlayerId: (() => {
      const s = currentTurnSocketId(party)
      if (!s) return null
      return party.players.find(p => p.socketId === s)?.playerId ?? null
    })(),
    phase: party.phase,
  }
}

function advanceTurn(party: DungeonParty) {
  const alive = alivePlayers(party)
  if (alive.length === 0) return
  party.turnIdx = (party.turnIdx + 1) % alive.length
}

export function registerDungeonHandlers(io: Server) {
  const ns = io.of('/dungeon')

  ns.on('connection', (socket) => {
    socket.on('dungeon:join', (data: { playerId: string; name: string; species: string; level: number }) => {
      // Find open party (< 4 players, not finished)
      let party: DungeonParty | undefined
      for (const p of parties.values()) {
        if (p.phase === 'battle' && p.players.length < 4) { party = p; break }
      }
      if (!party) {
        const floor = 1
        party = {
          id: randomUUID(), players: [], floor,
          enemy: buildEnemy(floor), turnIdx: 0, phase: 'battle',
        }
        parties.set(party.id, party)
      }

      const maxHp = 80 + data.level * 4
      const player: DungeonPlayer = {
        socketId: socket.id, playerId: data.playerId,
        name: data.name, species: data.species, level: data.level,
        hp: maxHp, maxHp, defending: false, alive: true,
      }
      party.players.push(player)
      playerParty.set(socket.id, party.id)
      socket.join(party.id)

      ns.to(party.id).emit('dungeon:state', toClientState(party))
      ns.to(party.id).emit('dungeon:log', { message: `${data.name} が参戦した！`, type: 'join' })
    })

    socket.on('dungeon:action', (data: { type: 'attack' | 'skill' | 'item' | 'defend' }) => {
      const partyId = playerParty.get(socket.id)
      if (!partyId) return
      const party = parties.get(partyId)
      if (!party || party.phase !== 'battle') return
      if (currentTurnSocketId(party) !== socket.id) return

      const actor = party.players.find(p => p.socketId === socket.id)
      if (!actor || !actor.alive) return

      party.phase = 'animating'

      // ── プレイヤー行動 ──
      const petAtk = 8 + actor.level * 2
      let playerDmg = 0
      let logMsg = ''

      if (data.type === 'attack') {
        playerDmg = petAtk + Math.floor(Math.random() * petAtk * 0.5)
        party.enemy.hp = Math.max(0, party.enemy.hp - playerDmg)
        logMsg = `${actor.name} の攻撃！ ${party.enemy.name} に ${playerDmg} ダメージ！`
      } else if (data.type === 'skill') {
        playerDmg = 20 + actor.level * 4
        party.enemy.hp = Math.max(0, party.enemy.hp - playerDmg)
        logMsg = `${actor.name} のスキル発動！ ${party.enemy.name} に ${playerDmg} ダメージ！`
      } else if (data.type === 'item') {
        const heal = 30
        actor.hp = Math.min(actor.maxHp, actor.hp + heal)
        logMsg = `${actor.name} が回復！ HP +${heal}`
      } else if (data.type === 'defend') {
        actor.defending = true
        logMsg = `${actor.name} は防御の構え！`
      }

      ns.to(partyId).emit('dungeon:action_result', {
        actorId: actor.playerId,
        type: data.type,
        playerDmg,
        enemyHp: party.enemy.hp,
        actorHp: actor.hp,
        log: logMsg,
      })

      // ── 勝利チェック ──
      if (party.enemy.hp <= 0) {
        party.phase = 'victory'
        const reward = party.enemy.reward
        party.players.forEach(p => { if (p.alive) p.hp = p.maxHp }) // 全回復
        ns.to(partyId).emit('dungeon:victory', { floor: party.floor, reward })
        ns.to(partyId).emit('dungeon:log', { message: `🏆 ${party.enemy.name} を倒した！ +${reward}G`, type: 'victory' })
        return
      }

      // ── 敵の反撃（250ms後） ──
      setTimeout(() => {
        if (!parties.has(partyId)) return
        const rawDmg = party.enemy.atk
        const dmg = actor.defending ? Math.max(1, Math.round(rawDmg * 0.4)) : rawDmg
        actor.defending = false
        actor.hp = Math.max(0, actor.hp - dmg)
        if (actor.hp <= 0) actor.alive = false

        const atkLog = actor.alive
          ? `${party.enemy.name} の攻撃！ ${actor.name} に ${dmg} ダメージ！`
          : `${party.enemy.name} の攻撃！ ${actor.name} は倒れた…`

        ns.to(partyId).emit('dungeon:enemy_attack', {
          targetId: actor.playerId, dmg, actorHp: actor.hp, alive: actor.alive, log: atkLog,
        })

        // ── 全滅チェック ──
        if (alivePlayers(party).length === 0) {
          party.phase = 'defeat'
          ns.to(partyId).emit('dungeon:defeat')
          ns.to(partyId).emit('dungeon:log', { message: '💀 全滅… ダンジョンを脱出します', type: 'defeat' })
          return
        }

        advanceTurn(party)
        party.phase = 'battle'
        ns.to(partyId).emit('dungeon:state', toClientState(party))
      }, 800)
    })

    socket.on('dungeon:next_floor', () => {
      const partyId = playerParty.get(socket.id)
      if (!partyId) return
      const party = parties.get(partyId)
      if (!party || party.phase !== 'victory') return

      party.floor++
      party.enemy = buildEnemy(party.floor)
      party.turnIdx = 0
      party.phase = 'battle'
      party.players.forEach(p => { p.defending = false; p.alive = true; p.hp = p.maxHp })

      ns.to(partyId).emit('dungeon:state', toClientState(party))
      ns.to(partyId).emit('dungeon:log', { message: `📍 フロア ${party.floor} へ突入！`, type: 'floor' })
    })

    socket.on('dungeon:retreat', () => {
      const partyId = playerParty.get(socket.id)
      if (!partyId) return
      leaveParty(socket.id, partyId, ns)
    })

    socket.on('disconnect', () => {
      const partyId = playerParty.get(socket.id)
      if (partyId) leaveParty(socket.id, partyId, ns)
    })
  })
}

function leaveParty(socketId: string, partyId: string, ns: ReturnType<Server['of']>) {
  playerParty.delete(socketId)
  const party = parties.get(partyId)
  if (!party) return
  party.players = party.players.filter(p => p.socketId !== socketId)
  if (party.players.length === 0) {
    parties.delete(partyId)
  } else {
    const alive = alivePlayers(party)
    if (alive.length > 0) party.turnIdx = party.turnIdx % alive.length
    ns.to(partyId).emit('dungeon:state', toClientState(party))
  }
}
