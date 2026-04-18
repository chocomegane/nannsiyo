import { useState } from 'react'
import { usePetStore } from '../store/petStore'
import { SKILL_TABLE } from '../data/skills'
import type { Skill } from '../types'

interface Props {
  onUseSkill: (skill: Skill) => void
}

const CATEGORY_EMOJI: Record<string, string> = {
  attack: '⚔️', expression: '😄', party: '🎉',
  item: '🎁', move: '🌀', support: '💚', transform: '🌈',
}

export default function SkillPanel({ onUseSkill }: Props) {
  const [open, setOpen] = useState(false)
  const unlockedSkills = usePetStore((s) => s.pet.unlockedSkills)
  const level = usePetStore((s) => s.pet.level)

  const available = SKILL_TABLE.filter((s) => unlockedSkills.includes(s.id))
  const locked = SKILL_TABLE.filter((s) => !unlockedSkills.includes(s.id) && s.unlockLevel <= level + 3)

  if (SKILL_TABLE.every((s) => !unlockedSkills.includes(s.id)) && level < 2) return null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="bg-white/90 rounded-2xl px-4 py-2 shadow-lg font-bold text-sm text-purple-700 hover:bg-white transition-colors"
      >
        ⚡ スキル
        {available.length > 0 && (
          <span className="ml-1 bg-purple-600 text-white rounded-full px-1.5 py-0.5 text-xs">
            {available.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-12 left-0 bg-white rounded-2xl shadow-xl p-3 w-56 z-20">
          {available.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-2">Lv.2以上でスキル解放</p>
          )}
          {available.map((skill) => (
            <button
              key={skill.id}
              onClick={() => { onUseSkill(skill); setOpen(false) }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-purple-50 text-sm mb-1"
            >
              <span>{CATEGORY_EMOJI[skill.category]}</span>
              <span className="font-bold">{skill.name}</span>
            </button>
          ))}
          {locked.length > 0 && (
            <>
              <p className="text-xs font-bold text-gray-300 mt-2 mb-1">まもなく解放</p>
              {locked.map((skill) => (
                <div key={skill.id} className="flex items-center gap-2 px-2 py-1 text-sm text-gray-300">
                  <span>{CATEGORY_EMOJI[skill.category]}</span>
                  <span>{skill.name}</span>
                  <span className="ml-auto text-xs">Lv.{skill.unlockLevel}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
