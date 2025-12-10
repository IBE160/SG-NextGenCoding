// frontend/src/components/upload/ActionSelectionDialog.tsx

'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ActionSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentId: string | null
  fileName: string
  onSelectSummary: () => void
  onSelectQuiz: () => void
  isLoading?: boolean
}

export function ActionSelectionDialog({
  open,
  onOpenChange,
  documentId,
  fileName,
  onSelectSummary,
  onSelectQuiz,
  isLoading = false,
}: ActionSelectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            📄 File Uploaded Successfully!
          </DialogTitle>
          <DialogDescription className="text-center">
            <span className="font-medium">{fileName}</span>
            <br />
            What would you like to do with this document?
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <Button
            size="lg"
            className="h-20 text-lg"
            onClick={onSelectSummary}
            disabled={isLoading}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">📝</span>
              <span>Generate Summary</span>
              <span className="text-xs font-normal opacity-80">
                AI-powered notes summary
              </span>
            </div>
          </Button>
          
          <Button
            size="lg"
            variant="secondary"
            className="h-20 text-lg"
            onClick={onSelectQuiz}
            disabled={isLoading}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">🧠</span>
              <span>Generate Quiz</span>
              <span className="text-xs font-normal opacity-80">
                Test your knowledge
              </span>
            </div>
          </Button>
        </div>

        {isLoading && (
          <p className="text-center text-sm text-muted-foreground">
            Processing your request...
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
