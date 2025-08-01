# Music System Storage Setup

## Overview
The music system requires specific storage buckets in Supabase to handle music file uploads and cover art.

## Required Storage Buckets

### 1. `artist-music` (Private)
- **Purpose**: Store music files (MP3, WAV, FLAC, etc.)
- **Privacy**: Private - only the artist can access their own files
- **Path Structure**: `{user_id}/{timestamp}-{filename}`

### 2. `artist-photos` (Public)
- **Purpose**: Store cover art and other artist images
- **Privacy**: Public - accessible by anyone
- **Path Structure**: `{user_id}/{timestamp}-cover.{extension}`

## Setup Instructions

### Step 1: Set Up Storage and RLS Policies

**Option A: Try the SQL Script First**
1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `scripts/fix-storage-supabase.sql`
4. Click "Run" to execute the script

**Option B: Manual Setup (if SQL script fails)**
If you get "must be owner of table objects" error, follow the manual steps in `docs/MANUAL_STORAGE_SETUP.md`

**This will:**
- Create the required storage buckets (`artist-music` and `artist-photos`)
- Fix RLS policies for both storage and database tables
- Ensure proper permissions for music uploads
- Test the setup automatically

### Step 2: Verify Bucket Creation

1. Go to Storage in your Supabase Dashboard
2. Verify that both buckets exist:
   - `artist-music` (private)
   - `artist-photos` (public)

### Step 3: Test Upload

1. Navigate to `/artist/music` in your application
2. Try uploading a music file
3. The upload should now work without the "Bucket not found" error

## File Structure

```
artist-music/
├── {user_id}/
│   ├── {timestamp}-song1.mp3
│   ├── {timestamp}-song2.wav
│   └── ...

artist-photos/
├── {user_id}/
│   ├── {timestamp}-cover.jpg
│   ├── {timestamp}-cover.png
│   └── ...
```

## Security

- **RLS Policies**: Each bucket has Row Level Security policies that ensure artists can only access their own files
- **File Validation**: The system validates file types and sizes before upload
- **User Isolation**: Files are organized by user ID to prevent cross-user access

## Troubleshooting

### "Bucket not found" Error
- Ensure you've run the comprehensive fix script
- Check that the bucket names match exactly: `artist-music` and `artist-photos`
- Verify RLS policies are in place

### "403 Unauthorized" or "RLS Policy Violation" Error
- Run the comprehensive fix script to reset RLS policies
- Check that the user is properly authenticated
- Verify that the file path structure matches the RLS policy expectations
- Ensure the `artist_music` table has proper RLS policies

### Upload Permission Denied
- Check that the user is authenticated
- Verify RLS policies are working correctly
- Ensure the file path follows the expected structure

### File Type Errors
- Supported audio formats: MP3, WAV, FLAC, AAC, M4A, OGG
- Supported image formats: JPG, PNG, GIF, WebP
- Maximum file size: 100MB for music files 