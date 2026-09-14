// @vitest-environment node
import { describe, expect, it } from 'vitest'
import {
  alignTransform,
  clampTransform,
  fillTransform,
  fitTransform,
  getAlignPosition,
  getDrawRect,
  getWhiteFill,
  getZoomRange
} from './square-geometry'

describe('getDrawRect', () => {
  it('should fit landscape image with bars top and bottom', () => {
    const rect = getDrawRect(fitTransform(), 1600, 800, 500)

    expect(rect).toEqual({ left: 0, top: 125, width: 500, height: 250 })
  })

  it('should fit portrait image with bars left and right', () => {
    const rect = getDrawRect(fitTransform(), 800, 1600, 500)

    expect(rect).toEqual({ left: 125, top: 0, width: 250, height: 500 })
  })

  it('should cover the frame on fill', () => {
    const rect = getDrawRect(fillTransform(1600, 800), 1600, 800, 500)

    expect(rect).toEqual({ left: -250, top: 0, width: 1000, height: 500 })
  })
})

describe('getZoomRange', () => {
  it('should extend max zoom to fill for extreme ratios', () => {
    expect(getZoomRange(1000, 1000).max).toBe(3)
    expect(getZoomRange(4000, 1000).max).toBe(4)
  })
})

describe('clampTransform', () => {
  it('should keep smaller image inside the frame', () => {
    const t = clampTransform({ zoom: 1, x: 1, y: 1 }, 1600, 800)

    expect(t.x).toBe(0)
    expect(t.y).toBe(0.25)
  })

  it('should not allow white bars when image is larger than frame', () => {
    const t = clampTransform({ zoom: 2, x: -5, y: 0 }, 1600, 800)

    expect(t.x).toBe(-0.5)
  })

  it('should clamp zoom to range', () => {
    expect(clampTransform({ zoom: 0.1, x: 0, y: 0 }, 100, 100).zoom).toBe(0.5)
    expect(clampTransform({ zoom: 10, x: 0, y: 0 }, 100, 100).zoom).toBe(3)
  })
})

describe('alignTransform', () => {
  it('should snap smaller image to top left corner', () => {
    const t = alignTransform(fitTransform(), 1600, 800, -1, -1)
    const rect = getDrawRect(t, 1600, 800, 100)

    expect(rect.left).toBeCloseTo(0)
    expect(rect.top).toBeCloseTo(0)
  })

  it('should show right edge of larger image when aligned right', () => {
    const t = alignTransform(fillTransform(1600, 800), 1600, 800, 1, 0)
    const rect = getDrawRect(t, 1600, 800, 100)

    expect(rect.left + rect.width).toBeCloseTo(100)
  })

  it('should be detected back by getAlignPosition', () => {
    const t = alignTransform({ zoom: 0.8, x: 0, y: 0 }, 1000, 600, 1, -1)

    expect(getAlignPosition(t, 1000, 600)).toEqual({ col: 1, row: -1 })
  })

  it('should return null position for free offset', () => {
    expect(getAlignPosition({ zoom: 0.5, x: 0.1, y: 0 }, 1000, 1000)).toEqual({
      col: null,
      row: 0
    })
  })
})

describe('getWhiteFill', () => {
  it('should report white bars for fitted image', () => {
    expect(getWhiteFill(fitTransform(), 1600, 800)).toEqual({ x: 0, y: 0.5 })
  })

  it('should report no bars when filled', () => {
    expect(getWhiteFill(fillTransform(1600, 800), 1600, 800)).toEqual({ x: 0, y: 0 })
  })
})
