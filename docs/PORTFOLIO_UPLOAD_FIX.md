# Portfolio Upload Fix Guide

## Problem
Users are experiencing "Failed to prepare storage" errors when trying to upload portfolio content in their account settings. This is caused by missing storage bucket configuration in Supabase.

## Solution

### Option 1: Automated Setup (Recommended)

1. **Run the setup script:**
   ```bash
   node scripts/setup-portfolio-storage.js
   ```

2. **Verify the setup worked:**
   - Check the console output for success messages
   - Try uploading a portfolio item in your app

### Option 2: Manual Setup via Supabase Dashboard

1. **Go to your Supabase Dashboard**
2. **Navigate to Storage** (left sidebar)
3. **Click "Create a new bucket"**
4. **Configure the bucket:**
   - **Name**: `portfolio`
   - **Public bucket**: ✅ **Checked** (public)
   - **File size limit**: 100MB
   - **Allowed MIME types**: 
     ```
     image/jpeg, image/png, image/gif, image/webp,
     video/mp4, video/webm, video/ogg,
     audio/mpeg, audio/wav, audio/flac, audio/aac, audio/m4a, audio/ogg
     ```
5. **Click "Create bucket"**

### Option 3: SQL Script Setup

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor** (left sidebar)
3. **Copy and paste** the contents of `supabase/portfolio-storage-setup.sql`
4. **Click "Run"** to execute the script

## What This Fixes

### Storage Issues
- ✅ Creates the missing `portfolio` storage bucket
- ✅ Sets up proper file size limits (100MB for videos, 8MB for images)
- ✅ Configures allowed file types for images, videos, and audio

### Security Issues
- ✅ Implements Row Level Security (RLS) policies
- ✅ Ensures users can only upload to their own folders
- ✅ Makes portfolio files publicly viewable
- ✅ Prevents unauthorized access to other users' files

### Database Issues
- ✅ Creates the `portfolio_items` table if it doesn't exist
- ✅ Sets up proper indexes for performance
- ✅ Implements proper RLS policies for the table

## File Structure

After setup, your portfolio files will be organized as:
```
portfolio/
├── {user_id}/
│   ├── image_{user_id}_{timestamp}.jpg
│   ├── video_{user_id}_{timestamp}.mp4
│   ├── audio_{user_id}_{timestamp}.mp3
│   └── ...
```

## Testing the Fix

1. **Navigate to your account settings** (`/settings`)
2. **Go to the Portfolio section**
3. **Try uploading a file:**
   - Click "Choose File" or one of the media buttons
   - Select an image, video, or audio file
   - Fill in the title and description
   - Click "Add to Portfolio"

4. **Expected behavior:**
   - ✅ File uploads successfully
   - ✅ No "Failed to prepare storage" error
   - ✅ File appears in your portfolio list
   - ✅ File is publicly accessible via URL

## Troubleshooting

### Still Getting "Failed to prepare storage" Error

1. **Check your environment variables:**
   ```bash
   # Make sure these are set in .env.local
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. **Verify bucket creation:**
   - Go to Supabase Dashboard → Storage
   - Check if `portfolio` bucket exists
   - Verify it's marked as public

3. **Check RLS policies:**
   - Go to Supabase Dashboard → Storage → portfolio bucket → Policies
   - Ensure these policies exist:
     - "Portfolio files are publicly accessible" (SELECT)
     - "Users can upload to their own portfolio folder" (INSERT)
     - "Users can update their own portfolio files" (UPDATE)
     - "Users can delete their own portfolio files" (DELETE)

### Permission Issues

If you get permission errors:

1. **Check your service role key:**
   - Ensure you're using the service role key, not the anon key
   - The service role key has admin privileges needed for bucket creation

2. **Verify Supabase project settings:**
   - Ensure storage is enabled in your project
   - Check that your project has the necessary permissions

### File Upload Fails

1. **Check file size:**
   - Images: Max 8MB for free accounts
   - Videos: Max 100MB for free accounts
   - Audio: Max 8MB for free accounts

2. **Check file type:**
   - Images: JPEG, PNG, GIF, WebP
   - Videos: MP4, WebM, OGG
   - Audio: MP3, WAV, FLAC, AAC, M4A, OGG

3. **Check account limits:**
   - Free accounts: 100 images, 1 video
   - Premium accounts: Higher limits

## Support

If you're still experiencing issues after following these steps:

1. **Check the browser console** for detailed error messages
2. **Check the server logs** for backend errors
3. **Contact support** with the specific error messages

## Related Files

- `app/api/portfolio/upload/route.ts` - Portfolio upload API
- `app/api/settings/portfolio/route.ts` - Portfolio items CRUD API
- `components/settings/portfolio-settings.tsx` - Portfolio settings UI
- `supabase/portfolio-storage-setup.sql` - Storage setup SQL script
- `scripts/setup-portfolio-storage.js` - Automated setup script
