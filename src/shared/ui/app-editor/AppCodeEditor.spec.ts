// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import AppCodeEditor from './AppCodeEditor.vue'

// Подсветка асинхронная, ждём её результата
const flush = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0))
  await nextTick()
}

describe('AppCodeEditor', () => {
  it('should highlight source markup', async () => {
    const wrapper = mount(AppCodeEditor, { props: { modelValue: '<p class="a">текст</p>' } })
    await flush()

    const highlight = wrapper.get('.code-editor__highlight')

    expect(highlight.html()).toContain('shj-syn-var')
    expect(highlight.html()).toContain('shj-syn-class')
    // Исходный код экранирован: в слое подсветки только теги подсветки,
    // а текст совпадает с исходником
    expect(highlight.findAll('p')).toHaveLength(0)
    expect((highlight.element as HTMLElement).textContent).toBe('<p class="a">текст</p>\n')
  })

  it('should render a line number for every line', async () => {
    const wrapper = mount(AppCodeEditor, {
      props: { modelValue: '<p>раз</p>\n<p>два</p>\n<p>три</p>' }
    })

    expect(wrapper.findAll('.code-editor__gutter span')).toHaveLength(3)
  })

  it('should emit value on input', async () => {
    const wrapper = mount(AppCodeEditor, { props: { modelValue: '<p></p>' } })
    const textarea = wrapper.get('.code-editor__input')

    ;(textarea.element as HTMLTextAreaElement).value = '<p>раз</p>'
    await textarea.trigger('input')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['<p>раз</p>'])
  })

  it('should indent selected lines by Tab', async () => {
    const wrapper = mount(AppCodeEditor, {
      props: { modelValue: '<p>раз</p>\n<p>два</p>' },
      attachTo: document.body
    })
    const textarea = wrapper.get('.code-editor__input')
    const element = textarea.element as HTMLTextAreaElement

    element.setSelectionRange(0, element.value.length)
    await textarea.trigger('keydown', { key: 'Tab' })

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['  <p>раз</p>\n  <p>два</p>'])
  })

  it('should outdent selected lines by Shift+Tab', async () => {
    const wrapper = mount(AppCodeEditor, {
      props: { modelValue: '  <p>раз</p>\n  <p>два</p>' },
      attachTo: document.body
    })
    const textarea = wrapper.get('.code-editor__input')
    const element = textarea.element as HTMLTextAreaElement

    element.setSelectionRange(0, element.value.length)
    await textarea.trigger('keydown', { key: 'Tab', shiftKey: true })

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['<p>раз</p>\n<p>два</p>'])
  })
})
