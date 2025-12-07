import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to{' '}
          <a className="text-blue-600" href="/">
            Study-Buddy
          </a>
        </h1>

        <p className="mt-3 text-2xl">Your AI studyhelper.</p>

        <div className="mt-6 flex flex-wrap items-center justify-around sm:w-full">
          <Link href="/login">
            <button className="rounded-md bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Login/Register
            </button>
          </Link>
        </div>
      </main>

      <footer className="flex h-24 w-full items-center justify-center border-t">
        <a
          className="flex items-center justify-center gap-2"
          href="#"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by Study-buddy AI
        </a>
      </footer>
    </div>
  )
}
