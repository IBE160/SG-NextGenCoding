// frontend/src/app/summaries/[document_id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useSummaryStore } from '@/lib/store'
import { getSummary, getSummaryStatus } from '@/services/documents'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@/utils/supabase'
import type { Session } from '@supabase/supabase-js'

const SummaryDisplayPage = () => {
  const params = useParams()
  const documentId = params.document_id as string
  const supabase = createBrowserClient()
  const [session, setSession] = useState<Session | null>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        console.log('Session retrieved:', session ? 'authenticated' : 'guest')
        setSession(session)
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setIsLoadingSession(false)
      }
    }
    getSession()
  }, [supabase])

  // Allow guest users - access token is optional
  const accessToken = session?.access_token || undefined

  const {
    summaries,
    addSummary,
    setSummaryLoading,
    setSummaryError,
    getSummaryById,
  } = useSummaryStore()

  const [copied, setCopied] = useState(false)

  const summaryData = getSummaryById(documentId)

  useEffect(() => {
    // Wait for session check to complete
    if (isLoadingSession) {
      console.log('Still loading session...')
      return
    }

    if (!documentId) {
      console.log('No documentId provided')
      return
    }

    console.log(
      'Access token:',
      accessToken ? 'present' : 'not present (guest mode)',
    )

    const fetchStatus = async () => {
      console.log(`Fetching status for document: ${documentId}`)
      setSummaryLoading(documentId, true)
      try {
        const statusData = await getSummaryStatus(documentId, accessToken)
        console.log('Status data received:', statusData)

        if (
          statusData.status === 'completed' ||
          statusData.status === 'summarized'
        ) {
          console.log('Summary completed, fetching summary...')
          const summary = await getSummary(documentId, accessToken)
          console.log('Summary received:', summary)
          addSummary(documentId, summary.summary_text)
        } else if (statusData.status === 'failed') {
          console.log('Summary generation failed')
          setSummaryError(documentId, 'Summary generation failed.')
        } else {
          console.log(`Status is ${statusData.status}, polling again in 5s...`)
          // If processing, poll again after a delay
          setTimeout(fetchStatus, 5000)
        }
      } catch (error) {
        console.error('Error fetching status:', error)
        setSummaryError(documentId, 'Failed to fetch summary status.')
      } finally {
        setSummaryLoading(documentId, false)
      }
    }

    if (!summaryData) {
      console.log('No summary data in store, fetching...')
      fetchStatus()
    } else {
      console.log('Summary data already in store:', summaryData)
    }
  }, [
    documentId,
    isLoadingSession,
    accessToken,
    summaryData,
    addSummary,
    setSummaryLoading,
    setSummaryError,
  ])

  if (isLoadingSession) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    )
  }

  if (summaryData?.loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading summary...
      </div>
    )
  }

  if (summaryData?.error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        {summaryData.error}
      </div>
    )
  }

  if (!summaryData?.text) {
    return (
      <div className="flex h-screen items-center justify-center">
        Summary not available yet or still processing.
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Summary</h1>
      <div className="prose lg:prose-xl">
        <ReactMarkdown>{summaryData.text}</ReactMarkdown>
      </div>
      <CopyToClipboard text={summaryData.text} onCopy={() => setCopied(true)}>
        <Button className="mt-4">{copied ? 'Copied!' : 'Copy Summary'}</Button>
      </CopyToClipboard>
    </div>
  )
}

export default SummaryDisplayPage
