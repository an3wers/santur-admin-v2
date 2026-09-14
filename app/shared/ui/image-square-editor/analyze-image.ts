type PixelData = Pick<ImageData, 'data' | 'width' | 'height'>

export type ImageAnalysis = {
  hasTransparency: boolean
  isWhiteBackground: boolean
}

export const WHITE_THRESHOLD = 245
export const NON_WHITE_TOLERANCE = 0.05

const ANALYZE_MAX_SIDE = 200

// Пиксель после заливки прозрачности белым
function isWhitePixel(data: PixelData['data'], index: number) {
  const alpha = data[index + 3]! / 255

  for (let c = 0; c < 3; c++) {
    const value = data[index + c]! * alpha + 255 * (1 - alpha)
    if (value < WHITE_THRESHOLD) return false
  }

  return true
}

export function analyzeImageData({ data, width, height }: PixelData): ImageAnalysis {
  let hasTransparency = false

  for (let i = 3; i < data.length; i += 4) {
    if (data[i]! < 255) {
      hasTransparency = true
      break
    }
  }

  let total = 0
  let nonWhite = 0

  const check = (x: number, y: number) => {
    total++
    if (!isWhitePixel(data, (y * width + x) * 4)) nonWhite++
  }

  for (let x = 0; x < width; x++) {
    check(x, 0)
    if (height > 1) check(x, height - 1)
  }

  for (let y = 1; y < height - 1; y++) {
    check(0, y)
    if (width > 1) check(width - 1, y)
  }

  return {
    hasTransparency,
    isWhiteBackground: total > 0 && nonWhite / total <= NON_WHITE_TOLERANCE
  }
}

export function analyzeImage(source: CanvasImageSource, width: number, height: number) {
  const scale = Math.min(1, ANALYZE_MAX_SIDE / Math.max(width, height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width * scale))
  canvas.height = Math.max(1, Math.round(height * scale))

  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null

  ctx.drawImage(source, 0, 0, canvas.width, canvas.height)

  return analyzeImageData(ctx.getImageData(0, 0, canvas.width, canvas.height))
}
