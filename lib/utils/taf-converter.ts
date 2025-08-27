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
   * Convert audio buffer to TAF format using WASM
   */
  private async convertToTafFormat(
    audioBuffer: Buffer,
    options: TafConversionOptions
  ): Promise<Buffer> {
    // Import WASM modules
    const { init: initReedSolomon } = await import('@rs_reedsolomon_wasm_pack')
    const { init: initTaf } = await import('@taf_wasm_swap')

    // Initialize WASM modules
    await initReedSolomon()
    await initTaf()

    // Get TAF encoder from WASM
    const { TafEncoder } = await import('@taf_wasm_swap')

    // Create TAF encoder with options
    const encoder = new TafEncoder({
      dataShards: options.dataShards || 4,
      parityShards: options.parityShards || 2,
      compressionLevel: options.compressionLevel || 3,
      quality: options.quality || 0.8
    })

    // Convert audio to TAF format
    const tafBuffer = encoder.encode(audioBuffer)
    
    return tafBuffer
  }

  /**
   * Decode TAF file back to audio
   */
  async decodeTaf(tafUrl: string): Promise<Buffer> {
    try {
      // Download TAF file
      const tafBuffer = await this.downloadFile(tafUrl)

      // Import WASM modules
      const { init: initReedSolomon } = await import('@rs_reedsolomon_wasm_pack')
      const { init: initTaf } = await import('@taf_wasm_swap')

      // Initialize WASM modules
      await initReedSolomon()
      await initTaf()

      // Get TAF decoder from WASM
      const { TafDecoder } = await import('@taf_wasm_swap')

      // Create TAF decoder
      const decoder = new TafDecoder()

      // Decode TAF to audio
      const audioBuffer = decoder.decode(tafBuffer)

      return audioBuffer

    } catch (error) {
      console.error('❌ TAF decoding failed:', error)
      throw error
    }
  }

  /**
   * Get TAF metadata from file
   */
  async getTafMetadata(tafUrl: string): Promise<any> {
    try {
      const tafBuffer = await this.downloadFile(tafUrl)

      // Import WASM modules
      const { init: initTaf } = await import('@taf_wasm_swap')
      await initTaf()

      // Get TAF metadata reader from WASM
      const { TafMetadata } = await import('@taf_wasm_swap')

      // Read metadata
      const metadata = TafMetadata.read(tafBuffer)

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
