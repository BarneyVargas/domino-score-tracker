import { useEffect, useState } from "react"
import { ChevronRight, Crown, History, Plus, Users } from "lucide-react"
import NumberFlow from "@number-flow/react"

import { ModeToggle } from "./components/mode-toggle"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"

const scoreOptions = [100, 150, 200, 250, 500]
const groupOptions = [2, 4, 6]
const scoreTargetStorageKey = "domino-tracker-score-target"
const groupCountStorageKey = "domino-tracker-group-count"
const groupNamesStorageKey = "domino-tracker-group-names"
const scoreEntriesStorageKey = "domino-tracker-score-entries"
const gameHistoryStorageKey = "domino-tracker-game-history"
const maxGameHistoryEntries = 10

type ScoreEntry = {
  id: string
  groupIndex: number
  score: string
}

type GameHistoryEntry = {
  id: string
  winnerName: string
  winnerScore: number
  targetScore: number
  playedAt: string
}

function AnimatedNumberFlow({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      setDisplayValue(value)
    })

    return () => window.cancelAnimationFrame(animationFrame)
  }, [value])

  return <NumberFlow value={displayValue} />
}

function getStoredOption(
  key: string,
  options: readonly number[],
  fallback: number
) {
  const storedValue = window.localStorage.getItem(key)
  const parsedValue = storedValue ? Number(storedValue) : NaN

  return options.includes(parsedValue) ? parsedValue : fallback
}

function getDefaultGroupName(index: number) {
  return index === 0 ? "Home" : `Visitor ${index}`
}

