import { Plus } from "lucide-react"

import { AnimatedNumberFlow } from "@/components/animated-number-flow"
import { Button } from "@/components/ui/button"
import type { ScoreEntry } from "@/lib/domino-storage"

type ScoreGridProps = {
  groupNames: string[]
  scoreEntries: ScoreEntry[]
  scoreTarget: number
  isGameOver: boolean
  onAddScore: (groupIndex: number) => void
  onEditScore: (entry: ScoreEntry) => void
}

export function ScoreGrid({
  groupNames,
  scoreEntries,
  scoreTarget,
  isGameOver,
  onAddScore,
  onEditScore,
}: ScoreGridProps) {
  return (
    <div className="mx-auto mt-30 pb-28 grid w-full max-w-sm grid-cols-2 items-start gap-3 px-4">
      {scoreEntries.length === 0 && (
        <p className="col-span-full text-center text-sm text-muted-foreground">
          Tap a group to add the first score.
        </p>
      )}
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
              aria-label={
                isGameOver ? groupName : `Add score for ${groupName}`
              }
              disabled={isGameOver}
              onClick={() => onAddScore(index)}
            >
              <span className="text-center font-heading text-base font-medium">
                {groupName}
              </span>
              {!isGameOver && <Plus />}
            </Button>

            {groupScoreEntries.length > 0 && (
              <div className="divide-y border-t">
                {groupScoreEntries.map((entry, scoreIndex) => (
                  <button
                    key={entry.id}
                    type="button"
                    disabled={isGameOver}
                    className="grid w-full grid-cols-[auto_1fr] items-center gap-2 px-2 py-2 text-left transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-100"
                    onClick={() => onEditScore(entry)}
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
                  <div className="mt-1 border-t border-secondary-foreground/20 pt-1 text-xs font-medium text-muted-foreground">
                    Remaining:{" "}
                    <AnimatedNumberFlow
                      value={Math.max(0, scoreTarget - groupScoreTotal)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
