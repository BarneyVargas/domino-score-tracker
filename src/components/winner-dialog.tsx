import { Crown } from "lucide-react"

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
  winnerName: string | null
  onRestart: () => void
}

export function WinnerDialog({ winnerName, onRestart }: WinnerDialogProps) {
  return (
    <AlertDialog
      open={winnerName !== null}
      onOpenChange={(open) => {
        if (!open) {
          onRestart()
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader className="grid grid-rows-[auto_auto_auto] place-items-center text-center sm:place-items-center sm:text-center">
          <AlertDialogMedia className="row-auto mx-auto">
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
            onClick={onRestart}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
