// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { findUnsupportedTags } from './html-support'

describe('findUnsupportedTags', () => {
  it('should return empty list for supported markup', () => {
    expect(findUnsupportedTags('<p>Текст</p><h2>Заголовок</h2>')).toEqual([])
    expect(findUnsupportedTags('<ul><li><p>раз</p></li></ul>')).toEqual([])
    expect(findUnsupportedTags('<img src="/a.jpg" alt="a">')).toEqual([])
    expect(
      findUnsupportedTags('<table><tbody><tr><td><p>ячейка</p></td></tr></tbody></table>')
    ).toEqual([])
  })

  it('should ignore iframe wrapper rendered by the editor', () => {
    expect(
      findUnsupportedTags('<div class="iframe-wrapper"><iframe src="https://a/b"></iframe></div>')
    ).toEqual([])
  })

  it('should return tags dropped by the editor schema', () => {
    expect(findUnsupportedTags('<div class="promo"><p>Текст</p></div>')).toEqual(['div'])
    expect(findUnsupportedTags('<section><span>Текст</span></section>')).toEqual([
      'section',
      'span'
    ])
  })

  it('should return each tag once', () => {
    expect(findUnsupportedTags('<div><p>1</p></div><div><p>2</p></div>')).toEqual(['div'])
  })
})
