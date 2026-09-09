import { Crown } from "lucide-react"

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

type WinnerDialogProps = {
  open: boolean
  winnerName: string
  onClose: () => void
  onRestart: () => void
}

export function WinnerDialog({
  open,
  winnerName,
  onClose,
  onRestart,
}: WinnerDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose()
        }
      }}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-amber-500/15 text-amber-600 dark:bg-amber-400/20 dark:text-amber-300">
            <Crown />
          </AlertDialogMedia>
          <AlertDialogTitle>{winnerName} won!</AlertDialogTitle>
          <AlertDialogDescription>
            They reached the selected score target.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
          <AlertDialogAction onClick={onRestart}>New game</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
