import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import playersRouter from './routes/players.js'
import rankingRouter from './routes/ranking.js'
import eventsRouter from './routes/events.js'
import { registerParkHandlers } from './sockets/park.js'
import { registerDungeonHandlers } from './sockets/dungeon.js'

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
app.get('/health', (_req, res) => res.json({ ok: true }))

registerParkHandlers(io)
registerDungeonHandlers(io)

const PORT = Number(process.env.PORT ?? 3000)
httpServer.listen(PORT, () => console.log(`server running on :${PORT}`))
