import { ChevronRight, History, Trash2Icon, Users } from "lucide-react"
import { useState } from "react"

import { AnimatedNumberFlow } from "@/components/animated-number-flow"
import { ModeToggle } from "@/components/mode-toggle"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
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
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  groupOptions,
  scoreOptions,
  type GameHistoryEntry,
} from "@/lib/domino-storage"

type TopControlsProps = {
  scoreTarget: number
  groupCount: number
  gameHistory: GameHistoryEntry[]
  hasScores: boolean
  onScoreTargetChange: (score: number) => void
  onGroupCountChange: (groups: number) => void
  onDeleteHistory: () => void
}

export function TopControls({
  scoreTarget,
  groupCount,
  gameHistory,
  hasScores,
  onScoreTargetChange,
  onGroupCountChange,
  onDeleteHistory,
}: TopControlsProps) {
  const [customScoreInput, setCustomScoreInput] = useState("")
  const [showCustomScoreDialog, setShowCustomScoreDialog] = useState(false)
  const [showDeleteHistoryConfirmation, setShowDeleteHistoryConfirmation] =
    useState(false)
  const [pendingScoreTarget, setPendingScoreTarget] = useState<number | null>(
    null
  )
  const [pendingGroupCount, setPendingGroupCount] = useState<number | null>(
    null
  )

  function requestScoreTargetChange(score: number) {
    if (score === scoreTarget) {
      return
    }

    if (hasScores) {
      setPendingScoreTarget(score)
      return
    }

    onScoreTargetChange(score)
  }

  function requestGroupCountChange(groups: number) {
    if (groups === groupCount) {
      return
    }

    if (hasScores) {
      setPendingGroupCount(groups)
      return
    }

    onGroupCountChange(groups)
  }

  function handleCustomScoreSubmit() {
    const customScore = Number(customScoreInput)
    if (customScore > 0) {
      requestScoreTargetChange(customScore)
      setCustomScoreInput("")
      setShowCustomScoreDialog(false)
    }
  }

  return (
    <>
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
                        {new Date(entry.playedAt).toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
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

            <DrawerFooter>
              <Button
                variant="destructive"
                disabled={gameHistory.length === 0}
                onClick={() => setShowDeleteHistoryConfirmation(true)}
              >
                Delete History
              </Button>
            </DrawerFooter>
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
              <DropdownMenuCheckboxItem
                key={score}
                checked={scoreTarget === score}
                onSelect={() => requestScoreTargetChange(score)}
              >
                {score}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuItem onClick={() => setShowCustomScoreDialog(true)}>
              +
            </DropdownMenuItem>
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
              <DropdownMenuCheckboxItem
                key={groups}
                checked={groupCount === groups}
                onSelect={() => requestGroupCountChange(groups)}
              >
                {groups}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog
        open={showCustomScoreDialog}
        onOpenChange={setShowCustomScoreDialog}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-xl">Custom Score Target</DialogTitle>
          </DialogHeader>

          <Input
            autoFocus
            value={customScoreInput}
            onChange={(event) =>
              setCustomScoreInput(event.target.value.replace(/\D/g, ""))
            }
            inputMode="numeric"
            pattern="[0-9]*"
            onKeyDown={(event) => {
              if (event.key === "Enter" && customScoreInput) {
                handleCustomScoreSubmit()
              }
            }}
            placeholder="Enter score"
            aria-label="Custom score"
            className="h-12 text-center text-2xl"
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="destructive"
                onClick={() => setShowCustomScoreDialog(false)}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleCustomScoreSubmit}
              disabled={!customScoreInput}
            >
              Set
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={showDeleteHistoryConfirmation}
        onOpenChange={setShowDeleteHistoryConfirmation}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete game history?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes all saved completed games from this device. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={onDeleteHistory}
            >
              Delete history
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={pendingScoreTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingScoreTarget(null)
          }
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Change score target?</AlertDialogTitle>
            <AlertDialogDescription>
              Current scores will be kept, but any totals above the new target
              will be capped.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingScoreTarget !== null) {
                  onScoreTargetChange(pendingScoreTarget)
                }
              }}
            >
              Change target
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={pendingGroupCount !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingGroupCount(null)
          }
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Change number of groups?</AlertDialogTitle>
            <AlertDialogDescription>
              This starts a fresh game and clears all current scores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (pendingGroupCount !== null) {
                  onGroupCountChange(pendingGroupCount)
                }
              }}
            >
              Change groups
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
