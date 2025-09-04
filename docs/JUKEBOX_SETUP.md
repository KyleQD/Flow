# Jukebox Player Setup Guide

## Overview

The Jukebox Player is a modern, interactive music player component that replaces the "Recent Actions" section in the Tourify dashboard. It features a sleek, jukebox-style interface with full playback controls, playlist management, and visual effects.

## Features

- 🎵 **Interactive Playlist**: Browse and select from a curated collection of songs
- 🎛️ **Full Playback Controls**: Play, pause, skip, shuffle, repeat, and volume control
- 🎨 **Visual Effects**: Animated album art, progress bars, and smooth transitions
- ❤️ **Like System**: Mark your favorite songs
- 📱 **Responsive Design**: Works on all screen sizes
- 🎯 **Demo Mode**: Simulates playback when no audio files are available

## File Structure

```
components/dashboard/
├── jukebox-player.tsx          # Main jukebox component
└── enhanced-quick-actions.tsx  # Updated to include jukebox

lib/services/
└── jukebox.service.ts          # Jukebox state management

public/
├── audio/                      # Audio files directory
│   ├── 1.mp3
│   ├── 2.mp3
│   └── ...
└── images/
    └── album-placeholder.svg   # Default album art
```

## Adding Real Audio Files

### 1. Prepare Your Audio Files

- **Format**: MP3, WAV, or OGG (MP3 recommended for compatibility)
- **Quality**: 128-320 kbps for good balance of quality and file size
- **Naming**: Use the song ID from the service (e.g., `1.mp3`, `2.mp3`)

### 2. Place Files in Directory

```bash
# Navigate to the audio directory
cd public/audio/

# Add your audio files
cp /path/to/your/song.mp3 1.mp3
cp /path/to/your/song2.mp3 2.mp3
# ... continue for all songs
```

### 3. Update Song Metadata

Edit `lib/services/jukebox.service.ts` to match your audio files:

```typescript
getSampleSongs(): Song[] {
  return [
    {
      id: "1",                    // Must match filename (1.mp3)
      title: "Your Song Title",
      artist: "Your Artist Name",
      duration: 237,              // Duration in seconds
      genre: "Your Genre",
      isLiked: false,
      albumArt: "/images/your-album-art.jpg", // Optional custom art
      // ... other metadata
    },
    // ... more songs
  ]
}
```

### 4. Add Custom Album Art (Optional)

1. Place your album art images in `public/images/`
2. Update the `albumArt` property in the song metadata
3. Supported formats: JPG, PNG, SVG, WebP

## Customizing the Playlist

### Adding New Songs

1. **Add Audio File**: Place the audio file in `public/audio/`
2. **Update Service**: Add song metadata to `jukebox.service.ts`
3. **Restart**: The jukebox will automatically load the new song

### Modifying Song Information

Edit the song object in `jukebox.service.ts`:

```typescript
{
  id: "unique-id",
  title: "Song Title",
  artist: "Artist Name",
  duration: 180, // seconds
  genre: "Genre",
  isLiked: false,
  albumArt: "/path/to/art.jpg",
  releaseDate: "2024-01-01",
  bpm: 120,
  key: "C Major",
  tags: ["tag1", "tag2"]
}
```

### Reordering Songs

The playlist order is determined by the array order in `getSampleSongs()`. Simply reorder the songs in the array to change the playlist order.

## Advanced Customization

### Styling

The jukebox uses Tailwind CSS classes. You can customize the appearance by modifying the classes in `jukebox-player.tsx`:

```typescript
// Change the main card background
<Card className="bg-gradient-to-br from-blue-900/50 via-purple-900/50 to-pink-900/50">

// Modify button colors
<Button className="bg-gradient-to-r from-blue-500 to-purple-500">
```

### Adding New Features

1. **Search Functionality**: The service includes a `searchSongs()` method
2. **Genre Filtering**: Use `getSongsByGenre()` to filter by genre
3. **Playlist Management**: Extend the service to support multiple playlists

### Integration with Database

To connect with a real database:

1. **Create Database Schema**: Add tables for songs, playlists, and user preferences
2. **Update Service**: Replace the static data with database queries
3. **Add API Routes**: Create endpoints for CRUD operations

## Troubleshooting

### Audio Not Playing

1. **Check File Format**: Ensure audio files are in supported formats
2. **Verify File Path**: Confirm files are in `public/audio/` directory
3. **Browser Console**: Check for CORS or file access errors
4. **File Permissions**: Ensure files are readable by the web server

### Visual Issues

1. **Album Art**: Verify image paths and formats
2. **Styling**: Check for CSS conflicts
3. **Responsive**: Test on different screen sizes

### Performance

1. **File Size**: Optimize audio files for web delivery
2. **Caching**: Implement proper caching headers
3. **Lazy Loading**: Consider lazy loading for large playlists

## Demo Mode

When no audio files are available, the jukebox runs in demo mode:

- ✅ All UI interactions work
- ✅ Visual effects and animations function
- ✅ Playlist management is fully operational
- ⚠️ Audio playback is simulated
- ℹ️ Demo mode indicator is displayed

## Future Enhancements

- [ ] **Real-time Collaboration**: Share playlists with other users
- [ ] **Audio Visualization**: Add waveform or spectrum analyzer
- [ ] **Crossfade**: Smooth transitions between songs
- [ ] **Equalizer**: Built-in audio equalizer
- [ ] **Lyrics Display**: Show synchronized lyrics
- [ ] **Smart Playlists**: Auto-generated playlists based on preferences
- [ ] **Integration**: Connect with external music services

## Support

For issues or questions:

1. Check the browser console for errors
2. Verify file paths and permissions
3. Test with different audio formats
4. Review the service implementation

The jukebox is designed to be robust and user-friendly, providing a great music experience in the Tourify platform!
