import { createServerClient } from '@/utils/supabase';
import { cookies } from 'next/headers';
import GuestAccessContent from './GuestAccessContent'; // Import the new client component
// Remove unused imports
// import { redirect } from 'next/navigation';
// import { getUsageCount, incrementUsageCount, checkUsageLimit } from '@/lib/guest-usage';

export default async function Page() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  // Fetch notes for both authenticated and guest users on the server
  const { data: notes } = await supabase.from('notes').select();

  return (
    <GuestAccessContent
      initialNotes={notes || []} // Pass notes, handle null/undefined
      isUserAuthenticated={!!user} // Pass authentication status
    />
  );
}