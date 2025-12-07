// frontend/src/app/dashboard/page.tsx

import Link from 'next/link' // Import Link

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-950">
      {' '}
      {/* Changed to flex-col */}
      <h1 className="mb-4 text-4xl font-bold">
        Welcome to your Dashboard!
      </h1>{' '}
      {/* Added mb-4 for spacing */}
      <Link href="/upload" passHref>
        <button className="rounded-md bg-blue-600 px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-700">
          Go to Upload Page
        </button>
      </Link>
    </div>
  )
}
