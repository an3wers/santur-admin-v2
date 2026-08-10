// Tiptap отдаёт html одной строкой, читать и править такой исходник неудобно.
// Форматирование только расставляет переносы между блочными тегами:
// текст и строчные теги не трогаются, поэтому содержание не меняется

const BLOCK_TAGS = new Set([
  'address',
  'article',
  'aside',
  'blockquote',
  'colgroup',
  'div',
  'figcaption',
  'figure',
  'footer',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hr',
  'iframe',
  'li',
  'main',
  'nav',
  'ol',
  'p',
  'pre',
  'section',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
  'ul'
])

// Теги без закрывающей пары — вложенность после них не растёт
const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
])

const INDENT = '  '

const getTagName = (tag: string) => tag.match(/^<\/?\s*([a-z][a-z\d-]*)/i)?.[1].toLowerCase() ?? ''

/**
 * Разбивает разметку на строки по блочным тегам и расставляет отступы
 */
export const formatHtml = (html: string): string => {
  const tokens = html.match(/<!--[\s\S]*?-->|<[^>]*>|[^<]+/g)

  if (!tokens) {
    return html.trim()
  }

  const lines: string[] = []
  // Открытые блочные теги и строки, в которых они начались
  const openBlocks: { tag: string; line: number }[] = []
  let depth = 0

  const openLine = (content: string) => {
    lines.push(INDENT.repeat(depth) + content)
  }

  const appendToLine = (content: string) => {
    if (!lines.length) {
      openLine(content)
      return
    }

    lines[lines.length - 1] += content
  }

  tokens.forEach((token) => {
    if (!token.startsWith('<') || token.startsWith('<!--')) {
      // Пробельные вставки между блоками при разборе игнорируются, убираем их
      if (!token.trim()) {
        return
      }

      appendToLine(token)
      return
    }

    const tag = getTagName(token)

    if (!BLOCK_TAGS.has(tag)) {
      appendToLine(token)
      return
    }

    if (token.startsWith('</')) {
      const opened = openBlocks.pop()

      depth = Math.max(0, depth - 1)

      // Блок целиком уместился в одной строке — оставляем его в ней
      if (opened && opened.tag === tag && opened.line === lines.length - 1) {
        appendToLine(token)
        return
      }

      openLine(token)
      return
    }

    openLine(token)

    if (!VOID_TAGS.has(tag) && !token.endsWith('/>')) {
      openBlocks.push({ tag, line: lines.length - 1 })
      depth += 1
    }
  })

  return lines.join('\n').trim()
}
