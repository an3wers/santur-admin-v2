import ImageResize from 'tiptap-extension-resize-image'
import type { Attributes } from '@tiptap/core'

/**
 * ImageResize наследует @tiptap/extension-image, поэтому подключать Image отдельно нельзя:
 * узел image перехватывает разбор <img> и размер картинки теряется при загрузке html.
 *
 * Размер и выравнивание ImageResize хранит в своём атрибуте containerStyle, который
 * по умолчанию сериализуется в нестандартный containerstyle — его понимает только редактор.
 * Рендерим его в обычный style, чтобы размер сохранялся в html и был виден вне редактора.
 * wrapperStyle в html не пишем: это служебная обёртка редактора, при разборе
 * она восстанавливается из значения по умолчанию.
 */
export const ResizableImage = ImageResize.extend({
  addAttributes() {
    const attributes: Attributes = this.parent?.() ?? {}

    return {
      ...attributes,
      containerStyle: {
        ...attributes.containerStyle,
        renderHTML: (nodeAttributes) =>
          nodeAttributes.containerStyle ? { style: nodeAttributes.containerStyle } : {}
      },
      wrapperStyle: {
        ...attributes.wrapperStyle,
        renderHTML: () => ({})
      }
    }
  }
})
