#!/usr/bin/env python3
"""
Set up proper RLS policies for the documents table.
This allows authenticated users to insert and read their own documents.
"""

import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_JWT_SECRET")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_JWT_SECRET must be set in .env")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

sql_commands = [
    # Enable RLS on documents table
    """
    ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
    """,
    
    # Drop existing policies if they exist
    """
    DROP POLICY IF EXISTS "Allow authenticated users to insert documents" ON public.documents;
    """,
    """
    DROP POLICY IF EXISTS "Allow users to read their own documents" ON public.documents;
    """,
    
    # Policy: Allow authenticated users to insert documents (with their user_id)
    """
    CREATE POLICY "Allow authenticated users to insert documents"
    ON public.documents
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id OR user_id IS NULL
    );
    """,
    
    # Policy: Allow authenticated users to read their own documents
    """
    CREATE POLICY "Allow users to read their own documents"
    ON public.documents
    FOR SELECT
    USING (
        auth.uid() = user_id OR user_id IS NULL
    );
    """,
    
    # Policy: Allow guests to read documents (when user_id is NULL)
    """
    CREATE POLICY "Allow reading public documents"
    ON public.documents
    FOR SELECT
    USING (
        user_id IS NULL
    );
    """,
]

print("Setting up RLS policies for documents table...\n")

for i, sql in enumerate(sql_commands, 1):
    try:
        print(f"Executing command {i}...")
        response = supabase.rpc("exec_sql", {"sql": sql}).execute()
        print(f"✓ Command {i} executed successfully")
    except Exception as e:
        print(f"✗ Error in command {i}: {e}")

print("\n✓ RLS policies setup complete!")
print("\nIf you see errors, you can manually run these SQL commands in Supabase SQL Editor:")
for i, sql in enumerate(sql_commands, 1):
    print(f"\n--- Command {i} ---")
    print(sql)
