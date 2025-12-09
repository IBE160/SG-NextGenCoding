import ThemeProvider from '@/providers/ThemeProvider'
// import NextTopLoader from 'nextjs-toploader'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import ReactQueryProvider from '@/providers/ReactQueryProvider'
// import { Toaster } from '@/components/ui/toaster'
import Link from 'next/link'

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Next.js and Supabase Starter Kit',
  description: 'The fastest way to build apps with Next.js and Supabase',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        {/* <NextTopLoader showSpinner={false} height={2} color="#2acf80" /> */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            <div className="flex min-h-screen flex-col">
              {' '}
              {/* Use div as main wrapper */}
              <header className="sticky top-0 z-50 w-full border-b bg-background/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-all duration-200">
                <div className="container flex h-14 items-center justify-between">
                  <Link href="/dashboard" className="text-lg font-bold hover:opacity-80 transition-all duration-200 hover:scale-[1.02]">
                    ibe160 Application
                  </Link>
                  <nav className="flex items-center gap-1">
                    <Link 
                      href="/dashboard" 
                      className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-all duration-200"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/history" 
                      className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-all duration-200"
                    >
                      History
                    </Link>
                  </nav>
                </div>
              </header>
              <main className="flex-grow">
                {' '}
                {/* main tag for semantic content */}
                {children}
              </main>
              <footer className="border-t py-6 md:py-0">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                  <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                    © 2025 SG-NextGenCoding. All rights reserved.
                  </p>
                  {/* Potentially add links/social media here later */}
                </div>
              </footer>
            </div>
            {/* <Toaster /> */}
            {/* <ReactQueryDevtools initialIsOpen={false} /> */}
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
