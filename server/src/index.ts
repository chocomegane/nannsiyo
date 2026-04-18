import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import playersRouter from './routes/players'
import rankingRouter from './routes/ranking'
import eventsRouter from './routes/events'
import authRouter from './routes/auth'
import guildsRouter from './routes/guilds'
import friendsRouter from './routes/friends'
import { registerParkHandlers } from './sockets/park'
import { registerDungeonHandlers } from './sockets/dungeon'

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL ?? 'http://localhost:5173', credentials: true },
})

app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173', credentials: true }))
app.use(express.json())

app.use('/api/players', playersRouter)
app.use('/api/ranking', rankingRouter)
app.use('/api/events', eventsRouter)
app.use('/api/auth', authRouter)
app.use('/api/guilds', guildsRouter)
app.use('/api/friends', friendsRouter)
app.get('/health', (_req: import('express').Request, res: import('express').Response) => res.json({ ok: true }))

registerParkHandlers(io)
registerDungeonHandlers(io)

const PORT = Number(process.env.PORT ?? 3000)
httpServer.listen(PORT, () => console.log(`server running on :${PORT}`))
