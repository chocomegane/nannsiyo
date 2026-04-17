import { motion } from 'framer-motion'
import { DroppedItem as DroppedItemType } from '../types'

interface Props {
  item: DroppedItemType
  onCollect: (id: string) => void
}

export default function DroppedItem({ item, onCollect }: Props) {
  return (
    <motion.button
      className="absolute flex flex-col items-center cursor-pointer bg-white/80 rounded-xl px-2 py-1 shadow-md hover:scale-110 transition-transform"
      style={{ left: `${item.x}%`, top: `${item.y}%` }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      onClick={() => onCollect(item.id)}
      title={`クリックで回収: ${item.name}`}
    >
      <span className="text-2xl">✨</span>
      <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">
        {item.name}
      </span>
      <span className="text-xs text-yellow-600">{item.sellPrice}G</span>
    </motion.button>
  )
}