function getStoredGroupNames() {
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

function getStoredScoreEntries() {
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

function getStoredGameHistory() {
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
  const [showOpeningAnimation, setShowOpeningAnimation] = useState(true)
  const [isOpeningAnimationExiting, setIsOpeningAnimationExiting] =
    useState(false)

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => {
      setIsOpeningAnimationExiting(true)
    }, 2200)
    const hideTimer = window.setTimeout(() => {
      setShowOpeningAnimation(false)
    }, 2600)

    return () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(hideTimer)
    }
  }, [])

  function handleScoreTargetChange(score: number) {
    setScoreTarget(score)
    window.localStorage.setItem(scoreTargetStorageKey, String(score))
  }

  function handleGroupCountChange(groups: number) {
    setGroupCount(groups)
    window.localStorage.setItem(groupCountStorageKey, String(groups))
  }

  const groupNames = Array.from(
    { length: groupCount },
    (_, index) => customGroupNames[index] ?? getDefaultGroupName(index)
  )
  const selectedGroupName =
    selectedGroupIndex === null ? "" : groupNames[selectedGroupIndex]

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
        groupNames[selectedGroupIndex] ?? getDefaultGroupName(selectedGroupIndex)
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

  return (
    <>
      {showOpeningAnimation && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#050505] transition-opacity duration-400 ${
            isOpeningAnimationExiting ? "opacity-0" : "opacity-100"
          }`}
        >
          <img
            src="/opening_animation.gif"
            alt=""
            className="h-auto w-full max-w-sm drop-shadow-[0_0_32px_rgb(0_0_0/0.9)]"
          />
        </div>
      )}

      <div className="fixed top-4 right-4 left-4 z-50 flex items-center justify-between">
        <Drawer direction="left">
          <DrawerTrigger asChild>
            <Button variant="outline" size="icon-lg" aria-label="History">
              <History />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Game History</DrawerTitle>
              <DrawerDescription>
                Recent winners saved on this device.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {gameHistory.length > 0 ? (
                <div className="divide-y rounded-lg border">
                  {gameHistory.map((entry) => (
                    <div key={entry.id} className="grid gap-1 px-3 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="truncate font-heading text-base font-medium">
                          {entry.winnerName}
                        </span>
                        <span className="shrink-0 font-heading text-base font-semibold">
                          <AnimatedNumberFlow value={entry.winnerScore} /> /{" "}
                          <AnimatedNumberFlow value={entry.targetScore} />
                        </span>
                      </div>
                      <time
                        className="text-xs text-muted-foreground"
                        dateTime={entry.playedAt}
                      >
                        {new Date(entry.playedAt).toLocaleDateString()}
                      </time>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                  No completed games yet.
                </div>
              )}
            </div>
          </DrawerContent>
        </Drawer>
        <ModeToggle />
      </div>

      <div className="fixed top-16 right-4 left-4 z-50 flex items-center justify-between gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="default"
              className="min-w-16 gap-1 px-2.5"
            >
              <span>
                <AnimatedNumberFlow value={scoreTarget} />
              </span>
              <ChevronRight />
              <span className="sr-only">Change score target</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-24">
            {scoreOptions.map((score) => (
              <DropdownMenuItem
                key={score}
                onClick={() => handleScoreTargetChange(score)}
              >
                {score}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="default"
              className="min-w-16 gap-1 px-2.5"
            >
              <Users />
              <span>
                <AnimatedNumberFlow value={groupCount} />
              </span>
              <span className="sr-only">Change group count</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-24">
            {groupOptions.map((groups) => (
              <DropdownMenuItem
                key={groups}
                onClick={() => handleGroupCountChange(groups)}
              >
                {groups}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mx-auto mt-30 grid w-full max-w-sm grid-cols-2 items-start gap-3 px-4">
        {groupNames.map((groupName, index) => {
          const groupScoreEntries = scoreEntries.filter(
            (entry) => entry.groupIndex === index
          )
          const groupScoreTotal = groupScoreEntries.reduce(
            (total, entry) => total + Number(entry.score),
            0
          )

          return (
            <div
              key={index}
              className="min-w-0 overflow-hidden rounded-lg border bg-card"
            >
              <Button
                variant="ghost"
                className="h-16 w-full flex-col gap-1 rounded-none border-0 text-base"
                aria-label={`Add score for ${groupName}`}
                onClick={() => openScoreDialog(index)}
              >
                <span className="text-center font-heading text-base font-medium">
                  {groupName}
                </span>
                <Plus />
              </Button>

              {groupScoreEntries.length > 0 && (
                <div className="divide-y border-t">
                  {groupScoreEntries.map((entry, scoreIndex) => (
                    <button
                      key={entry.id}
                      type="button"
                      className="grid w-full grid-cols-[auto_1fr] items-center gap-2 px-2 py-2 text-left transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                      onClick={() => openEditScoreDialog(entry)}
                    >
                      <span className="inline-flex min-w-7 items-center justify-center rounded-md px-2 text-sm font-medium">
                        <AnimatedNumberFlow value={scoreIndex + 1} />
                      </span>
                      <span className="truncate text-right font-heading text-base font-medium">
                        <AnimatedNumberFlow value={Number(entry.score)} />
                      </span>
                    </button>
                  ))}
                  <div className="bg-secondary px-3 py-2 text-center text-secondary-foreground">
                    <div className="text-xs font-medium text-muted-foreground">
                      Total
                    </div>
                    <div className="font-heading text-lg font-semibold">
                      <AnimatedNumberFlow value={groupScoreTotal} /> /{" "}
                      <AnimatedNumberFlow value={scoreTarget} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <Dialog
        open={selectedGroupIndex !== null}
        onOpenChange={(open) => {
          if (!open) {
            closeScoreDialog()
          }
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader className="items-center text-center">
            {isRenaming ? (
              <div className="flex w-full items-center gap-2">
                <Input
                  value={nameInput}
                  onChange={(event) => setNameInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleRenameSave()
                    }
                  }}
                  aria-label="Group name"
                  className="h-9 text-center"
                />
                <Button size="sm" onClick={handleRenameSave}>
                  Save
                </Button>
              </div>
            ) : (
              <DialogTitle className="w-full text-center text-xl">
                <button
                  type="button"
                  className="rounded-md px-2 py-1 transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                  onClick={() => {
                    setNameInput(selectedGroupName)
                    setIsRenaming(true)
                  }}
                >
                  {selectedGroupName}
                </button>
              </DialogTitle>
            )}
          </DialogHeader>

          <Input
            value={scoreInput}
            onChange={(event) => handleScoreInputChange(event.target.value)}
            inputMode="numeric"
            pattern="[0-9]*"
            onKeyDown={(event) => {
              if (event.key === "Enter" && scoreInput) {
                handleAddScore()
              }
            }}
            placeholder="Score"
            aria-label="Score"
            className="h-12 text-center text-2xl"
          />

          <DialogFooter>
            {editingScoreId && (
              <Button variant="destructive" onClick={handleDeleteScore}>
                Delete
              </Button>
            )}
            <DialogClose asChild>
              <Button variant="outline" onClick={closeScoreDialog}>
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleAddScore} disabled={!scoreInput}>
              {editingScoreId ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={winnerName !== null}
        onOpenChange={(open) => {
          if (!open) {
            handleRestart()
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader className="grid grid-rows-[auto_auto_auto] place-items-center text-center sm:place-items-center sm:text-center">
            <AlertDialogMedia className="mx-auto row-auto">
              <Crown />
            </AlertDialogMedia>
            <AlertDialogTitle className="text-center text-xl">
              {winnerName} won!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              They reached the selected score target.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col items-stretch sm:justify-stretch">
            <AlertDialogAction
              className="w-full justify-center"
              onClick={handleRestart}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
