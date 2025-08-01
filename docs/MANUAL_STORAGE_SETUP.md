# Manual Supabase Storage Setup

If the SQL script doesn't work due to permissions, follow these manual steps:

## Step 1: Create Storage Buckets

### Via Supabase Dashboard:

1. **Go to your Supabase Dashboard**
2. **Navigate to Storage** (in the left sidebar)
3. **Click "Create a new bucket"**

### Create `artist-music` bucket:
- **Name**: `artist-music`
- **Public bucket**: ❌ **Unchecked** (private)
- **File size limit**: 100MB
- **Allowed MIME types**: `audio/*`
- **Click "Create bucket"**

### Create `artist-photos` bucket:
- **Name**: `artist-photos`
- **Public bucket**: ✅ **Checked** (public)
- **File size limit**: 10MB
- **Allowed MIME types**: `image/*`
- **Click "Create bucket"**

## Step 2: Set Up RLS Policies

### For `artist-music` bucket:

1. **Click on the `artist-music` bucket**
2. **Go to "Policies" tab**
3. **Click "New Policy"**

#### Create these policies one by one:

**Policy 1: Artists can access their own music files**
- **Policy name**: `Artists can access their own music files`
- **Allowed operation**: SELECT
- **Policy definition**:
```sql
bucket_id = 'artist-music' AND auth.uid()::text = split_part(name, '/', 1)
```

**Policy 2: Artists can upload their own music files**
- **Policy name**: `Artists can upload their own music files`
- **Allowed operation**: INSERT
- **Policy definition**:
```sql
bucket_id = 'artist-music' AND auth.uid()::text = split_part(name, '/', 1)
```

**Policy 3: Artists can update their own music files**
- **Policy name**: `Artists can update their own music files`
- **Allowed operation**: UPDATE
- **Policy definition**:
```sql
bucket_id = 'artist-music' AND auth.uid()::text = split_part(name, '/', 1)
```

**Policy 4: Artists can delete their own music files**
- **Policy name**: `Artists can delete their own music files`
- **Allowed operation**: DELETE
- **Policy definition**:
```sql
bucket_id = 'artist-music' AND auth.uid()::text = split_part(name, '/', 1)
```

### For `artist-photos` bucket:

1. **Click on the `artist-photos` bucket**
2. **Go to "Policies" tab**
3. **Click "New Policy"**

#### Create these policies one by one:

**Policy 1: Artist photos are publicly accessible**
- **Policy name**: `Artist photos are publicly accessible`
- **Allowed operation**: SELECT
- **Policy definition**:
```sql
bucket_id = 'artist-photos'
```

**Policy 2: Artists can upload their own photos**
- **Policy name**: `Artists can upload their own photos`
- **Allowed operation**: INSERT
- **Policy definition**:
```sql
bucket_id = 'artist-photos' AND auth.uid()::text = split_part(name, '/', 1)
```

**Policy 3: Artists can update their own photos**
- **Policy name**: `Artists can update their own photos`
- **Allowed operation**: UPDATE
- **Policy definition**:
```sql
bucket_id = 'artist-photos' AND auth.uid()::text = split_part(name, '/', 1)
```

**Policy 4: Artists can delete their own photos**
- **Policy name**: `Artists can delete their own photos`
- **Allowed operation**: DELETE
- **Policy definition**:
```sql
bucket_id = 'artist-photos' AND auth.uid()::text = split_part(name, '/', 1)
```

## Step 3: Fix Database RLS Policies

### Via SQL Editor:

1. **Go to SQL Editor**
2. **Run this script**:

```sql
-- Drop existing artist_music policies to recreate them
DROP POLICY IF EXISTS "Anyone can view public music" ON artist_music;
DROP POLICY IF EXISTS "Artists can view their own music" ON artist_music;
DROP POLICY IF EXISTS "Artists can manage their own music" ON artist_music;

-- Recreate artist_music policies
CREATE POLICY "Anyone can view public music" ON artist_music
  FOR SELECT USING (is_public = true);

CREATE POLICY "Artists can view their own music" ON artist_music
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Artists can manage their own music" ON artist_music
  FOR ALL USING (auth.uid() = user_id);

-- Enable RLS on artist_music table
ALTER TABLE artist_music ENABLE ROW LEVEL SECURITY;
```

## Step 4: Test the Setup

1. **Go to your application** (`/artist/music`)
2. **Try uploading a music file**
3. **Check the browser console for any errors**

## Troubleshooting

### If you still get RLS errors:
1. **Check that the user is authenticated**
2. **Verify the file path structure matches the policy expectations**
3. **Ensure the buckets exist and have the correct policies**
4. **Check that the `artist_music` table has RLS enabled**

### File Path Structure:
The policies expect files to be stored as:
- `{user_id}/{filename}`

For example:
- `97b9e178-b65f-47a3-910e-550864a4568a/song.mp3`
- `97b9e178-b65f-47a3-910e-550864a4568a/cover.jpg` 