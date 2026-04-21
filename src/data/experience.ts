export const MAX_LEVEL = 100

export function expRequiredForLevel(level: number): number {
  return 50 * level * level
}

export function expToNextLevel(currentLevel: number): number {
  if (currentLevel >= MAX_LEVEL) return Infinity
  return expRequiredForLevel(currentLevel + 1)
}
