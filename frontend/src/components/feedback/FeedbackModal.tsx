// frontend/src/components/feedback/FeedbackModal.tsx
'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { StarRating } from './StarRating'
import { submitFeedback, ContentType } from '@/services/feedback'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  contentId: string
  contentType: ContentType
  accessToken?: string
  onFeedbackSubmitted?: () => void
}

export function FeedbackModal({
  isOpen,
  onClose,
  contentId,
  contentType,
  accessToken,
  onFeedbackSubmitted,
}: FeedbackModalProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const contentLabel = contentType === 'summary' ? 'Summary' : 'Quiz'

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await submitFeedback(
        {
          content_id: contentId,
          content_type: contentType,
          rating,
          comment: comment.trim() || undefined,
        },
        accessToken
      )

      toast({
        title: 'Thank you!',
        description: 'Your feedback has been submitted successfully.',
      })

      // Reset form
      setRating(0)
      setComment('')
      onFeedbackSubmitted?.()
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit feedback'
      
      // Check for duplicate feedback error
      if (message.includes('already submitted')) {
        setError('You have already submitted feedback for this content.')
      } else {
        setError(message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    // Reset state on close
    setRating(0)
    setComment('')
    setError(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rate this {contentLabel}</DialogTitle>
          <DialogDescription>
            Help us improve by sharing your feedback. Your rating and comments
            help us deliver better content.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Star Rating */}
          <div className="flex flex-col items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground">
              How would you rate this {contentLabel.toLowerCase()}?
            </label>
            <StarRating 
              rating={rating} 
              onRatingChange={setRating}
              size="lg"
            />
            {rating > 0 && (
              <span className="text-sm text-muted-foreground">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </span>
            )}
          </div>

          {/* Comment textarea */}
          <div className="space-y-2">
            <label 
              htmlFor="feedback-comment" 
              className="text-sm font-medium"
            >
              Additional comments (optional)
            </label>
            <textarea
              id="feedback-comment"
              className="w-full min-h-[100px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              placeholder="Tell us what you liked or how we can improve..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              disabled={isSubmitting}
            />
            <div className="text-xs text-muted-foreground text-right">
              {comment.length}/1000
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="text-sm text-red-500 text-center">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Feedback'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
