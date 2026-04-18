import type { Pet, DroppedItem } from '../types'
import { DROP_TABLE, weightedRandom } from '../data/items'

const BASE_MIN = 5_000
const BASE_MAX = 10_000

// happiness が高いほどドロップが早くなる（最大50%短縮）
function calcInterval(happiness: number): number {
  const factor = 1 - (happiness / 100) * 0.5
  const min = BASE_MIN * factor
  const max = BASE_MAX * factor
  return min + Math.random() * (max - min)
}

export function startDropLoop(
  getPet: () => Pet,
  addDroppedItem: (item: DroppedItem) => void,
): () => void {
  let timeoutId: ReturnType<typeof setTimeout>

  function schedule() {
    const pet = getPet()
    const delay = calcInterval(pet.stats.happiness)
    timeoutId = setTimeout(() => {
      const currentPet = getPet()
      const table = DROP_TABLE[currentPet.species]
      if (table) {
        const entry = weightedRandom(table)
        const item: DroppedItem = {
          id: crypto.randomUUID(),
          itemId: entry.itemId,
          name: entry.name,
          sellPrice: entry.sellPrice,
          x: 10 + Math.random() * 75,
          y: 52 + Math.random() * 33,
        }
        addDroppedItem(item)
        console.log('[drop]', item.name, new Date().toLocaleTimeString())
      }
      schedule()
    }, delay)
  }

  schedule()
  return () => clearTimeout(timeoutId)
}
