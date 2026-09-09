import { Undo2 } from "lucide-react"
import { useState } from "react"

import { OpeningAnimation } from "@/components/opening-animation"
import { ScoreDialog } from "@/components/score-dialog"
import { ScoreGrid } from "@/components/score-grid"
import { TopControls } from "@/components/top-controls"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { WinnerDialog } from "@/components/winner-dialog"
import {
  gameHistoryStorageKey,
  getDefaultGroupName,
  getStoredGameHistory,
  getStoredGroupNames,
  getStoredOption,
  getStoredScoreTarget,
  getStoredScoreEntries,
  groupCountStorageKey,
  groupNamesStorageKey,
  groupOptions,
  maxGameHistoryEntries,
  scoreEntriesStorageKey,
  scoreTargetStorageKey,
  type ScoreEntry,
} from "@/lib/domino-storage"

export function App() {
  const [scoreTarget, setScoreTarget] = useState(() =>
    getStoredScoreTarget()
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
  const [showRestartConfirmation, setShowRestartConfirmation] = useState(false)

  const groupNames = Array.from(
    { length: groupCount },
    (_, index) => customGroupNames[index] ?? getDefaultGroupName(index)
  )
  const selectedGroupName =
    selectedGroupIndex === null ? "" : groupNames[selectedGroupIndex]
  const isGameOver = groupNames.some((_, index) => {
    const groupTotal = scoreEntries
      .filter((entry) => entry.groupIndex === index)
      .reduce((total, entry) => total + Number(entry.score), 0)

    return groupTotal >= scoreTarget
  })

  function handleScoreTargetChange(score: number) {
    if (isGameOver) {
      return
    }
    const groupTotals = new Map<number, number>()
    const nextScoreEntries = scoreEntries.map((entry) => {
      const groupTotal = groupTotals.get(entry.groupIndex) ?? 0
      const cappedScore = Math.min(
        Number(entry.score),
        Math.max(0, score - groupTotal)
      )

      groupTotals.set(entry.groupIndex, groupTotal + cappedScore)
      return { ...entry, score: String(cappedScore) }
    })

    setScoreTarget(score)
    window.localStorage.setItem(scoreTargetStorageKey, String(score))
    setScoreEntries(nextScoreEntries)
    window.localStorage.setItem(
      scoreEntriesStorageKey,
      JSON.stringify(nextScoreEntries)
    )
  }

  function handleGroupCountChange(groups: number) {
    if (isGameOver || groups === groupCount) {
      return
    }

    const nextGroupNames = Object.fromEntries(
      Object.entries(customGroupNames).filter(
        ([index]) => Number(index) < groups
      )
    ) as Record<number, string>

    setGroupCount(groups)
    window.localStorage.setItem(groupCountStorageKey, String(groups))
    setCustomGroupNames(nextGroupNames)
    window.localStorage.setItem(
      groupNamesStorageKey,
      JSON.stringify(nextGroupNames)
    )
    setScoreEntries([])
    window.localStorage.removeItem(scoreEntriesStorageKey)
  }

  function openScoreDialog(index: number) {
    if (isGameOver) {
      return
    }

    setSelectedGroupIndex(index)
    setEditingScoreId(null)
    setScoreInput("")
    setIsRenaming(false)
    setNameInput(groupNames[index])
  }

  function openEditScoreDialog(entry: ScoreEntry) {
    if (isGameOver) {
      return
    }

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
    if (isGameOver || selectedGroupIndex === null || !scoreInput) {
      return
    }

    const selectedGroupTotalWithoutCurrentEntry = scoreEntries
      .filter(
        (entry) =>
          entry.groupIndex === selectedGroupIndex && entry.id !== editingScoreId
      )
      .reduce((total, entry) => total + Number(entry.score), 0)
    const cappedScore = String(
      Math.min(
        Number(scoreInput),
        Math.max(0, scoreTarget - selectedGroupTotalWithoutCurrentEntry)
      )
    )

    const roundId = crypto.randomUUID()
    let nextScoreEntries = editingScoreId
      ? scoreEntries.map((entry) =>
          entry.id === editingScoreId ? { ...entry, score: cappedScore } : entry
        )
      : [
          ...scoreEntries,
          {
            id: crypto.randomUUID(),
            roundId,
            groupIndex: selectedGroupIndex,
            score: cappedScore,
          },
        ]

    // When adding a new score (not editing), add 0 for all other groups
    if (!editingScoreId) {
      for (let i = 0; i < groupCount; i++) {
        if (i !== selectedGroupIndex) {
          nextScoreEntries = [
            ...nextScoreEntries,
            {
              id: crypto.randomUUID(),
              roundId,
              groupIndex: i,
              score: "0",
            },
          ]
        }
      }
    }

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
      // Wait for the score dialog to finish closing so Radix doesn't
      // immediately dismiss this alert as a leftover outside click.
      window.setTimeout(() => {
        setWinnerName(nextWinnerName)
      }, 150)
    }
  }

  function handleDeleteScore() {
    if (isGameOver || !editingScoreId) {
      return
    }

    const roundId = scoreEntries.find(
      (entry) => entry.id === editingScoreId
    )?.roundId
    if (!roundId) {
      return
    }

    const nextScoreEntries = scoreEntries.filter(
      (entry) => entry.roundId !== roundId
    )

    setScoreEntries(nextScoreEntries)
    window.localStorage.setItem(
      scoreEntriesStorageKey,
      JSON.stringify(nextScoreEntries)
    )
    closeScoreDialog()
  }

  function handleRestart() {
    setScoreEntries([])
    setWinnerName(null)
    closeScoreDialog()

    window.localStorage.removeItem(scoreEntriesStorageKey)
  }

  function handleWinnerClose() {
    setWinnerName(null)
  }

  function handleUndoLastRound() {
    if (isGameOver) {
      return
    }

    const latestRoundId = scoreEntries.at(-1)?.roundId

    if (!latestRoundId) {
      return
    }

    const nextScoreEntries = scoreEntries.filter(
      (entry) => entry.roundId !== latestRoundId
    )

    setScoreEntries(nextScoreEntries)
    window.localStorage.setItem(
      scoreEntriesStorageKey,
      JSON.stringify(nextScoreEntries)
    )
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
        hasScores={scoreEntries.length > 0}
        isGameOver={isGameOver}
        onScoreTargetChange={handleScoreTargetChange}
        onGroupCountChange={handleGroupCountChange}
        onDeleteHistory={handleDeleteHistory}
      />

      <ScoreGrid
        groupNames={groupNames}
        scoreEntries={scoreEntries}
        scoreTarget={scoreTarget}
        isGameOver={isGameOver}
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

      <WinnerDialog
        open={winnerName !== null}
        winnerName={winnerName ?? ""}
        onClose={handleWinnerClose}
        onRestart={handleRestart}
      />

      <div className="fixed bottom-20 left-1/2 z-40 flex -translate-x-1/2 gap-2">
        <Button
          variant="outline"
          size="lg"
          className="h-12 px-4 text-base"
          disabled={isGameOver || scoreEntries.length === 0}
          onClick={handleUndoLastRound}
        >
          <Undo2 />
          Undo round
        </Button>
        <Button
          variant="destructive"
          size="lg"
          className="h-12 px-8 text-base"
          onClick={() => setShowRestartConfirmation(true)}
        >
          Restart
        </Button>
      </div>

      <footer className="fixed inset-x-0 bottom-0 z-30 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 text-center text-xs text-muted-foreground">
        <div className="inline-flex items-center gap-x-3">
          <span>© {new Date().getFullYear()} Barney Vargas</span>
          <span aria-hidden className="text-border">
            ·
          </span>
          <a
            href="https://github.com/BarneyVargas/domino-score-tracker"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden
              className="size-3.5 fill-current"
            >
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
            </svg>
            GitHub
          </a>
        </div>
      </footer>

      <AlertDialog
        open={showRestartConfirmation}
        onOpenChange={setShowRestartConfirmation}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restart this game?</AlertDialogTitle>
            <AlertDialogDescription>
              All current scores will be cleared. Your completed game history
              will stay saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleRestart}>
              Restart game
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default App
