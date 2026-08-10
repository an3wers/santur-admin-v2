// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { ResizableImage } from './image-extension'

const createEditor = (content = '') =>
  new Editor({
    content,
    extensions: [StarterKit, ResizableImage.configure({ HTMLAttributes: { class: 'image-post' } })]
  })

describe('ResizableImage', () => {
  it('should insert image as resizable node', () => {
    const editor = createEditor()
    editor.commands.setImage({ src: '/media/a.jpg', alt: 'a' })

    const [node] = editor.getJSON().content ?? []

    expect(node?.type).toBe('imageResize')
    editor.destroy()
  })

  it('should parse img back to resizable node', () => {
    const editor = createEditor('<img class="image-post" src="/media/a.jpg" alt="a">')

    const [node] = editor.getJSON().content ?? []

    expect(node?.type).toBe('imageResize')
    editor.destroy()
  })

  it('should keep image size in html', () => {
    const editor = createEditor(
      '<img class="image-post" src="/media/a.jpg" alt="a" style="width: 320px; height: auto;">'
    )

    expect(editor.getHTML()).toContain('width: 320px')
    editor.destroy()
  })

  it('should keep image size after html round trip', () => {
    const source = createEditor()
    source.commands.setImage({ src: '/media/a.jpg', alt: 'a' })
    source.commands.updateAttributes('imageResize', {
      containerStyle: 'width: 320px; height: auto; margin: 0 auto;'
    })

    const html = source.getHTML()
    const restored = createEditor(html)

    expect(restored.getHTML()).toBe(html)
    expect(restored.getHTML()).toContain('width: 320px')
    expect(restored.getHTML()).toContain('margin: 0px auto')

    source.destroy()
    restored.destroy()
  })

  it('should read size from legacy containerstyle attribute', () => {
    const editor = createEditor(
      '<img class="image-post" src="/media/a.jpg" containerstyle="width: 320px; height: auto;" wrapperstyle="display: flex; margin: 0;">'
    )

    expect(editor.getHTML()).toBe(
      '<img class="image-post" src="/media/a.jpg" style="width: 320px; height: auto;">'
    )
    editor.destroy()
  })

  it('should read size from legacy width attribute', () => {
    const editor = createEditor('<img class="image-post" src="/media/a.jpg" width="320">')

    expect(editor.getHTML()).toContain('width: 320px')
    editor.destroy()
  })
})
