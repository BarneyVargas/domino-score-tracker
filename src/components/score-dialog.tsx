import { Trash2Icon } from "lucide-react"
import { useState } from "react"

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
import { Input } from "@/components/ui/input"

type ScoreDialogProps = {
  open: boolean
  selectedGroupName: string
  isRenaming: boolean
  nameInput: string
  scoreInput: string
  editingScoreId: string | null
  onOpenChange: (open: boolean) => void
  onNameInputChange: (value: string) => void
  onScoreInputChange: (value: string) => void
  onRenameStart: () => void
  onRenameSave: () => void
  onAddScore: () => void
  onDeleteScore: () => void
  onCancel: () => void
}

export function ScoreDialog({
  open,
  selectedGroupName,
  isRenaming,
  nameInput,
  scoreInput,
  editingScoreId,
  onOpenChange,
  onNameInputChange,
  onScoreInputChange,
  onRenameStart,
  onRenameSave,
  onAddScore,
  onDeleteScore,
  onCancel,
}: ScoreDialogProps) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent showCloseButton={false}>
          <DialogHeader className="items-center text-center">
          {isRenaming ? (
            <div className="flex w-full items-center gap-2">
              <Input
                autoFocus
                value={nameInput}
                onChange={(event) => onNameInputChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    onRenameSave()
                  }
                }}
                aria-label="Group name"
                className="h-9 text-center"
              />
              <Button size="sm" onClick={onRenameSave}>
                Save
              </Button>
              {editingScoreId && (
                <Button
                  variant="destructive"
                  size="icon"
                  aria-label="Delete score"
                  onClick={() => setShowDeleteConfirmation(true)}
                >
                  <Trash2Icon />
                </Button>
              )}
            </div>
          ) : (
            <div className="flex w-full items-center gap-2">
              <DialogTitle className="flex-1 text-center text-xl">
                <button
                  type="button"
                  className="rounded-md px-2 py-1 transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                  onClick={onRenameStart}
                >
                  {selectedGroupName}
                </button>
              </DialogTitle>
              {editingScoreId && (
                <Button
                  variant="destructive"
                  size="icon"
                  aria-label="Delete score"
                  onClick={() => setShowDeleteConfirmation(true)}
                >
                  <Trash2Icon />
                </Button>
              )}
            </div>
          )}
          </DialogHeader>

          <Input
            autoFocus={!isRenaming}
            value={scoreInput}
            onChange={(event) => onScoreInputChange(event.target.value)}
            inputMode="numeric"
            pattern="[0-9]*"
            onKeyDown={(event) => {
              if (event.key === "Enter" && scoreInput) {
                onAddScore()
              }
            }}
            placeholder="Score"
            aria-label="Score"
            className="h-12 text-center text-2xl"
          />
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onScoreInputChange(String(Number(scoreInput || 0) + 1))
              }
            >
              +1
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onScoreInputChange(String(Number(scoreInput || 0) + 5))
              }
            >
              +5
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onScoreInputChange(String(Number(scoreInput || 0) + 10))
              }
            >
              +10
            </Button>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={onAddScore} disabled={!scoreInput}>
              {editingScoreId ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete this round?</AlertDialogTitle>
            <AlertDialogDescription>
              This score and every group’s score for this round will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onDeleteScore}>
              Delete round
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
