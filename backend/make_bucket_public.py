#!/usr/bin/env python3
"""
Configure Supabase Storage bucket to allow uploads by making it public.
This is simpler than setting up RLS policies.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    print("❌ Error: Missing SUPABASE_URL or SUPABASE_ANON_KEY")
    sys.exit(1)

try:
    from supabase import create_client
    import requests
    import json
except ImportError:
    print("❌ Error: Required packages not installed")
    sys.exit(1)

# Create client with anon key
supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

print("Configuring user_documents bucket for public access...\n")

try:
    # Get the bucket
    bucket = supabase.storage.get_bucket("user_documents")
    print(f"✓ Found bucket: {bucket.name}")
    print(f"  Current public setting: {bucket.public}")
    
    # Update bucket to be public
    print("\nUpdating bucket to public access...")
    updated_bucket = supabase.storage.update_bucket(
        "user_documents",
        options={
            "public": True,
        }
    )
    print("✓ Bucket set to public")
    print("\nThe bucket should now accept file uploads!")
    print("Try uploading a file now.")
    
except Exception as e:
    print(f"✗ Error updating bucket: {e}")
    print("\nAlternative: Try disabling RLS via the Supabase Dashboard:")
    print("1. Go to Storage > user_documents")
    print("2. Look for bucket settings or RLS toggle")
    print("3. Disable RLS for the bucket")
    sys.exit(1)
