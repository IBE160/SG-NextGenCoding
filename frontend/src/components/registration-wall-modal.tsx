'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface RegistrationWallModalProps {
  isOpen: boolean
  onClose: () => void
  message?: string
}

export function RegistrationWallModal({
  isOpen,
  onClose,
  message,
}: RegistrationWallModalProps) {
  const [showDialog, setShowDialog] = useState(isOpen)

  useEffect(() => {
    setShowDialog(isOpen)
  }, [isOpen])

  const handleClose = () => {
    setShowDialog(false)
    onClose()
  }

  return (
    <Dialog open={showDialog} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Unlock Full Access</DialogTitle>
          <DialogDescription>
            {message ||
              "You've reached your limit for free feature usage. Register or log in to continue enjoying all our features!"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Link href="/login" passHref>
            <Button className="w-full">Log In</Button>
          </Link>
          <Link href="/signup" passHref>
            <Button variant="outline" className="w-full">
              Register
            </Button>
          </Link>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t worry, it only takes a minute!
        </p>
      </DialogContent>
    </Dialog>
  )
}
