// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import { IdAttribute } from './id-extension'

const createEditor = (content: string) =>
  new Editor({
    content,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Table,
      TableRow,
      TableHeader,
      TableCell,
      IdAttribute
    ]
  })

const roundTrip = (html: string) => {
  const editor = createEditor(html)
  const result = editor.getHTML()
  editor.destroy()

  return result
}

describe('IdAttribute', () => {
  it('should keep id on text blocks', () => {
    expect(roundTrip('<p id="p1">параграф</p>')).toBe('<p id="p1">параграф</p>')
    expect(roundTrip('<h2 id="dostavka">Доставка</h2>')).toBe('<h2 id="dostavka">Доставка</h2>')
    expect(roundTrip('<blockquote id="q"><p>цитата</p></blockquote>')).toBe(
      '<blockquote id="q"><p>цитата</p></blockquote>'
    )
  })

  it('should keep id on lists', () => {
    expect(roundTrip('<ul id="list"><li id="li1"><p>раз</p></li></ul>')).toBe(
      '<ul id="list"><li id="li1"><p>раз</p></li></ul>'
    )
  })

  it('should keep id on links', () => {
    expect(roundTrip('<p><a id="anchor" href="https://a">ссылка</a></p>')).toContain('id="anchor"')
  })

  it('should keep id on table cells', () => {
    const result = roundTrip(
      '<table id="t"><tbody><tr id="tr1"><td id="td1"><p>ячейка</p></td></tr></tbody></table>'
    )

    expect(result).toContain('id="t"')
    expect(result).toContain('id="tr1"')
    expect(result).toContain('id="td1"')
  })

  it('should not add empty id to nodes without it', () => {
    expect(roundTrip('<p>без id</p>')).toBe('<p>без id</p>')
  })

  it('should keep id when only part of the document has it', () => {
    expect(roundTrip('<h2 id="a">A</h2><p id="b">B</p><p>C</p>')).toBe(
      '<h2 id="a">A</h2><p id="b">B</p><p>C</p>'
    )
  })
})
