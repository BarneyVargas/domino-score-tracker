export const scoreOptions = [100, 150, 200, 250, 500]
export const groupOptions = [2, 4, 6]
export const scoreTargetStorageKey = "domino-tracker-score-target"
export const groupCountStorageKey = "domino-tracker-group-count"
export const groupNamesStorageKey = "domino-tracker-group-names"
export const scoreEntriesStorageKey = "domino-tracker-score-entries"
export const gameHistoryStorageKey = "domino-tracker-game-history"
export const maxGameHistoryEntries = 10

export type ScoreEntry = {
  id: string
  groupIndex: number
  score: string
}

export type GameHistoryEntry = {
  id: string
  winnerName: string
  winnerScore: number
  targetScore: number
  playedAt: string
}

export function getStoredOption(
  key: string,
  options: readonly number[],
  fallback: number
) {
  const storedValue = window.localStorage.getItem(key)
  const parsedValue = storedValue ? Number(storedValue) : NaN

  return options.includes(parsedValue) ? parsedValue : fallback
}

export function getDefaultGroupName(index: number) {
  return index === 0 ? "Home" : `Visitor ${index}`
}

export function getStoredGroupNames() {
  const storedValue = window.localStorage.getItem(groupNamesStorageKey)

  if (!storedValue) {
    return {}
  }

  try {
    const parsedValue = JSON.parse(storedValue) as unknown

    if (!parsedValue || typeof parsedValue !== "object") {
      return {}
    }

    return Object.fromEntries(
      Object.entries(parsedValue).filter(
        ([, value]) => typeof value === "string" && value.trim()
      )
    ) as Record<number, string>
  } catch {
    return {}
  }
}

export function getStoredScoreEntries() {
  const storedValue = window.localStorage.getItem(scoreEntriesStorageKey)

  if (!storedValue) {
    return []
  }

  try {
    const parsedValue = JSON.parse(storedValue) as unknown

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue.filter(
      (entry): entry is ScoreEntry =>
        entry &&
        typeof entry === "object" &&
        "id" in entry &&
        "groupIndex" in entry &&
        "score" in entry &&
        typeof entry.id === "string" &&
        typeof entry.groupIndex === "number" &&
        typeof entry.score === "string"
    )
  } catch {
    return []
  }
}

export function getStoredGameHistory() {
  const storedValue = window.localStorage.getItem(gameHistoryStorageKey)

  if (!storedValue) {
    return []
  }

  try {
    const parsedValue = JSON.parse(storedValue) as unknown

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue.filter(
      (entry): entry is GameHistoryEntry =>
        entry &&
        typeof entry === "object" &&
        "id" in entry &&
        "winnerName" in entry &&
        "winnerScore" in entry &&
        "targetScore" in entry &&
        "playedAt" in entry &&
        typeof entry.id === "string" &&
        typeof entry.winnerName === "string" &&
        typeof entry.winnerScore === "number" &&
        typeof entry.targetScore === "number" &&
        typeof entry.playedAt === "string"
    )
  } catch {
    return []
  }
}
