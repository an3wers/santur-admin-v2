import { Extension } from '@tiptap/core'

export interface IdAttributeOptions {
  /** Узлы и марки, которым разрешён атрибут id */
  types: string[]
}

/**
 * Tiptap разбирает html по схеме: атрибут, который не описан ни в одном расширении,
 * при разборе выбрасывается. Расширение добавляет id в схему нужным узлам,
 * чтобы разметку с якорями (<h2 id="dostavka">) можно было задать через модалку html
 * и она сохранялась при сериализации.
 */
export const IdAttribute = Extension.create<IdAttributeOptions>({
  name: 'idAttribute',

  addOptions() {
    return {
      types: [
        'paragraph',
        'heading',
        'blockquote',
        'bulletList',
        'orderedList',
        'listItem',
        'codeBlock',
        'horizontalRule',
        'table',
        'tableRow',
        'tableHeader',
        'tableCell',
        'imageResize',
        'iframe',
        'link'
      ]
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          id: {
            default: null,
            parseHTML: (element) => element.getAttribute('id'),
            renderHTML: (attributes) => (attributes.id ? { id: attributes.id } : {})
          }
        }
      }
    ]
  }
})
