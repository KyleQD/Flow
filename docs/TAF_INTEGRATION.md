# TAF (Tourify Audio Format) Integration

## Overview

TAF (Tourify Audio Format) is a custom audio format that provides:
- **Error Correction**: Reed-Solomon forward error correction for robust playback
- **Compression**: Efficient audio compression with configurable quality
- **Reliability**: Automatic recovery from data corruption or network issues
- **Performance**: Optimized for streaming and mobile playback

## Features

### 🛡️ Error Correction
- **Reed-Solomon FEC**: Configurable data and parity shards
- **Automatic Recovery**: Recover from missing or corrupted data
- **Network Resilience**: Handle packet loss and connection issues

### 📦 Compression
- **Configurable Quality**: Adjust compression level (1-9)
- **Size Optimization**: Reduce file sizes while maintaining quality
- **Streaming Optimized**: Efficient for web and mobile playback

### 🎵 Audio Quality
- **Lossy Compression**: Maintain high audio quality
- **Format Support**: Convert from MP3, WAV, FLAC, etc.
- **Metadata Preservation**: Keep original audio metadata

## Implementation

### Automatic Conversion

All uploaded audio files are automatically converted to TAF format:

```typescript
// Automatic TAF conversion during upload
const tafResult = await tafConverter.convertToTaf(fileUrl, userId, {
  dataShards: 4,        // Number of data shards
  parityShards: 2,      // Number of parity shards for error correction
  compressionLevel: 3,  // Compression level (1-9)
  quality: 0.8          // Audio quality (0.1-1.0)
})
```

### TAF Player

The TAF player automatically detects and plays TAF files:

```typescript
// TAF-enabled music player
<TafMusicPlayer 
  track={track}
  showControls={true}
  autoPlay={false}
/>
```

### Error Correction

TAF files can recover from data corruption:

```typescript
// Automatic error correction during playback
const audioBuffer = await tafConverter.decodeTaf(tafUrl)
// Reed-Solomon FEC automatically recovers missing data
```

## Configuration

### Default Settings

```typescript
const defaultTafOptions = {
  dataShards: 4,        // 4 data shards
  parityShards: 2,      // 2 parity shards (can recover 2 missing shards)
  compressionLevel: 3,  // Medium compression
  quality: 0.8          // 80% quality
}
```

### Custom Configuration

```typescript
// High reliability (more parity shards)
const highReliability = {
  dataShards: 4,
  parityShards: 4,      // Can recover 4 missing shards
  compressionLevel: 2,  // Lower compression for better quality
  quality: 0.9          // Higher quality
}

// High compression (smaller files)
const highCompression = {
  dataShards: 4,
  parityShards: 1,      // Minimal error correction
  compressionLevel: 7,  // High compression
  quality: 0.6          // Lower quality, smaller files
}
```

## File Structure

### TAF File Format

```
TAF1                    # Magic number
[Version]              # Format version
[Sample Rate]          # Audio sample rate
[Channels]             # Number of audio channels
[Data Shards]          # Number of data shards
[Parity Shards]        # Number of parity shards
[Compressed Audio]     # Zstandard compressed audio
[Reed-Solomon Shards]  # Error correction shards
[Metadata]             # Audio metadata
```

### Storage Structure

```
artist-music/
├── user-id/
│   ├── original-file.mp3      # Original uploaded file
│   ├── converted.taf          # TAF converted file
│   └── metadata.json          # Conversion metadata
```

## Benefits

### For Users
- **Better Playback**: Automatic error correction
- **Faster Loading**: Optimized compression
- **Reliable Streaming**: Handle network issues
- **Mobile Friendly**: Efficient for mobile devices

### For Platform
- **Reduced Bandwidth**: Smaller file sizes
- **Better Performance**: Faster uploads and downloads
- **Error Resilience**: Handle storage corruption
- **Scalability**: Efficient CDN delivery

## Technical Details

### Implementation

TAF uses a custom implementation for encoding/decoding:

```typescript
// TAF header structure
const header = Buffer.alloc(32)
header.write('TAF1', 0, 4, 'utf8')           // Magic number
header.writeUInt8(1, 4)                      // Version
header.writeUInt32BE(44100, 8)               // Sample rate
header.writeUInt8(2, 12)                     // Channels
header.writeUInt8(dataShards, 16)            // Data shards
header.writeUInt8(parityShards, 17)          // Parity shards
```

### Error Correction

Reed-Solomon FEC provides robust error correction:

- **Data Shards**: Original audio data
- **Parity Shards**: Error correction data
- **Recovery**: Can recover up to `parityShards` missing shards

### Compression

Zstandard compression provides efficient audio compression:

- **Configurable Levels**: 1-9 (higher = more compression)
- **Quality Control**: 0.1-1.0 (higher = better quality)
- **Fast Encoding**: Optimized for real-time conversion

## Migration

### Existing Files

Existing audio files are automatically converted to TAF format:

1. **Upload**: User uploads audio file
2. **Convert**: Automatic TAF conversion
3. **Store**: Both original and TAF versions stored
4. **Serve**: TAF version served for playback

### Backward Compatibility

- **Original Files**: Still accessible if needed
- **Fallback**: Use original if TAF conversion fails
- **Gradual Migration**: Convert existing files over time

## Monitoring

### Conversion Metrics

Track TAF conversion performance:

```typescript
const metrics = {
  originalSize: 1024000,    // 1MB original
  tafSize: 512000,          // 512KB TAF
  compressionRatio: 2.0,    // 2x compression
  dataShards: 4,
  parityShards: 2
}
```

### Error Tracking

Monitor conversion and playback errors:

- **Conversion Success Rate**: Track successful conversions
- **Playback Errors**: Monitor TAF playback issues
- **Recovery Rate**: Track error correction success

## Future Enhancements

### Planned Features

- **Adaptive Quality**: Adjust based on network conditions
- **Progressive Loading**: Stream TAF files progressively
- **Offline Support**: Cache TAF files for offline playback
- **Analytics**: Track playback performance and errors

### Performance Optimizations

- **Parallel Processing**: Convert multiple files simultaneously
- **Background Conversion**: Convert files in background
- **Smart Caching**: Cache frequently accessed TAF files
- **CDN Integration**: Optimize TAF delivery via CDN
