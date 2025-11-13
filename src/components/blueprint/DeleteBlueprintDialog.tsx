import React, { useState } from 'react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog'
import { Button } from '../ui/button'

interface DeleteBlueprintDialogProps {
  trigger: React.ReactNode
  blueprintGoal?: string
  onConfirm: () => Promise<void>
}

export const DeleteBlueprintDialog: React.FC<DeleteBlueprintDialogProps> = ({ trigger, blueprintGoal, onConfirm }) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    try {
      setLoading(true)
      setError(null)
      await onConfirm()
      setOpen(false)
    } catch (err) {
      console.error('[DeleteBlueprintDialog] Failed to delete blueprint', err)
      setError('Failed to delete blueprint. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(value) => {
        if (loading) return
        setOpen(value)
        if (!value) {
          setError(null)
        }
      }}
    >
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this blueprint?</AlertDialogTitle>
          <AlertDialogDescription>
            {blueprintGoal
              ? `This will permanently remove “${blueprintGoal}” from your history.`
              : 'This action cannot be undone. This will permanently delete the blueprint.'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <AlertDialogFooter className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <AlertDialogCancel asChild>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              className="min-w-[120px] justify-center text-foreground"
            >
              Nope
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirm}
              disabled={loading}
              className="min-w-[120px] justify-center"
            >
              {loading ? 'Deleting...' : 'Yep, delete it'}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
