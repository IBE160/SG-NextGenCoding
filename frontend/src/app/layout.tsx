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
              <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
                <div className="container flex h-16 items-center justify-between">
                  <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-lg hover:opacity-90 transition-all duration-200">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
                      S
                    </div>
                    <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">StudyAI</span>
                  </Link>
                  <nav className="flex items-center gap-1">
                    <Link 
                      href="/dashboard" 
                      className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/80 rounded-lg transition-all duration-200"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/history" 
                      className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/80 rounded-lg transition-all duration-200"
                    >
                      History
                    </Link>
                    <Link 
                      href="/login" 
                      className="ml-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-all duration-200"
                    >
                      Sign In
                    </Link>
                  </nav>
                </div>
              </header>
              <main className="flex-grow">
                {' '}
                {/* main tag for semantic content */}
                {children}
              </main>
              <footer className="border-t border-border/40 py-8 mt-auto">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
                  <p className="text-center text-sm text-muted-foreground md:text-left">
                    © 2025 StudyAI. Built for better learning.
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
                    <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
                  </div>
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
