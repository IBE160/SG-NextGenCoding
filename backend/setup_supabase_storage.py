#!/usr/bin/env python3
"""
Script to set up Supabase Storage buckets for the application.
Run this once to initialize the required storage buckets.

IMPORTANT: This script requires the SUPABASE_SERVICE_ROLE_KEY to be set in your environment.
You can find this key in your Supabase project settings:
  1. Go to https://app.supabase.com/projects
  2. Select your project
  3. Go to Settings > API
  4. Copy the "service_role" secret key
  5. Add it to your .env file as: SUPABASE_SERVICE_ROLE_KEY=<your-key>

Usage:
    python backend/setup_supabase_storage.py

Alternative (Manual Setup via Supabase Dashboard):
    1. Go to https://app.supabase.com/projects
    2. Select your project
    3. Go to Storage
    4. Click "Create a new bucket"
    5. Name it: "user_documents"
    6. Make it Private (not public)
    7. Click Create
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL:
    print("❌ Error: SUPABASE_URL not found in environment variables")
    sys.exit(1)

if not SUPABASE_SERVICE_ROLE_KEY:
    print("⚠️  SUPABASE_SERVICE_ROLE_KEY not found in environment variables")
    print("\nTo use this script, you need to:")
    print("  1. Get your service role key from: https://app.supabase.com/projects")
    print("  2. Go to Settings > API and copy the 'service_role' secret")
    print("  3. Add to your .env file: SUPABASE_SERVICE_ROLE_KEY=<your-key>")
    print("\nFor now, please create the bucket manually via the Supabase Dashboard:")
    print("  1. Go to https://app.supabase.com/projects")
    print("  2. Select your project > Storage")
    print("  3. Click 'Create a new bucket'")
    print("  4. Name: 'user_documents'")
    print("  5. Privacy: Private")
    print("  6. Click Create")
    sys.exit(1)

try:
    from supabase import create_client
except ImportError:
    print("❌ Error: supabase package not installed")
    print("   Run: pip install supabase")
    sys.exit(1)

# Create a Supabase client with service role key (required for admin operations)
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def setup_storage_buckets():
    """Create required storage buckets in Supabase."""
    buckets = [
        {
            "name": "user_documents",
            "public": False,  # Private bucket for user documents
        }
    ]

    for bucket in buckets:
        try:
            print(f"Checking bucket: {bucket['name']}...")
            
            # Check if bucket already exists
            try:
                supabase.storage.get_bucket(bucket["name"])
                print(f"  ✓ Bucket '{bucket['name']}' already exists")
                continue
            except Exception as e:
                # Bucket doesn't exist, create it
                if "not found" not in str(e).lower():
                    print(f"  ⚠ Unexpected error checking bucket: {e}")
            
            # Create the bucket
            print(f"  Creating bucket '{bucket['name']}'...")
            supabase.storage.create_bucket(
                bucket["name"],
                options={
                    "public": bucket["public"],
                }
            )
            print(f"  ✓ Bucket '{bucket['name']}' created successfully")
            
        except Exception as e:
            print(f"  ✗ Failed to create bucket '{bucket['name']}':")
            print(f"     {type(e).__name__}: {e}")
            raise

    print("\n✓ All storage buckets set up successfully!")


if __name__ == "__main__":
    print("Setting up Supabase Storage buckets...\n")
    try:
        setup_storage_buckets()
    except Exception as e:
        print(f"\n❌ Setup failed: {e}")
        sys.exit(1)
