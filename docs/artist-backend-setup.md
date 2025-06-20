# Artist Backend Setup Guide

This guide explains how to set up and use the artist profile backend system that connects to Supabase.

## 🚀 Quick Setup

### 1. Run Database Migrations

Execute these SQL scripts in your Supabase SQL Editor in this order:

1. **Core Setup** (if not already done):
   ```sql
   -- Run: complete_database_setup.sql
   -- This creates the basic artist_profiles table
   ```

2. **Artist Features**:
   ```sql
   -- Run: supabase/artist-features-setup.sql
   -- This creates all content management tables
   ```

3. **Storage Buckets**:
   ```sql
   -- Run: supabase/setup-storage-buckets.sql (basic buckets)
   -- Run: supabase/artist-storage-setup.sql (artist-specific buckets)
   ```

### 2. Environment Setup

Ensure your `.env.local` has:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📋 Database Tables Created

### Core Tables
- `artist_profiles` - Main artist profile data
- `artist_music` - Music tracks, albums, EPs
- `artist_videos` - Video content
- `artist_photos` - Photo galleries
- `artist_blog_posts` - Blog content
- `artist_documents` - Press kit, riders, etc.
- `artist_events` - Concerts, performances
- `artist_merchandise` - Store items
- `artist_analytics` - Performance metrics
- `artist_collaborations` - Artist partnerships
- `artist_fan_interactions` - Engagement tracking

### Storage Buckets
- `avatars` (public) - Profile pictures
- `artist-music` (private) - Audio files
- `artist-videos` (public) - Video content
- `artist-photos` (public) - Photo galleries
- `artist-documents` (private) - Press kit documents
- `artist-merchandise` (public) - Product images
- `artist-blog-images` (public) - Blog post images

## 🔧 How to Use

### 1. Artist Context

The `ArtistProvider` wraps your artist pages and provides:

```tsx
import { useArtist } from '@/contexts/artist-context'

function MyArtistComponent() {
  const { 
    user, 
    profile, 
    stats, 
    updateProfile, 
    createContent,
    refreshStats 
  } = useArtist()

  // Access artist data and actions
}
```

### 2. Content Management Service

Use the `artistContentService` for CRUD operations:

```tsx
import { artistContentService } from '@/lib/services/artist-content.service'

// Create music content
const music = await artistContentService.createMusic(userId, profileId, {
  title: "My New Song",
  type: "single",
  genre: "Rock",
  is_public: true
})

// Get artist's music
const tracks = await artistContentService.getMusic(userId, { limit: 10 })
```

### 3. File Uploads

Upload files to appropriate buckets:

```tsx
// Upload audio file
const audioPath = `${userId}/music/${fileName}`
await artistContentService.uploadFile('artist-music', audioPath, audioFile)
const audioUrl = artistContentService.getFileUrl('artist-music', audioPath)

// Upload photo
const photoPath = `${userId}/photos/${fileName}`
await artistContentService.uploadFile('artist-photos', photoPath, photoFile)
```

## 🎵 Content Types Supported

### Music Content
- Singles, Albums, EPs, Mixtapes
- Multiple platform links (Spotify, Apple Music, etc.)
- Cover art, lyrics, credits
- Play count tracking

### Video Content
- Music videos, live performances, interviews
- YouTube/Vimeo integration
- View count tracking

### Photo Galleries
- Performance, studio, portrait photos
- Photographer credits, location data
- Categorized organization

### Blog Posts
- Rich content with SEO optimization
- Draft/published status
- Categories and tags

### Events
- Concerts, festivals, tours
- Venue information, ticket links
- Setlist management

### Merchandise
- Physical and digital products
- Inventory tracking
- Variant support (sizes, colors)

## 📊 Analytics & Stats

The system tracks:
- Content views and engagement
- Follower growth
- Geographic data
- Popular content identification

Access via:
```tsx
const { stats } = useArtist()
// stats.totalPlays, stats.musicCount, etc.
```

## 🔒 Security Features

### Row Level Security (RLS)
- Artists can only manage their own content
- Public content is viewable by everyone
- Private content requires authentication

### File Type Validation
- Music: mp3, wav, flac, aac, m4a, ogg
- Videos: mp4, mov, avi, mkv, webm, flv
- Images: jpg, jpeg, png, gif, webp, svg
- Documents: pdf, doc, docx, txt, rtf

### Folder Structure
All uploads are organized by user ID:
```
bucket/
  ├── user-id-1/
  │   ├── music/
  │   ├── videos/
  │   └── photos/
  └── user-id-2/
      └── ...
```

## 🔄 Artist Profile Creation Flow

1. User signs up and creates basic profile
2. During onboarding, they can create an artist profile
3. Artist profile gets linked to main profile
4. Content creation becomes available

### Create Artist Profile
```tsx
// In onboarding or profile setup
const { data } = await supabase
  .from('artist_profiles')
  .insert({
    user_id: user.id,
    artist_name: "Artist Name",
    bio: "Artist bio",
    genres: ["Rock", "Pop"],
    social_links: {
      instagram: "@artist",
      spotify: "spotify-url"
    }
  })
```

## 🎨 Connecting to UI Components

Your existing UI in `/app/artist` will now work with real data:

```tsx
// In a music component
const { profile, createContent } = useArtist()

const handleUploadMusic = async (formData) => {
  const musicData = await createContent('music', {
    title: formData.title,
    type: 'single',
    genre: formData.genre
  })
  // Music is now saved to database
}
```

## 🚦 Migration from Mock Data

The artist context has been updated to:
1. ✅ Remove all mock/simulated data
2. ✅ Connect to real Supabase tables
3. ✅ Provide real statistics from database
4. ✅ Handle authentication properly
5. ✅ Support content creation

Your existing UI components should work without changes, but now with real data!

## 📈 Performance Optimizations

- Database indexes on frequently queried fields
- Proper RLS policies for security
- Optimized queries with selective field loading
- File upload with appropriate caching headers

## 🐛 Error Handling

The services include comprehensive error handling:
- Database connection errors
- File upload failures
- Authentication issues
- Data validation errors

## 📝 Next Steps

After running the setup:

1. **Test the artist onboarding flow**
2. **Verify content creation works**
3. **Check file uploads function**
4. **Confirm analytics are tracking**
5. **Test the UI components with real data**

## 🆘 Troubleshooting

### Common Issues

1. **"artist_profiles table doesn't exist"**
   - Run the database setup scripts in order

2. **"Storage bucket not found"**
   - Run the storage setup scripts

3. **"Permission denied"**
   - Check RLS policies are enabled
   - Verify user authentication

4. **"Function not found"**
   - Ensure all SQL functions were created
   - Check for syntax errors in migrations

### Debug Mode

Add to your environment for detailed logging:
```bash
NEXT_PUBLIC_DEBUG_ARTIST=true
```

This setup provides a complete, production-ready backend for artist profiles with content management, analytics, and secure file storage! 