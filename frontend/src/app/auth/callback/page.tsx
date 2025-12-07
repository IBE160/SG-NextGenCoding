'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to login after a few seconds
    const timer = setTimeout(() => {
      router.push('/login')
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
      <Card className="mx-auto max-w-sm text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Email Verified!</CardTitle>
          <CardDescription>
            Your email address has been successfully verified.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You will be redirected to the login page shortly.
          </p>
          <div className="mt-4">
            <Link href="/login" className="underline">
              Click here to login now
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
