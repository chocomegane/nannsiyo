import { useFurnitureStore } from '../store/furnitureStore'
import { FURNITURE_TABLE, SLOT_POSITION } from '../data/furniture'
import type { FurnitureItem } from '../types'

interface Props { overrideItems?: FurnitureItem[] }

export default function RoomDecorations({ overrideItems }: Props) {
  const storeItems = useFurnitureStore((s) => s.items)
  const items = overrideItems ?? storeItems
  const placedItems = items.filter((i) => i.placed)

  const slotMap = new Map<string, { emoji: string; name: string }>()
  for (const item of placedItems) {
    const master = FURNITURE_TABLE.find((f) => f.furnitureId === item.furnitureId)
    if (master && !slotMap.has(master.slot)) {
      slotMap.set(master.slot, { emoji: master.emoji, name: master.name })
    }
  }

  return (
    <>
      {Array.from(slotMap.entries()).map(([slot, { emoji, name }]) => {
        const pos = SLOT_POSITION[slot as keyof typeof SLOT_POSITION]
        return (
          <div
            key={slot}
            className="absolute select-none pointer-events-none"
            style={{ left: pos.left, bottom: pos.bottom, fontSize: pos.fontSize, transform: 'translateX(-50%)' }}
            title={name}
          >
            {emoji}
          </div>
        )
      })}
    </>
  )
}
