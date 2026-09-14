// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { analyzeImageData } from './analyze-image'

type Rgba = [number, number, number, number]

function createPixels(width: number, height: number, pixel: (x: number, y: number) => Rgba) {
  const data = new Uint8ClampedArray(width * height * 4)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      data.set(pixel(x, y), (y * width + x) * 4)
    }
  }

  return { data, width, height }
}

const WHITE: Rgba = [255, 255, 255, 255]
const RED: Rgba = [200, 20, 20, 255]

const isEdge = (x: number, y: number, size: number) =>
  x === 0 || y === 0 || x === size - 1 || y === size - 1

describe('analyzeImageData', () => {
  it('should detect white background with colored content inside', () => {
    const pixels = createPixels(10, 10, (x, y) => (isEdge(x, y, 10) ? WHITE : RED))

    expect(analyzeImageData(pixels)).toEqual({ hasTransparency: false, isWhiteBackground: true })
  })

  it('should detect colored background', () => {
    const pixels = createPixels(10, 10, () => RED)

    expect(analyzeImageData(pixels).isWhiteBackground).toBe(false)
  })

  it('should tolerate a few non-white edge pixels', () => {
    const pixels = createPixels(20, 20, (x, y) => (x === 0 && y === 0 ? RED : WHITE))

    expect(analyzeImageData(pixels).isWhiteBackground).toBe(true)
  })

  it('should treat transparent edges as white after flattening', () => {
    const pixels = createPixels(10, 10, (x, y) => (isEdge(x, y, 10) ? [0, 0, 0, 0] : RED))

    expect(analyzeImageData(pixels)).toEqual({ hasTransparency: true, isWhiteBackground: true })
  })
})
