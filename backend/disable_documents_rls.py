#!/usr/bin/env python3
"""
Disable RLS on the documents table for development.
This allows authenticated users to insert documents.
"""

import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_JWT_SECRET")  # Using JWT_SECRET as service role for now

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_JWT_SECRET must be set in .env")
    exit(1)

# Create admin client
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

try:
    # Disable RLS on documents table
    response = supabase.rpc("exec_sql", {
        "sql": """
        ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;
        """
    }).execute()
    
    print("✓ Disabled RLS on documents table")
    print(f"Response: {response}")
    
except Exception as e:
    print(f"Error disabling RLS: {e}")
    print("\nAlternative: Manually disable RLS via Supabase Dashboard:")
    print("1. Go to SQL Editor")
    print("2. Run: ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;")
    print("3. Or use the Table Designer UI to toggle RLS off")
