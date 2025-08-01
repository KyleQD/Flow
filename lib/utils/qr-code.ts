import crypto from 'crypto'

/**
 * Generate a QR code hash for shift check-ins
 * @param data - The data to encode in the QR code
 * @returns A unique hash string
 */
export async function generateQRCode(data: string): Promise<string> {
  // Create a hash of the data with a timestamp for uniqueness
  const timestamp = Date.now().toString()
  const hashInput = `${data}-${timestamp}-${Math.random()}`
  
  // Generate SHA-256 hash
  const hash = crypto.createHash('sha256').update(hashInput).digest('hex')
  
  // Return a shorter version for QR code (first 16 characters)
  return hash.substring(0, 16)
}

/**
 * Validate QR code data
 * @param qrData - The QR code data to validate
 * @returns True if valid, false otherwise
 */
export function validateQRCodeData(qrData: string): boolean {
  // Basic validation - should be a 16-character hex string
  const hexRegex = /^[0-9a-f]{16}$/i
  return hexRegex.test(qrData)
}

/**
 * Decode QR code data (placeholder for future implementation)
 * @param qrData - The QR code data to decode
 * @returns The decoded data object
 */
export function decodeQRCodeData(qrData: string): Record<string, any> | null {
  try {
    // For now, return a simple object with the hash
    // In a real implementation, this might decode more complex data
    return {
      hash: qrData,
      timestamp: Date.now(),
      type: 'shift_checkin'
    }
  } catch (error) {
    console.error('Error decoding QR code data:', error)
    return null
  }
} 