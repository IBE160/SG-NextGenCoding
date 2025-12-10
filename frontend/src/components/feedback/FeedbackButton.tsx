// frontend/src/components/feedback/FeedbackButton.tsx
'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageSquarePlus } from 'lucide-react'
import { FeedbackModal } from './FeedbackModal'
import { ContentType } from '@/services/feedback'

interface FeedbackButtonProps {
  contentId: string
  contentType: ContentType
  accessToken?: string
  variant?: 'default' | 'outline' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function FeedbackButton({
  contentId,
  contentType,
  accessToken,
  variant = 'outline',
  size = 'default',
  className,
}: FeedbackButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const handleFeedbackSubmitted = () => {
    setHasSubmitted(true)
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsModalOpen(true)}
        className={className}
        disabled={hasSubmitted}
      >
        <MessageSquarePlus className="w-4 h-4 mr-2" />
        {hasSubmitted ? 'Feedback Submitted' : 'Rate this'}
      </Button>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contentId={contentId}
        contentType={contentType}
        accessToken={accessToken}
        onFeedbackSubmitted={handleFeedbackSubmitted}
      />
    </>
  )
}
