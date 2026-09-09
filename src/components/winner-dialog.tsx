import { Crown } from "lucide-react"
import { useState } from "react"

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

type WinnerDialogProps = {
  winnerName: string
  onRestart: () => void
}

export function WinnerDialog({ winnerName, onRestart }: WinnerDialogProps) {
  const [isOpen, setIsOpen] = useState(true)

  function handleClose() {
    setIsOpen(false)
    window.setTimeout(onRestart, 100)
  }

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose()
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
        <AlertDialogFooter className="sm:block">
          <AlertDialogAction className="w-full justify-center">
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
