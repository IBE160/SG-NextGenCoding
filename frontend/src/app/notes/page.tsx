import { createServerClient } from '@/utils/supabase-server'
import { cookies } from 'next/headers'
import GuestAccessContent from './GuestAccessContent' // Import the new client component
// Remove unused imports
// import { redirect } from 'next/navigation';
// import { getUsageCount, incrementUsageCount, checkUsageLimit } from '@/lib/guest-usage';

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch notes for both authenticated and guest users on the server
  const { data: notes } = await supabase.from('notes').select()

  return (
    <GuestAccessContent
      initialNotes={notes || []} // Pass notes, handle null/undefined
      isUserAuthenticated={!!user} // Pass authentication status
    />
  )
}
