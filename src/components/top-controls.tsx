import { ChevronRight, History, Users } from "lucide-react"
import { useState } from "react"

import { AnimatedNumberFlow } from "@/components/animated-number-flow"
import { ModeToggle } from "@/components/mode-toggle"
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
  onScoreTargetChange: (score: number) => void
  onGroupCountChange: (groups: number) => void
  onDeleteHistory: () => void
}

export function TopControls({
  scoreTarget,
  groupCount,
  gameHistory,
  onScoreTargetChange,
  onGroupCountChange,
  onDeleteHistory,
}: TopControlsProps) {
  const [customScoreInput, setCustomScoreInput] = useState("")
  const [showCustomScoreDialog, setShowCustomScoreDialog] = useState(false)

  function handleCustomScoreSubmit() {
    const customScore = Number(customScoreInput)
    if (customScore > 0) {
      onScoreTargetChange(customScore)
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

            <DrawerFooter>
              <Button
                variant="destructive"
                disabled={gameHistory.length === 0}
                onClick={onDeleteHistory}
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
              <DropdownMenuItem
                key={score}
                onClick={() => onScoreTargetChange(score)}
              >
                {score}
              </DropdownMenuItem>
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
              <DropdownMenuItem
                key={groups}
                onClick={() => onGroupCountChange(groups)}
              >
                {groups}
              </DropdownMenuItem>
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
    </>
  )
}
