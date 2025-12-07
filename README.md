# SG-NextGenCoding
Repository for SG-NextGenCoding - IBE160 Programmering med KI.

## Supabase Setup for Local Development

To set up Supabase for local development, follow these steps:

1.  **Create a Supabase Project**:
    *   Go to [Supabase](https://supabase.com/) and create a new project.

2.  **Retrieve Supabase API Keys**:
    *   Once your project is created, navigate to "Project Settings" -> "API" in your Supabase dashboard.
    *   Copy your `Project URL` and `anon public` key.

3.  **Configure Environment Variables**:
    *   **Frontend**: Create a file named `.env.local` in the `frontend/` directory if it doesn't already exist. Add the following lines, replacing `<YOUR_SUPABASE_URL>` and `<YOUR_SUPABASE_ANON_KEY>` with your actual keys:
        ```
        NEXT_PUBLIC_SUPABASE_URL=<YOUR_SUPABASE_URL>
        NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>
        ```
    *   **Backend**: Create a file named `.env` in the `backend/` directory if it doesn't already exist. Add the following lines, replacing `<YOUR_SUPABASE_URL>` and `<YOUR_SUPABASE_ANON_KEY>` with your actual keys:
        ```
        SUPABASE_URL=<YOUR_SUPABASE_URL>
        SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>
        ```
        *Note: If you intend to perform privileged operations from your backend, you might need to use the `service_role` key instead of the `anon public` key, typically named `SUPABASE_SERVICE_ROLE_KEY`.*

4.  **Database Schema (Profiles Table) & RLS**:
    *   In your Supabase SQL Editor, execute the following SQL to create the `profiles` table:
        ```sql
        CREATE TABLE profiles (
          id uuid PRIMARY KEY REFERENCES auth.users(id),
          created_at timestamp with time zone DEFAULT now(),
          user_id uuid UNIQUE NOT NULL,
          -- Add other profile-related columns here if needed
        );
        ```
    *   **Enable Row Level Security (RLS)**:
        *   Navigate to "Authentication" -> "Policies" in your Supabase dashboard.
        *   Select the `profiles` table and enable RLS.
    *   **Create RLS Policies**:
        *   **SELECT Policy**: Create a new policy that allows authenticated users to `SELECT` their own data.
            *   Name: `Allow authenticated users to view their own profile`
            *   FOR: `SELECT`
            *   USING Expression: `auth.uid() = user_id`
        *   **INSERT Policy**: Create a new policy that allows authenticated users to `INSERT` their own data.
            *   Name: `Allow authenticated users to create their own profile`
            *   FOR: `INSERT`
            *   WITH CHECK Expression: `auth.uid() = user_id`