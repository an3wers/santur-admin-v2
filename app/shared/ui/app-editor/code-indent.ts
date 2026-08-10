// Отступы для редактора кода: вычисляют, какой фрагмент textarea заменить по Tab / Shift+Tab.
// Функции чистые — сам textarea меняет компонент, чтобы сохранить историю отмены

export const INDENT = '  '

export interface CodeEdit {
  /** Начало заменяемого фрагмента */
  from: number
  /** Конец заменяемого фрагмента */
  to: number
  /** Новый текст фрагмента */
  text: string
  /** Выделение после применения */
  selectionStart: number
  selectionEnd: number
}

/**
 * Границы строк, попавших в выделение
 */
const getLinesRange = (value: string, start: number, end: number) => {
  const from = start === 0 ? 0 : value.lastIndexOf('\n', start - 1) + 1

  // Выделение, оканчивающееся переводом строки, не захватывает следующую строку
  const lastChar = end > start && value[end - 1] === '\n' ? end - 1 : end
  const lineEnd = value.indexOf('\n', lastChar)

  return { from, to: lineEnd === -1 ? value.length : lineEnd }
}

/**
 * Количество символов отступа в начале строки, которые можно убрать
 */
const countIndent = (line: string) => {
  if (line.startsWith('\t')) {
    return 1
  }

  let count = 0
  while (count < INDENT.length && line[count] === ' ') {
    count++
  }

  return count
}

/**
 * Tab: вставляет отступ в позиции курсора либо сдвигает выделенные строки вправо
 */
export const indentCode = (value: string, start: number, end: number): CodeEdit => {
  // Выделение в пределах одной строки ведёт себя как обычный ввод
  if (!value.slice(start, end).includes('\n')) {
    const caret = start + INDENT.length

    return { from: start, to: end, text: INDENT, selectionStart: caret, selectionEnd: caret }
  }

  const { from, to } = getLinesRange(value, start, end)
  const block = value.slice(from, to)
  const text = block
    .split('\n')
    .map((line) => INDENT + line)
    .join('\n')

  return {
    from,
    to,
    text,
    selectionStart: start + INDENT.length,
    selectionEnd: end + text.length - block.length
  }
}

/**
 * Shift+Tab: сдвигает строки влево. Возвращает null, если убирать нечего
 */
export const outdentCode = (value: string, start: number, end: number): CodeEdit | null => {
  const { from, to } = getLinesRange(value, start, end)
  const lines = value.slice(from, to).split('\n')

  let position = from
  let removedBeforeStart = 0
  let removedBeforeEnd = 0
  let removedTotal = 0

  const text = lines
    .map((line) => {
      const removed = countIndent(line)

      removedBeforeStart += Math.min(removed, Math.max(0, start - position))
      removedBeforeEnd += Math.min(removed, Math.max(0, end - position))
      removedTotal += removed
      // +1 — перевод строки, разделявший строки блока
      position += line.length + 1

      return line.slice(removed)
    })
    .join('\n')

  if (!removedTotal) {
    return null
  }

  return {
    from,
    to,
    text,
    selectionStart: start - removedBeforeStart,
    selectionEnd: end - removedBeforeEnd
  }
}
