import { useState } from "react"

import { OpeningAnimation } from "@/components/opening-animation"
import { ScoreDialog } from "@/components/score-dialog"
import { ScoreGrid } from "@/components/score-grid"
import { TopControls } from "@/components/top-controls"
import { Button } from "@/components/ui/button"
import { WinnerDialog } from "@/components/winner-dialog"
import {
  gameHistoryStorageKey,
  getDefaultGroupName,
  getStoredGameHistory,
  getStoredGroupNames,
  getStoredOption,
  getStoredScoreEntries,
  groupCountStorageKey,
  groupNamesStorageKey,
  groupOptions,
  maxGameHistoryEntries,
  scoreEntriesStorageKey,
  scoreOptions,
  scoreTargetStorageKey,
  type ScoreEntry,
} from "@/lib/domino-storage"

export function App() {
  const [scoreTarget, setScoreTarget] = useState(() =>
    getStoredOption(scoreTargetStorageKey, scoreOptions, scoreOptions[0])
  )
  const [groupCount, setGroupCount] = useState(() =>
    getStoredOption(groupCountStorageKey, groupOptions, groupOptions[0])
  )
  const [customGroupNames, setCustomGroupNames] = useState(getStoredGroupNames)
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(
    null
  )
  const [scoreEntries, setScoreEntries] = useState(getStoredScoreEntries)
  const [gameHistory, setGameHistory] = useState(getStoredGameHistory)
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null)
  const [scoreInput, setScoreInput] = useState("")
  const [isRenaming, setIsRenaming] = useState(false)
  const [nameInput, setNameInput] = useState("")
  const [winnerName, setWinnerName] = useState<string | null>(null)

  const groupNames = Array.from(
    { length: groupCount },
    (_, index) => customGroupNames[index] ?? getDefaultGroupName(index)
  )
  const selectedGroupName =
    selectedGroupIndex === null ? "" : groupNames[selectedGroupIndex]

  function handleScoreTargetChange(score: number) {
    setScoreTarget(score)
    window.localStorage.setItem(scoreTargetStorageKey, String(score))
  }

  function handleGroupCountChange(groups: number) {
    setGroupCount(groups)
    window.localStorage.setItem(groupCountStorageKey, String(groups))
  }

  function openScoreDialog(index: number) {
    setSelectedGroupIndex(index)
    setEditingScoreId(null)
    setScoreInput("")
    setIsRenaming(false)
    setNameInput(groupNames[index])
  }

  function openEditScoreDialog(entry: ScoreEntry) {
    setSelectedGroupIndex(entry.groupIndex)
    setEditingScoreId(entry.id)
    setScoreInput(entry.score)
    setIsRenaming(false)
    setNameInput(
      groupNames[entry.groupIndex] ?? getDefaultGroupName(entry.groupIndex)
    )
  }

  function closeScoreDialog() {
    setSelectedGroupIndex(null)
    setEditingScoreId(null)
    setScoreInput("")
    setIsRenaming(false)
  }

  function handleScoreInputChange(value: string) {
    setScoreInput(value.replace(/\D/g, ""))
  }

  function handleRenameSave() {
    if (selectedGroupIndex === null) {
      return
    }

    const nextName = nameInput.trim() || getDefaultGroupName(selectedGroupIndex)
    const nextGroupNames = {
      ...customGroupNames,
      [selectedGroupIndex]: nextName,
    }

    setCustomGroupNames(nextGroupNames)
    window.localStorage.setItem(
      groupNamesStorageKey,
      JSON.stringify(nextGroupNames)
    )
    setIsRenaming(false)
  }

  function handleAddScore() {
    if (selectedGroupIndex === null || !scoreInput) {
      return
    }

    const nextScoreEntries = editingScoreId
      ? scoreEntries.map((entry) =>
          entry.id === editingScoreId ? { ...entry, score: scoreInput } : entry
        )
      : [
          ...scoreEntries,
          {
            id: crypto.randomUUID(),
            groupIndex: selectedGroupIndex,
            score: scoreInput,
          },
        ]

    setScoreEntries(nextScoreEntries)
    window.localStorage.setItem(
      scoreEntriesStorageKey,
      JSON.stringify(nextScoreEntries)
    )
    closeScoreDialog()

    const nextSelectedGroupTotal = nextScoreEntries
      .filter((entry) => entry.groupIndex === selectedGroupIndex)
      .reduce((total, entry) => total + Number(entry.score), 0)

    if (nextSelectedGroupTotal >= scoreTarget) {
      const nextWinnerName =
        groupNames[selectedGroupIndex] ??
        getDefaultGroupName(selectedGroupIndex)
      const nextGameHistory = [
        {
          id: crypto.randomUUID(),
          winnerName: nextWinnerName,
          winnerScore: nextSelectedGroupTotal,
          targetScore: scoreTarget,
          playedAt: new Date().toISOString(),
        },
        ...gameHistory,
      ].slice(0, maxGameHistoryEntries)

      setGameHistory(nextGameHistory)
      window.localStorage.setItem(
        gameHistoryStorageKey,
        JSON.stringify(nextGameHistory)
      )
      setWinnerName(nextWinnerName)
    }
  }

  function handleDeleteScore() {
    if (!editingScoreId) {
      return
    }

    const nextScoreEntries = scoreEntries.filter(
      (entry) => entry.id !== editingScoreId
    )

    setScoreEntries(nextScoreEntries)
    window.localStorage.setItem(
      scoreEntriesStorageKey,
      JSON.stringify(nextScoreEntries)
    )
    closeScoreDialog()
  }

  function handleRestart() {
    setCustomGroupNames({})
    setScoreEntries([])
    setWinnerName(null)
    closeScoreDialog()

    window.localStorage.removeItem(groupNamesStorageKey)
    window.localStorage.removeItem(scoreEntriesStorageKey)
  }

  function handleDeleteHistory() {
    setGameHistory([])
    window.localStorage.removeItem(gameHistoryStorageKey)
  }

  return (
    <>
      <OpeningAnimation />

      <TopControls
        scoreTarget={scoreTarget}
        groupCount={groupCount}
        gameHistory={gameHistory}
        onScoreTargetChange={handleScoreTargetChange}
        onGroupCountChange={handleGroupCountChange}
        onDeleteHistory={handleDeleteHistory}
      />

      <ScoreGrid
        groupNames={groupNames}
        scoreEntries={scoreEntries}
        scoreTarget={scoreTarget}
        onAddScore={openScoreDialog}
        onEditScore={openEditScoreDialog}
      />

      <ScoreDialog
        open={selectedGroupIndex !== null}
        selectedGroupName={selectedGroupName}
        isRenaming={isRenaming}
        nameInput={nameInput}
        scoreInput={scoreInput}
        editingScoreId={editingScoreId}
        onOpenChange={(open) => {
          if (!open) {
            closeScoreDialog()
          }
        }}
        onNameInputChange={setNameInput}
        onScoreInputChange={handleScoreInputChange}
        onRenameStart={() => {
          setNameInput(selectedGroupName)
          setIsRenaming(true)
        }}
        onRenameSave={handleRenameSave}
        onAddScore={handleAddScore}
        onDeleteScore={handleDeleteScore}
        onCancel={closeScoreDialog}
      />

      <WinnerDialog winnerName={winnerName} onRestart={handleRestart} />

      <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
        <Button
          variant="destructive"
          size="lg"
          className="h-12 px-8 text-base"
          onClick={handleRestart}
        >
          Restart
        </Button>
      </div>
    </>
  )
}

export default App
