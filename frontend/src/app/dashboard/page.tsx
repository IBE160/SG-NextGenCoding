// frontend/src/app/dashboard/page.tsx

import Link from "next/link"; // Import Link

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-950"> {/* Changed to flex-col */}
      <h1 className="text-4xl font-bold mb-4">Welcome to your Dashboard!</h1> {/* Added mb-4 for spacing */}
      <Link href="/upload" passHref>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-md text-lg font-semibold hover:bg-blue-700 transition-colors">
          Go to Upload Page
        </button>
      </Link>
    </div>
  );
}