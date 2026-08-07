import { describe, expect, it } from 'vitest'
import { formatHtml } from './html-format'

describe('formatHtml', () => {
  it('should put every block tag on its own line', () => {
    expect(formatHtml('<p>раз</p><p>два</p>')).toBe('<p>раз</p>\n<p>два</p>')
  })

  it('should keep inline tags in place', () => {
    expect(formatHtml('<p>Привет <strong>мир</strong>, <a href="/a">ссылка</a></p>')).toBe(
      '<p>Привет <strong>мир</strong>, <a href="/a">ссылка</a></p>'
    )
  })

  it('should indent nested blocks', () => {
    expect(formatHtml('<ul><li><p>раз</p></li><li><p>два</p></li></ul>')).toBe(
      [
        '<ul>',
        '  <li>',
        '    <p>раз</p>',
        '  </li>',
        '  <li>',
        '    <p>два</p>',
        '  </li>',
        '</ul>'
      ].join('\n')
    )
  })

  it('should not increase depth after void tags', () => {
    expect(formatHtml('<p>раз</p><hr><p>два</p>')).toBe('<p>раз</p>\n<hr>\n<p>два</p>')
    expect(formatHtml('<p><img src="/a.jpg">текст</p>')).toBe('<p><img src="/a.jpg">текст</p>')
  })

  it('should format table markup', () => {
    expect(formatHtml('<table><tbody><tr><td><p>ячейка</p></td></tr></tbody></table>')).toBe(
      [
        '<table>',
        '  <tbody>',
        '    <tr>',
        '      <td>',
        '        <p>ячейка</p>',
        '      </td>',
        '    </tr>',
        '  </tbody>',
        '</table>'
      ].join('\n')
    )
  })

  it('should keep iframe wrapper markup', () => {
    expect(
      formatHtml('<div class="iframe-wrapper"><iframe src="https://a/b"></iframe></div>')
    ).toBe(
      ['<div class="iframe-wrapper">', '  <iframe src="https://a/b"></iframe>', '</div>'].join('\n')
    )
  })

  it('should return empty string for empty markup', () => {
    expect(formatHtml('')).toBe('')
  })
})
