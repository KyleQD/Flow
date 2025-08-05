// Color harmony utility functions
export function useColorHarmony() {
  // Convert hex to HSL
  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }

    return { h: h * 360, s: s * 100, l: l * 100 }
  }

  // Convert HSL to hex
  const hslToHex = (h: number, s: number, l: number) => {
    h /= 360
    s /= 100
    l /= 100

    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs((h * 6) % 2 - 1))
    const m = l - c / 2
    let r = 0
    let g = 0
    let b = 0

    if (0 <= h && h < 1 / 6) {
      r = c
      g = x
      b = 0
    } else if (1 / 6 <= h && h < 1 / 3) {
      r = x
      g = c
      b = 0
    } else if (1 / 3 <= h && h < 1 / 2) {
      r = 0
      g = c
      b = x
    } else if (1 / 2 <= h && h < 2 / 3) {
      r = 0
      g = x
      b = c
    } else if (2 / 3 <= h && h < 5 / 6) {
      r = x
      g = 0
      b = c
    } else if (5 / 6 <= h && h <= 1) {
      r = c
      g = 0
      b = x
    }

    const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0')
    const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0')
    const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0')

    return `#${rHex}${gHex}${bHex}`
  }

  // Generate complementary color
  const getComplementary = (hex: string) => {
    const hsl = hexToHsl(hex)
    const complementaryHue = (hsl.h + 180) % 360
    return hslToHex(complementaryHue, hsl.s, hsl.l)
  }

  // Generate analogous colors (colors next to each other on the color wheel)
  const getAnalogous = (hex: string) => {
    const hsl = hexToHsl(hex)
    const analogous1 = hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l)
    const analogous2 = hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l)
    return [analogous1, analogous2]
  }

  // Generate triadic colors (three colors equally spaced around the color wheel)
  const getTriadic = (hex: string) => {
    const hsl = hexToHsl(hex)
    const triadic1 = hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l)
    const triadic2 = hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l)
    return [triadic1, triadic2]
  }

  // Generate split-complementary colors
  const getSplitComplementary = (hex: string) => {
    const hsl = hexToHsl(hex)
    const split1 = hslToHex((hsl.h + 150) % 360, hsl.s, hsl.l)
    const split2 = hslToHex((hsl.h + 210) % 360, hsl.s, hsl.l)
    return [split1, split2]
  }

  // Generate monochromatic variations
  const getMonochromatic = (hex: string) => {
    const hsl = hexToHsl(hex)
    const lighter = hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 20, 100))
    const darker = hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 20, 0))
    return [lighter, darker]
  }

  // Get all harmony suggestions for a color
  const getHarmonySuggestions = (hex: string) => {
    return {
      complementary: getComplementary(hex),
      analogous: getAnalogous(hex),
      triadic: getTriadic(hex),
      splitComplementary: getSplitComplementary(hex),
      monochromatic: getMonochromatic(hex)
    }
  }

  return {
    getComplementary,
    getAnalogous,
    getTriadic,
    getSplitComplementary,
    getMonochromatic,
    getHarmonySuggestions
  }
} 