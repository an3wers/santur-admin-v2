import { getDrawRect, type SquareTransform } from './square-geometry'

export const OUTPUT_QUALITY = 0.9

export function toJpegFileName(fileName: string) {
  const base = fileName.replace(/\.[^.]+$/, '') || 'image'
  return `${base}.jpg`
}

export async function renderSquareImage(options: {
  source: CanvasImageSource
  sourceWidth: number
  sourceHeight: number
  transform: SquareTransform
  size: number
  fileName: string
}): Promise<File> {
  const { source, sourceWidth, sourceHeight, transform, size, fileName } = options

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas недоступен')

  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, size, size)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  const rect = getDrawRect(transform, sourceWidth, sourceHeight, size)
  ctx.drawImage(source, rect.left, rect.top, rect.width, rect.height)

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', OUTPUT_QUALITY)
  )
  if (!blob) throw new Error('Не удалось подготовить изображение')

  return new File([blob], toJpegFileName(fileName), { type: 'image/jpeg' })
}
