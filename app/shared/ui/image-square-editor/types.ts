import type { SquareTransform } from './square-geometry'

export type { SquareTransform }

export type ImageSquareEditorResult = {
  file: File
  sourceFile: File
  transform: SquareTransform
}
