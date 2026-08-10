<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { highlightText, type ShjLanguage } from '@speed-highlight/core'
import '@speed-highlight/core/themes/github-light.css'
import { indentCode, outdentCode, type CodeEdit } from './code-indent'

interface Props {
  modelValue: string
  language?: ShjLanguage
  placeholder?: string
  height?: string
  lineNumbers?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  language: 'html',
  placeholder: '',
  height: '22rem',
  lineNumbers: true
})

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const highlightRef = ref<HTMLPreElement | null>(null)
const gutterRef = ref<HTMLElement | null>(null)

const highlighted = ref('')

// Подсветка асинхронная, поэтому отбрасываем результаты устаревших вызовов
let highlightRequest = 0

const updateHighlight = async (code: string) => {
  const request = ++highlightRequest
  const result = await highlightText(code, props.language, false)

  if (request !== highlightRequest) {
    return
  }

  // Завершающий перевод строки, чтобы последняя строка совпадала с textarea
  highlighted.value = `${result}\n`
}

watch(
  () => [props.modelValue, props.language],
  () => updateHighlight(props.modelValue),
  { immediate: true }
)

const lineCount = computed(() => props.modelValue.split('\n').length)

// Подсветка и нумерация лежат отдельными слоями, их прокрутку ведёт textarea
const syncScroll = () => {
  const textarea = textareaRef.value

  if (!textarea) {
    return
  }

  if (highlightRef.value) {
    highlightRef.value.scrollTop = textarea.scrollTop
    highlightRef.value.scrollLeft = textarea.scrollLeft
  }

  if (gutterRef.value) {
    gutterRef.value.scrollTop = textarea.scrollTop
  }
}

const handleInput = (event: Event) => {
  emits('update:modelValue', (event.target as HTMLTextAreaElement).value)
}

const applyEdit = (edit: CodeEdit) => {
  const textarea = textareaRef.value

  if (!textarea) {
    return
  }

  textarea.setSelectionRange(edit.from, edit.to)

  // execCommand сохраняет историю отмены textarea, поэтому пробуем его первым
  const isInserted =
    edit.text && typeof document.execCommand === 'function'
      ? document.execCommand('insertText', false, edit.text)
      : false

  if (!isInserted) {
    textarea.setRangeText(edit.text, edit.from, edit.to, 'end')
  }

  textarea.setSelectionRange(edit.selectionStart, edit.selectionEnd)
  emits('update:modelValue', textarea.value)
}

const handleKeydown = (event: KeyboardEvent) => {
  const textarea = textareaRef.value

  if (!textarea || event.key !== 'Tab') {
    return
  }

  event.preventDefault()

  const { selectionStart, selectionEnd, value } = textarea
  const edit = event.shiftKey
    ? outdentCode(value, selectionStart, selectionEnd)
    : indentCode(value, selectionStart, selectionEnd)

  if (edit) {
    applyEdit(edit)
  }
}

const focus = () => {
  textareaRef.value?.focus()
}

defineExpose({ focus })
</script>

<template>
  <div class="code-editor" :style="{ '--code-editor-height': height }">
    <div v-if="lineNumbers" ref="gutterRef" class="code-editor__gutter" aria-hidden="true">
      <span v-for="line in lineCount" :key="line">{{ line }}</span>
    </div>
    <div class="code-editor__area">
      <!-- highlightText экранирует исходный код, в разметке остаются только теги подсветки -->
      <!-- eslint-disable vue/no-v-html -->
      <pre
        ref="highlightRef"
        class="code-editor__highlight"
        aria-hidden="true"
      ><code v-html="highlighted"></code></pre>
      <!-- eslint-enable vue/no-v-html -->
      <textarea
        ref="textareaRef"
        class="code-editor__input"
        :value="modelValue"
        :placeholder="placeholder"
        spellcheck="false"
        autocapitalize="off"
        autocomplete="off"
        autocorrect="off"
        wrap="off"
        @input="handleInput"
        @keydown="handleKeydown"
        @scroll="syncScroll"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.code-editor {
  // Слой подсветки и textarea должны совпадать по метрике до пикселя
  --code-editor-font:
    13px / 1.5 'JetBrainsMono', ui-monospace, Menlo, Consolas, 'Courier New', monospace;
  --code-editor-padding-y: 0.75rem;
  --code-editor-padding-x: 0.75rem;

  display: flex;
  align-items: stretch;
  height: var(--code-editor-height);
  background-color: #fff;
  border: 1px solid #dadce3;
  border-radius: 6px;
  overflow: hidden;

  &:focus-within {
    border-color: #36ad6a;
  }

  &__gutter {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    padding: var(--code-editor-padding-y) 0.5rem;
    font: var(--code-editor-font);
    color: #b6bac2;
    text-align: right;
    background-color: #fafafa;
    border-right: 1px solid #eceef2;
    overflow: hidden;
    user-select: none;
  }

  &__area {
    position: relative;
    flex: 1 1 auto;
    min-width: 0;
  }

  &__highlight,
  &__input {
    position: absolute;
    inset: 0;
    box-sizing: border-box;
    margin: 0;
    padding: var(--code-editor-padding-y) var(--code-editor-padding-x);
    border: 0;
    font: var(--code-editor-font);
    tab-size: 2;
    white-space: pre;
    word-wrap: normal;
    background-color: transparent;
  }

  &__highlight {
    color: #24292f;
    overflow: hidden;
    pointer-events: none;

    code {
      font: inherit;
      background: none;
      padding: 0;
    }
  }

  &__input {
    resize: none;
    overflow: auto;
    outline: none;
    // Текст рисует слой подсветки, textarea остаётся прозрачной
    color: transparent;
    caret-color: #0d0d0d;

    &::placeholder {
      color: #c2c2c2;
    }

    &::selection {
      background-color: rgba(59, 130, 246, 0.25);
    }
  }
}
</style>
