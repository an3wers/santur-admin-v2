// Теги, которые редактор умеет разбирать — соответствуют подключённым в AppEditor расширениям.
// Всё, чего нет в этом списке, tiptap молча выбрасывает при разборе html,
// поэтому перед применением разметки предупреждаем пользователя.
const SUPPORTED_TAGS = new Set([
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  's',
  'del',
  'u',
  'a',
  'code',
  'pre',
  'blockquote',
  'hr',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'img',
  'table',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'th',
  'td',
  'colgroup',
  'col',
  'iframe'
])

// Обёртку iframe рисует само расширение Iframe, при разборе она отбрасывается,
// но содержимое сохраняется — предупреждать о ней не нужно
const isIframeWrapper = (element: Element) =>
  element.tagName.toLowerCase() === 'div' && element.classList.contains('iframe-wrapper')

/**
 * Возвращает список тегов, которые редактор не сможет применить
 */
export const findUnsupportedTags = (html: string): string[] => {
  const body = new DOMParser().parseFromString(html, 'text/html').body
  const tags = new Set<string>()

  body.querySelectorAll('*').forEach((element) => {
    const tag = element.tagName.toLowerCase()

    if (SUPPORTED_TAGS.has(tag) || isIframeWrapper(element)) {
      return
    }

    tags.add(tag)
  })

  return [...tags]
}
