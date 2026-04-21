import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import rateLimit from 'express-rate-limit'
import playersRouter from './routes/players'
import rankingRouter from './routes/ranking'
import lotteryRouter from './routes/lottery'
import eventsRouter from './routes/events'
import authRouter from './routes/auth'
import guildsRouter from './routes/guilds'
import friendsRouter from './routes/friends'
import boardRouter from './routes/board'
import settingsRouter from './routes/settings'
import { registerParkHandlers } from './sockets/park'
import { registerDungeonHandlers } from './sockets/dungeon'
import { registerRadioHandlers } from './sockets/radio'
import db from './db/database'

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL ?? 'http://localhost:5173', credentials: true },
})

// Socket.io認証: handshake.auth.playerIdをDBで検証
io.use((socket, next) => {
  const playerId = socket.handshake.auth?.playerId as string | undefined
  if (!playerId) return next(new Error('auth required'))
  const player = db.prepare('SELECT id FROM players WHERE id = ?').get(playerId)
  if (!player) return next(new Error('invalid playerId'))
  next()
})

app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173', credentials: true }))
app.use(express.json())

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false })
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false })

app.use('/api/auth', authLimiter, authRouter)
app.use('/api/players', apiLimiter, playersRouter)
app.use('/api/ranking', apiLimiter, rankingRouter)
app.use('/api/lottery', apiLimiter, lotteryRouter)
app.use('/api/events', apiLimiter, eventsRouter)
app.use('/api/guilds', apiLimiter, guildsRouter)
app.use('/api/friends', apiLimiter, friendsRouter)
app.use('/api/board', apiLimiter, boardRouter)
app.use('/api/settings', apiLimiter, settingsRouter)
app.get('/health', (_req: import('express').Request, res: import('express').Response) => res.json({ ok: true }))

registerParkHandlers(io)
registerDungeonHandlers(io)
registerRadioHandlers(io)

const PORT = Number(process.env.PORT ?? 3000)
httpServer.listen(PORT, () => console.log(`server running on :${PORT}`))
