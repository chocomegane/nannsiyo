import { Router } from 'express'
import db from '../db/database'
import { randomUUID } from 'crypto'

const router = Router()

router.post('/', (req, res) => {
  const { name } = req.body as { name: string }
  if (!name) { res.status(400).json({ error: 'name required' }); return }
  const id = randomUUID()
  const now = new Date().toISOString()
  db.prepare('INSERT INTO players (id, name, money, created_at, updated_at) VALUES (?, ?, 0, ?, ?)').run(id, name, now, now)
  res.json({ id, name, money: 0 })
})

router.get('/:id', (req, res) => {
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id)
  if (!player) { res.status(404).json({ error: 'not found' }); return }
  res.json(player)
})

router.patch('/:id/money', (req, res) => {
  const { amount } = req.body as { amount: number }
  const now = new Date().toISOString()
  db.prepare('UPDATE players SET money = money + ?, updated_at = ? WHERE id = ?').run(amount, now, req.params.id)
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id)
  res.json(player)
})

router.get('/:id/state', (req, res) => {
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id)
  if (!player) { res.status(404).json({ error: 'not found' }); return }
  const pet = db.prepare('SELECT * FROM pets WHERE player_id = ?').get(req.params.id)
  const inventory = db.prepare('SELECT * FROM inventory WHERE player_id = ?').all(req.params.id)
  const foodInventory = db.prepare('SELECT * FROM food_inventory WHERE player_id = ?').all(req.params.id)
  res.json({ player, pet, inventory, foodInventory })
})

router.put('/:id/state', (req, res) => {
  const { player, pet, inventory, foodInventory } = req.body as {
    player: { name: string; money: number }
    pet: { id: string; name: string; species: string; level: number; exp: number; stats: { happiness: number; hunger: number }; unlockedSkills: string[] }
    inventory: { id: string; itemId: string; name: string; sellPrice: number }[]
    foodInventory: { id: string; foodId: string; name: string; price: number }[]
  }
  const now = new Date().toISOString()

  db.prepare('UPDATE players SET name = ?, money = ?, updated_at = ? WHERE id = ?')
    .run(player.name, player.money, now, req.params.id)

  db.prepare(`INSERT OR REPLACE INTO pets (id, player_id, name, species, level, exp, happiness, hunger, unlocked_skills, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(pet.id, req.params.id, pet.name, pet.species, pet.level, pet.exp,
      pet.stats.happiness, pet.stats.hunger, JSON.stringify(pet.unlockedSkills), now)

  db.prepare('DELETE FROM inventory WHERE player_id = ?').run(req.params.id)
  for (const item of inventory) {
    db.prepare('INSERT INTO inventory (id, player_id, item_id, name, sell_price, obtained_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(item.id, req.params.id, item.itemId, item.name, item.sellPrice, now)
  }

  db.prepare('DELETE FROM food_inventory WHERE player_id = ?').run(req.params.id)
  for (const food of foodInventory) {
    db.prepare('INSERT INTO food_inventory (id, player_id, food_id, name, price) VALUES (?, ?, ?, ?, ?)')
      .run(food.id, req.params.id, food.foodId, food.name, food.price)
  }

  res.json({ ok: true })
})

export default router
