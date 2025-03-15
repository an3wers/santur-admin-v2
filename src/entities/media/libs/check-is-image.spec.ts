import { describe, expect, it } from 'vitest'
import { checkIsImage } from './check-is-image'

describe('checkIsImage', () => {
  it('should return true for valid image extensions', () => {
    expect(checkIsImage('.jpg')).toBe(true)
    expect(checkIsImage('jpg')).toBe(true)
    expect(checkIsImage('.jpeg')).toBe(true)
    expect(checkIsImage('jpeg')).toBe(true)
    expect(checkIsImage('.png')).toBe(true)
    expect(checkIsImage('png')).toBe(true)
    expect(checkIsImage('.gif')).toBe(true)
    expect(checkIsImage('.svg')).toBe(true)
    expect(checkIsImage('.webp')).toBe(true)
    expect(checkIsImage('.JPG')).toBe(true)
    expect(checkIsImage('.JPEG')).toBe(true)
    expect(checkIsImage('JPEG')).toBe(true)
    expect(checkIsImage('.PNG')).toBe(true)
    expect(checkIsImage('.GIF')).toBe(true)
    expect(checkIsImage('.SVG')).toBe(true)
    expect(checkIsImage('.WEBP')).toBe(true)
  })

  it('should return false for invalid image extensions', () => {
    expect(checkIsImage('.txt')).toBe(false)
    expect(checkIsImage('.doc')).toBe(false)
    expect(checkIsImage('.pdf')).toBe(false)
  })
})
