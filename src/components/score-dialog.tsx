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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader className="items-center text-center">
          {isRenaming ? (
            <div className="flex w-full items-center gap-2">
              <Input
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
            </div>
          ) : (
            <DialogTitle className="w-full text-center text-xl">
              <button
                type="button"
                className="rounded-md px-2 py-1 transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                onClick={onRenameStart}
              >
                {selectedGroupName}
              </button>
            </DialogTitle>
          )}
        </DialogHeader>

        <Input
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

        <DialogFooter>
          {editingScoreId && (
            <Button variant="destructive" onClick={onDeleteScore}>
              Delete
            </Button>
          )}
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
  )
}
