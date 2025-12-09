// frontend/src/app/history/page.tsx

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  getCombinedHistory, 
  type CombinedHistoryItem, 
  type CombinedHistoryResponse 
} from '@/services/history'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { FileText, HelpCircle, Clock, ChevronRight, RefreshCw } from 'lucide-react'

const HistoryPage: React.FC = () => {
  const router = useRouter()
  const [history, setHistory] = useState<CombinedHistoryItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [sessionLoaded, setSessionLoaded] = useState(false)

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const cookies = document.cookie.split(';')
      const accessTokenCookie = cookies.find((cookie) => 
        cookie.trim().startsWith('access_token=')
      )
      
      if (accessTokenCookie) {
        const token = accessTokenCookie.split('=')[1]
        setAccessToken(token)
        setIsAuthenticated(true)
      } else {
        setAccessToken(null)
        setIsAuthenticated(false)
      }
      setSessionLoaded(true)
    }

    checkAuth()
  }, [])

  // Fetch history data
  const fetchHistory = useCallback(async () => {
    if (!accessToken) return

    setLoading(true)
    setError(null)

    try {
      const response: CombinedHistoryResponse = await getCombinedHistory(accessToken)
      setHistory(response.data)
      setTotal(response.total)
    } catch (err: any) {
      console.error('Error fetching history:', err)
      setError(err.message || 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    if (sessionLoaded && isAuthenticated && accessToken) {
      fetchHistory()
    } else if (sessionLoaded && !isAuthenticated) {
      setLoading(false)
    }
  }, [sessionLoaded, isAuthenticated, accessToken, fetchHistory])

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Get the appropriate link for a history item
  const getItemLink = (item: CombinedHistoryItem): string => {
    if (item.type === 'summary') {
      return `/summaries/${item.document_id}`
    } else {
      // Link to quiz review page (Story 5.2)
      return `/history/quiz/${item.id}`
    }
  }

  // Render authentication required message
  if (sessionLoaded && !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
            <CardDescription>
              Sign in to view your learning history
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              You need to be logged in to view your history of summaries and quizzes.
            </p>
            <Button onClick={() => router.push('/auth/login')}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
            <CardDescription>Loading your learning history...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-12">
            <Spinner className="h-8 w-8" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
            <CardDescription>Something went wrong</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchHistory} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>History</CardTitle>
            <CardDescription>
              {total === 0 
                ? 'No history yet' 
                : `${total} item${total !== 1 ? 's' : ''} in your history`}
            </CardDescription>
          </div>
          <Button onClick={fetchHistory} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Your history is empty. Start by uploading a document to generate summaries and quizzes.
              </p>
              <Button onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <HistoryCard key={`${item.type}-${item.id}`} item={item} formatDate={formatDate} getItemLink={getItemLink} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface HistoryCardProps {
  item: CombinedHistoryItem
  formatDate: (date: string) => string
  getItemLink: (item: CombinedHistoryItem) => string
}

const HistoryCard: React.FC<HistoryCardProps> = ({ item, formatDate, getItemLink }) => {
  const isSummary = item.type === 'summary'

  return (
    <Link href={getItemLink(item)} className="block group">
      <Card className="hover:bg-accent/50 hover:shadow-md transition-all duration-200 cursor-pointer hover:-translate-y-0.5">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={`p-2 rounded-lg transition-transform duration-200 group-hover:scale-110 ${isSummary ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-green-100 dark:bg-green-900/50'}`}>
              {isSummary ? (
                <FileText className={`h-5 w-5 ${isSummary ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`} />
              ) : (
                <HelpCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  isSummary 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                    : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                }`}>
                  {isSummary ? 'Summary' : 'Quiz'}
                </span>
                {!isSummary && item.status && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    item.status === 'ready' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                      : item.status === 'generating'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {item.status}
                  </span>
                )}
              </div>
              
              <h3 className="font-medium text-sm truncate">
                {item.title || item.document_title}
              </h3>
              
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {item.document_title}
              </p>
              
              {item.preview && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {item.preview}
                </p>
              )}
              
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(item.created_at)}
                </span>
                {!isSummary && item.total_questions !== null && (
                  <span>{item.total_questions} questions</span>
                )}
              </div>
            </div>
            
            {/* Arrow */}
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default HistoryPage
