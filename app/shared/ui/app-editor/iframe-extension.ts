import { Node, mergeAttributes } from '@tiptap/core'

export interface IframeOptions {
  allowFullscreen: boolean
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    iframe: {
      setIframe: (options: { src: string; width?: number; height?: number }) => ReturnType
    }
  }
}

export const Iframe = Node.create<IframeOptions>({
  name: 'iframe',
  group: 'block',
  atom: true,

  addOptions() {
    return {
      allowFullscreen: true,
      HTMLAttributes: {
        class: 'iframe-wrapper'
      }
    }
  },

  addAttributes() {
    return {
      src: { default: null },
      width: { default: 640 },
      height: { default: 360 },
      frameborder: { default: 0 },
      allow: {
        default:
          'encrypted-media; fullscreen; picture-in-picture; clipboard-write; screen-wake-lock;'
      },
      allowfullscreen: { default: this.options.allowFullscreen },
      style: { default: 'border: none;' }
    }
  },

  parseHTML() {
    return [{ tag: 'iframe' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', this.options.HTMLAttributes, ['iframe', mergeAttributes(HTMLAttributes)]]
  },

  addCommands() {
    return {
      setIframe:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options
          })
        }
    }
  }
})
