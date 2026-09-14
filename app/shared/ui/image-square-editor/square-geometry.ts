/*
  Геометрия вписывания изображения в квадратный кадр.
  Все величины нормализованы: сторона кадра = 1.
  zoom = 1 — изображение вписано целиком (длинная сторона = стороне кадра).
  x / y — смещение центра изображения от центра кадра.
*/

export type SquareTransform = {
  zoom: number
  x: number
  y: number
}

export type AlignPosition = -1 | 0 | 1

export const MIN_ZOOM = 0.5
export const DEFAULT_MAX_ZOOM = 3

const EPSILON = 1e-6

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

export function getDrawSize(width: number, height: number, zoom: number) {
  const base = 1 / Math.max(width, height)

  return { dw: width * base * zoom, dh: height * base * zoom }
}

export function getFillZoom(width: number, height: number) {
  return Math.max(width, height) / Math.min(width, height)
}

export function getZoomRange(width: number, height: number) {
  return { min: MIN_ZOOM, max: Math.max(DEFAULT_MAX_ZOOM, getFillZoom(width, height)) }
}

// Меньше кадра — изображение не выходит за кадр, больше — по оси не появляются поля
export function getOffsetLimit(size: number) {
  return Math.abs(size - 1) / 2
}

export function clampTransform(t: SquareTransform, width: number, height: number): SquareTransform {
  const range = getZoomRange(width, height)
  const zoom = clamp(t.zoom, range.min, range.max)
  const { dw, dh } = getDrawSize(width, height, zoom)
  const limitX = getOffsetLimit(dw)
  const limitY = getOffsetLimit(dh)

  return {
    zoom,
    x: clamp(t.x, -limitX, limitX),
    y: clamp(t.y, -limitY, limitY)
  }
}

export function fitTransform(): SquareTransform {
  return { zoom: 1, x: 0, y: 0 }
}

export function fillTransform(width: number, height: number): SquareTransform {
  return { zoom: getFillZoom(width, height), x: 0, y: 0 }
}

// -1 — прижать к левому/верхнему краю кадра, 1 — к правому/нижнему
const alignOffset = (size: number, position: AlignPosition) => (-position * (size - 1)) / 2

export function alignTransform(
  t: SquareTransform,
  width: number,
  height: number,
  col: AlignPosition,
  row: AlignPosition
): SquareTransform {
  const { zoom } = clampTransform(t, width, height)
  const { dw, dh } = getDrawSize(width, height, zoom)

  return { zoom, x: alignOffset(dw, col), y: alignOffset(dh, row) }
}

const POSITIONS: AlignPosition[] = [0, -1, 1]

function findPosition(offset: number, size: number) {
  return POSITIONS.find((p) => Math.abs(alignOffset(size, p) - offset) < EPSILON) ?? null
}

export function getAlignPosition(t: SquareTransform, width: number, height: number) {
  const { dw, dh } = getDrawSize(width, height, t.zoom)

  return { col: findPosition(t.x, dw), row: findPosition(t.y, dh) }
}

export function getDrawRect(t: SquareTransform, width: number, height: number, size: number) {
  const { dw, dh } = getDrawSize(width, height, t.zoom)

  return {
    left: (0.5 + t.x - dw / 2) * size,
    top: (0.5 + t.y - dh / 2) * size,
    width: dw * size,
    height: dh * size
  }
}

// Доля кадра по каждой оси, не покрытая изображением (белые поля)
export function getWhiteFill(t: SquareTransform, width: number, height: number) {
  const { dw, dh } = getDrawSize(width, height, t.zoom)

  const uncovered = (offset: number, size: number) => {
    const start = 0.5 + offset - size / 2
    const overlap = Math.min(1, start + size) - Math.max(0, start)
    return clamp(1 - overlap, 0, 1)
  }

  return { x: uncovered(t.x, dw), y: uncovered(t.y, dh) }
}
