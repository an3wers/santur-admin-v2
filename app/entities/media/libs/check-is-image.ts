export const checkIsImage = (extension: string) => {
  const validImageExtensions = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'svg',
    'webp',
    'JPG',
    'JPEG',
    'PNG',
    'GIF',
    'SVG',
    'WEBP'
  ]

  return validImageExtensions.some((ext) => ext === extension || ext === extension.slice(1))
}
