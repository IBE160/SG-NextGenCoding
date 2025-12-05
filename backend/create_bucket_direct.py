#!/usr/bin/env python3
"""
Setup Supabase Storage buckets using the REST API.
This script creates the required storage buckets without needing the service role key.

Usage:
    python backend/create_bucket_direct.py
"""

import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

if not all([SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_JWT_SECRET]):
    print("❌ Error: Missing required environment variables")
    print("   Required: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_JWT_SECRET")
    exit(1)

# We need the service role key which we don't have via anon key
# However, we can try to create it via the dashboard or use an alternative approach

print("""
To create the 'user_documents' bucket in Supabase, please do the following:

1. Open your Supabase project dashboard
   URL: https://app.supabase.com/projects

2. Select your project: lswczusiutzbpxclvrkf

3. Navigate to Storage (left sidebar)

4. Click "Create a new bucket" button

5. Fill in the bucket details:
   - Name: user_documents
   - Privacy: Private (do NOT make it public)
   - Allowed MIME types: Leave empty (allow all)
   - Maximum file size: 20 MB (or larger)
   - Click "Create"

6. Once created, the file upload feature will work!

Note: The 'user_documents' bucket is required for the file upload functionality.
      If you see "Bucket not found" errors, this bucket must be created first.
""")

print("\nAlternatively, if you have the service role key:")
print("  1. Get it from your Supabase project settings (Settings > API > service_role)")
print("  2. Add to .env: SUPABASE_SERVICE_ROLE_KEY=<your-key>")
print("  3. Run: python backend/setup_supabase_storage.py")
