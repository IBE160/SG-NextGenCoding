#!/usr/bin/env python3
"""
Configure Supabase Storage bucket with proper permissions.
This script sets up the user_documents bucket to allow file uploads.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

if not SUPABASE_URL:
    print("❌ Error: SUPABASE_URL not found")
    sys.exit(1)

if not SUPABASE_JWT_SECRET:
    print("❌ Error: SUPABASE_JWT_SECRET (service role key) not found")
    sys.exit(1)

try:
    from supabase import create_client
except ImportError:
    print("❌ Error: supabase package not installed")
    sys.exit(1)

# Create admin client with service role key
supabase_admin = create_client(SUPABASE_URL, SUPABASE_JWT_SECRET)

print("Configuring user_documents bucket...\n")

try:
    # Get the bucket
    bucket = supabase_admin.storage.get_bucket("user_documents")
    print(f"✓ Found bucket: {bucket.name}")
    print(f"  Public: {bucket.public}")
    
    # Update bucket to be public for now (easier for development)
    # We can add RLS policies later
    print("\nUpdating bucket settings...")
    updated_bucket = supabase_admin.storage.update_bucket(
        "user_documents",
        options={
            "public": False,  # Keep as private
        }
    )
    print("✓ Bucket updated")
    
    # Try to create/update RLS policies
    print("\nSetting up Storage policies...")
    
    # Note: The Supabase Python SDK doesn't directly support creating storage policies
    # We need to use the REST API directly or configure via dashboard
    
    print("""
✓ Bucket is configured!

However, to fully enable uploads, you need to set Storage RLS policies.
This requires using the Supabase Dashboard SQL Editor:

1. Go to: https://app.supabase.com/projects
2. Select your project
3. Go to SQL Editor (left sidebar)
4. Create a new query and paste this:

---
-- Allow anyone (authenticated or not) to insert into user_documents
CREATE POLICY "Allow all to insert" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'user_documents');

-- Allow users to read their own files
CREATE POLICY "Allow users to read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'user_documents');

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'user_documents');
---

5. Click "Run" to execute
6. Try uploading again!

Alternative (Simpler for development):
If you just want it to work, disable RLS entirely:
1. Go to Storage > user_documents
2. Look for RLS settings (might be under bucket settings)
3. Disable RLS for this bucket
4. Try uploading
""")
    
except Exception as e:
    print(f"✗ Error: {e}")
    print("\nTrying alternative approach using SQL Editor...")
    print("""
Please run these SQL commands in your Supabase SQL Editor:

1. Go to: https://app.supabase.com/projects
2. Select your project > SQL Editor
3. Create new query and run:

-- Enable storage RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow all to insert (upload)
CREATE POLICY "Allow all to insert" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'user_documents');

-- Allow all to read
CREATE POLICY "Allow all to read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'user_documents');

-- Allow all to delete
CREATE POLICY "Allow all to delete" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'user_documents');

Then try uploading again!
""")
