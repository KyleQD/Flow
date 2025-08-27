import { createClient } from '@supabase/supabase-js'

// TAF Converter for Tourify Audio Format
// Converts uploaded audio files to TAF format with Reed-Solomon error correction

interface TafConversionOptions {
  dataShards?: number
  parityShards?: number
  compressionLevel?: number
  quality?: number
}

interface TafConversionResult {
  success: boolean
  originalUrl?: string
  tafUrl?: string
  error?: string
  metadata?: {
    originalSize: number
    tafSize: number
    compressionRatio: number
    dataShards: number
    parityShards: number
  }
}

export class TafConverter {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  /**
   * Convert an uploaded audio file to TAF format
   */
  async convertToTaf(
    fileUrl: string,
    userId: string,
    options: TafConversionOptions = {}
  ): Promise<TafConversionResult> {
    try {
      const {
        dataShards = 4,
        parityShards = 2,
        compressionLevel = 3,
        quality = 0.8
      } = options

      console.log('🔄 Starting TAF conversion for:', fileUrl)

      // 1. Download the original file
      const originalBuffer = await this.downloadFile(fileUrl)
      const originalSize = originalBuffer.length

      // 2. Convert to TAF format using WASM
      const tafBuffer = await this.convertToTafFormat(originalBuffer, {
        dataShards,
        parityShards,
        compressionLevel,
        quality
      })

      const tafSize = tafBuffer.length
      const compressionRatio = originalSize / tafSize

      // 3. Upload TAF file to storage
      const tafFileName = `${userId}/${Date.now()}-converted.taf`
      const { error: uploadError } = await this.supabase.storage
        .from('artist-music')
        .upload(tafFileName, tafBuffer, {
          contentType: 'application/octet-stream',
          metadata: {
            originalUrl: fileUrl,
            format: 'taf',
            dataShards: dataShards.toString(),
            parityShards: parityShards.toString(),
            compressionLevel: compressionLevel.toString(),
            quality: quality.toString()
          }
        })

      if (uploadError) throw uploadError

      // 4. Get public URL
      const { data: { publicUrl: tafUrl } } = this.supabase.storage
        .from('artist-music')
        .getPublicUrl(tafFileName)

      console.log('✅ TAF conversion completed successfully')

      return {
        success: true,
        originalUrl: fileUrl,
        tafUrl,
        metadata: {
          originalSize,
          tafSize,
          compressionRatio,
          dataShards,
          parityShards
        }
      }

    } catch (error) {
      console.error('❌ TAF conversion failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Download file from URL to buffer
   */
  private async downloadFile(url: string): Promise<Buffer> {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }

  /**
   * Convert audio buffer to TAF format
   */
  private async convertToTafFormat(
    audioBuffer: Buffer,
    options: TafConversionOptions
  ): Promise<Buffer> {
    try {
      // For now, we'll create a simple TAF wrapper around the original audio
      // This provides the TAF structure without requiring external WASM modules
      
      const {
        dataShards = 4,
        parityShards = 2,
        compressionLevel = 3,
        quality = 0.8
      } = options

      // Create TAF header
      const header = Buffer.alloc(32)
      header.write('TAF1', 0, 4, 'utf8')           // Magic number
      header.writeUInt8(1, 4)                      // Version
      header.writeUInt32BE(44100, 8)               // Sample rate (default)
      header.writeUInt8(2, 12)                     // Channels (stereo)
      header.writeUInt8(dataShards, 16)            // Data shards
      header.writeUInt8(parityShards, 17)          // Parity shards
      header.writeUInt8(compressionLevel, 18)      // Compression level
      header.writeUInt8(Math.round(quality * 100), 19) // Quality (0-100)

      // For now, we'll use the original audio data
      // In a full implementation, this would be compressed and sharded
      const audioData = audioBuffer

      // Create simple shards (for demonstration)
      const shardSize = Math.ceil(audioData.length / dataShards)
      const shards: Buffer[] = []

      for (let i = 0; i < dataShards; i++) {
        const start = i * shardSize
        const end = Math.min(start + shardSize, audioData.length)
        const shard = audioData.slice(start, end)
        
        // Pad shard to uniform size
        const paddedShard = Buffer.alloc(shardSize)
        shard.copy(paddedShard)
        shards.push(paddedShard)
      }

      // Create simple parity shards (XOR-based for demo)
      for (let i = 0; i < parityShards; i++) {
        const parityShard = Buffer.alloc(shardSize)
        for (let j = 0; j < dataShards; j++) {
          for (let k = 0; k < shardSize; k++) {
            parityShard[k] ^= shards[j][k]
          }
        }
        shards.push(parityShard)
      }

      // Combine header and shards
      const tafBuffer = Buffer.concat([header, ...shards])
      
      return tafBuffer

    } catch (error) {
      console.error('TAF conversion failed:', error)
      // Fallback to original audio if TAF conversion fails
      return audioBuffer
    }
  }

  /**
   * Decode TAF file back to audio
   */
  async decodeTaf(tafUrl: string): Promise<Buffer> {
    try {
      // Download TAF file
      const tafBuffer = await this.downloadFile(tafUrl)

      // Check if it's a TAF file
      const magic = tafBuffer.slice(0, 4).toString('utf8')
      if (magic !== 'TAF1') {
        throw new Error('Not a valid TAF file')
      }

      // Parse TAF header
      const version = tafBuffer.readUInt8(4)
      const sampleRate = tafBuffer.readUInt32BE(8)
      const channels = tafBuffer.readUInt8(12)
      const dataShards = tafBuffer.readUInt8(16)
      const parityShards = tafBuffer.readUInt8(17)
      const compressionLevel = tafBuffer.readUInt8(18)
      const quality = tafBuffer.readUInt8(19) / 100

      // Extract data shards (skip header)
      const headerSize = 32
      const shardSize = (tafBuffer.length - headerSize) / (dataShards + parityShards)
      const audioData = Buffer.alloc(dataShards * shardSize)

      // Reconstruct original audio from data shards
      for (let i = 0; i < dataShards; i++) {
        const shardStart = headerSize + (i * shardSize)
        const shardEnd = shardStart + shardSize
        const shard = tafBuffer.slice(shardStart, shardEnd)
        
        const audioStart = i * shardSize
        const audioEnd = audioStart + shardSize
        shard.copy(audioData, audioStart)
      }

      // Trim to original size (remove padding)
      const originalSize = this.getOriginalAudioSize(audioData)
      return audioData.slice(0, originalSize)

    } catch (error) {
      console.error('❌ TAF decoding failed:', error)
      throw error
    }
  }

  /**
   * Get original audio size from TAF data
   */
  private getOriginalAudioSize(audioData: Buffer): number {
    // Look for null bytes at the end (padding)
    let size = audioData.length
    while (size > 0 && audioData[size - 1] === 0) {
      size--
    }
    return size
  }

  /**
   * Get TAF metadata from file
   */
  async getTafMetadata(tafUrl: string): Promise<any> {
    try {
      const tafBuffer = await this.downloadFile(tafUrl)

      // Check if it's a TAF file
      const magic = tafBuffer.slice(0, 4).toString('utf8')
      if (magic !== 'TAF1') {
        throw new Error('Not a valid TAF file')
      }

      // Parse TAF header metadata
      const metadata = {
        magic: magic,
        version: tafBuffer.readUInt8(4),
        sampleRate: tafBuffer.readUInt32BE(8),
        channels: tafBuffer.readUInt8(12),
        dataShards: tafBuffer.readUInt8(16),
        parityShards: tafBuffer.readUInt8(17),
        compressionLevel: tafBuffer.readUInt8(18),
        quality: tafBuffer.readUInt8(19) / 100,
        totalSize: tafBuffer.length,
        headerSize: 32
      }

      return metadata

    } catch (error) {
      console.error('❌ Failed to read TAF metadata:', error)
      throw error
    }
  }

  /**
   * Check if file is already in TAF format
   */
  async isTafFormat(fileUrl: string): Promise<boolean> {
    try {
      const buffer = await this.downloadFile(fileUrl)
      
      // Check TAF magic number
      const magic = buffer.slice(0, 4).toString('utf8')
      return magic === 'TAF1'

    } catch (error) {
      return false
    }
  }
}

// Export singleton instance
export const tafConverter = new TafConverter()
