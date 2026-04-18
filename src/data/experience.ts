export const MAX_LEVEL = 100

export function expRequiredForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5))
}

export function expToNextLevel(currentLevel: number): number {
  if (currentLevel >= MAX_LEVEL) return Infinity
  return expRequiredForLevel(currentLevel + 1)
}
