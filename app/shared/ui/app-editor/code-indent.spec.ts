import { describe, expect, it } from 'vitest'
import { indentCode, outdentCode } from './code-indent'

// Применяет правку так же, как это делает textarea
const apply = (value: string, edit: { from: number; to: number; text: string } | null) =>
  edit ? value.slice(0, edit.from) + edit.text + value.slice(edit.to) : value

describe('indentCode', () => {
  it('should insert indent at caret position', () => {
    const edit = indentCode('<p></p>', 3, 3)

    expect(apply('<p></p>', edit)).toBe('<p>  </p>')
    expect(edit.selectionStart).toBe(5)
    expect(edit.selectionEnd).toBe(5)
  })

  it('should replace selection inside one line', () => {
    const edit = indentCode('<p>текст</p>', 3, 8)

    expect(apply('<p>текст</p>', edit)).toBe('<p>  </p>')
  })

  it('should shift every selected line', () => {
    const value = '<ul>\n<li>раз</li>\n<li>два</li>\n</ul>'
    const edit = indentCode(value, 5, 30)

    expect(apply(value, edit)).toBe('<ul>\n  <li>раз</li>\n  <li>два</li>\n</ul>')
    expect(edit.selectionStart).toBe(7)
    expect(edit.selectionEnd).toBe(34)
  })

  it('should not capture next line when selection ends with line break', () => {
    const value = '<p>раз</p>\n<p>два</p>'
    const edit = indentCode(value, 0, 11)

    expect(apply(value, edit)).toBe('  <p>раз</p>\n<p>два</p>')
  })
})

describe('outdentCode', () => {
  it('should remove indent of the current line', () => {
    const value = '  <p></p>'
    const edit = outdentCode(value, 9, 9)

    expect(apply(value, edit)).toBe('<p></p>')
    expect(edit?.selectionStart).toBe(7)
  })

  it('should remove tab character', () => {
    const value = '\t<p></p>'

    expect(apply(value, outdentCode(value, 8, 8))).toBe('<p></p>')
  })

  it('should shift every selected line', () => {
    const value = '<ul>\n  <li>раз</li>\n    <li>два</li>\n</ul>'
    const edit = outdentCode(value, 5, 36)

    expect(apply(value, edit)).toBe('<ul>\n<li>раз</li>\n  <li>два</li>\n</ul>')
  })

  it('should return null when there is no indent to remove', () => {
    expect(outdentCode('<p></p>', 0, 7)).toBeNull()
  })
})
