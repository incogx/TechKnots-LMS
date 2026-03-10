/**
 * Level System Utilities
 * 
 * XP progression formula: XP required for level N = 100 * N * (N + 1) / 2
 * This creates an exponential curve where each level requires more XP
 */

/**
 * Calculate the level from total XP
 * @param xp Total XP accumulated
 * @returns Current level (starts at 1)
 */
export function calculateLevel(xp: number): number {
  if (xp < 0) return 1;
  
  let level = 1;
  let requiredXP = calculateXPForLevel(level + 1);
  
  while (xp >= requiredXP) {
    level++;
    requiredXP = calculateXPForLevel(level + 1);
  }
  
  return level;
}

/**
 * Calculate total XP required to reach a specific level
 * @param level Target level
 * @returns Total XP required to reach that level
 */
export function calculateXPForLevel(level: number): number {
  if (level <= 1) return 0;
  // Formula: 100 * (level - 1) * level / 2
  // This gives: Level 2 = 100, Level 3 = 300, Level 4 = 600, etc.
  return 100 * (level - 1) * level / 2;
}

/**
 * Calculate XP required for the next level
 * @param currentLevel Current level
 * @returns XP required to reach next level
 */
export function calculateXPForNextLevel(currentLevel: number): number {
  const nextLevelXP = calculateXPForLevel(currentLevel + 1);
  const currentLevelXP = calculateXPForLevel(currentLevel);
  return nextLevelXP - currentLevelXP;
}

/**
 * Calculate progress to next level (0-100)
 * @param currentXP Current total XP
 * @param currentLevel Current level
 * @returns Progress percentage (0-100)
 */
export function calculateXPProgress(currentXP: number, currentLevel: number): number {
  const currentLevelXP = calculateXPForLevel(currentLevel);
  const nextLevelXP = calculateXPForLevel(currentLevel + 1);
  const xpInCurrentLevel = currentXP - currentLevelXP;
  const xpNeededForNextLevel = nextLevelXP - currentLevelXP;
  
  if (xpNeededForNextLevel === 0) return 100;
  
  const progress = (xpInCurrentLevel / xpNeededForNextLevel) * 100;
  return Math.min(100, Math.max(0, progress));
}

/**
 * Calculate XP remaining until next level
 * @param currentXP Current total XP
 * @param currentLevel Current level
 * @returns XP needed to reach next level
 */
export function calculateXPToNextLevel(currentXP: number, currentLevel: number): number {
  const nextLevelXP = calculateXPForLevel(currentLevel + 1);
  const remaining = nextLevelXP - currentXP;
  return Math.max(0, remaining);
}

/**
 * Check if user leveled up after gaining XP
 * @param oldXP Previous XP total
 * @param newXP New XP total
 * @returns Object with levelUp boolean and new level if leveled up
 */
export function checkLevelUp(oldXP: number, newXP: number): { levelUp: boolean; oldLevel: number; newLevel: number } {
  const oldLevel = calculateLevel(oldXP);
  const newLevel = calculateLevel(newXP);
  
  return {
    levelUp: newLevel > oldLevel,
    oldLevel,
    newLevel,
  };
}

/**
 * Get level display info
 * @param xp Current XP
 * @returns Object with level, progress, and XP info
 */
export function getLevelInfo(xp: number) {
  const level = calculateLevel(xp);
  const currentLevelXP = calculateXPForLevel(level);
  const nextLevelXP = calculateXPForLevel(level + 1);
  const xpInCurrentLevel = xp - currentLevelXP;
  const xpNeededForNextLevel = nextLevelXP - currentLevelXP;
  const progress = calculateXPProgress(xp, level);
  const xpToNextLevel = calculateXPToNextLevel(xp, level);
  
  return {
    level,
    currentXP: xp,
    currentLevelXP,
    nextLevelXP,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    xpToNextLevel,
    progress,
  };
}

