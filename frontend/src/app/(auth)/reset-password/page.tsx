'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const formSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof formSchema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Supabase redirects with the token in the URL fragment
    const hash = window.location.hash
    const params = new URLSearchParams(hash.substring(1)) // remove #
    const accessToken = params.get('access_token')
    if (accessToken) {
      setToken(accessToken)
    } else {
      setError('Invalid password reset link. Please try again.')
    }
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data: FormData) => {
    if (!token) {
      setError('No reset token found. Please request a new link.')
      return
    }
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    try {
      // We need a supabase instance on the client to call this
      // This is a placeholder, as we don't have a client-side supabase instance set up yet
      // In a real app, you'd use the Supabase JS library here.

      const response = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password: data.password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to reset password.')
      }

      setSuccess(
        'Your password has been reset successfully! You can now log in.',
      )

      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
      <Card className="mx-auto max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 text-center text-sm text-red-500">{error}</div>
          )}
          {success && (
            <div className="mb-4 text-center text-sm text-green-500">
              {success}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">New Password</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !token}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link href="/login" className="underline">
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
