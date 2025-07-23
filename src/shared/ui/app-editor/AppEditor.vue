<script setup lang="ts">
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { onUnmounted, watch } from 'vue'
import { NButton, NSelect, type SelectOption, NIcon, NDropdown, NModal } from 'naive-ui'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import ImageResize from 'tiptap-extension-resize-image'
import type { DropdownMixedOption } from 'naive-ui/es/dropdown/src/interface'

import {
  Bold,
  Italic,
  Strikethrough,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  Unlink,
  List,
  ListNumbers,
  ArrowBackUp,
  ArrowForwardUp,
  ClearFormatting,
  Photo,
  Table as TableIcon,
  AlignLeft,
  AlignRight,
  AlignJustified,
  AlignCenter,
  Movie as _Movie
} from '@vicons/tabler'

interface Props {
  modelValue: string
}

const isMediaModal = ref(false)

const props = defineProps<Props>()
// const refHtml = ref(null)

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      bulletList: { HTMLAttributes: { class: 'bullet-list' } },
      orderedList: { HTMLAttributes: { class: 'order-list' } }
    }),
    Placeholder.configure({
      placeholder: 'Начните писать здесь..'
    }),
    Link.configure({ openOnClick: false }),
    Image.configure({ HTMLAttributes: { class: 'image-post' } }),
    Table.configure({
      HTMLAttributes: { class: 'table' },
      resizable: true
    }),
    TableRow,
    TableHeader,
    TableCell,
    Underline,
    TextAlign.configure({
      types: ['paragraph', 'heading', 'image']
    }),
    ImageResize
    // Youtube.configure({
    //   nocookie: true,
    //   controls: false,
    //   autoplay: false,
    //   width: 640,
    //   height: 480,
    //   HTMLAttributes: { class: 'video-post' }
    // })
  ],
  onUpdate: () => {
    emits('update:modelValue', editor.value ? editor.value.getHTML() : '')
  }
})

// const html = computed(() => editor.value?.getHTML())

watch(
  () => props.modelValue,
  (newVal: string) => {
    if (editor.value) {
      const isSame = editor.value.getHTML() === newVal
      if (isSame) return null

      editor.value.commands.setContent(newVal, false)
    }
  }
)

const textFormatValue = ref('paragraph')

const textFormatOptions: SelectOption[] = [
  {
    value: 'paragraph',
    label: 'Параграф'
  },
  {
    value: 'headingOne',
    label: 'Заголовок 1'
  },
  {
    value: 'headingTwo',
    label: 'Заголовок 2'
  },
  {
    value: 'headingThree',
    label: 'Заголовок 3'
  }
]

// Computed из-за того, что есть динамический параметр disabled
const optionsTable = computed<DropdownMixedOption[]>(() => {
  return [
    {
      label: 'Вставить таблицу',
      key: 'insertTable'
    },
    {
      label: 'Добавить колонку до',
      key: 'addColumnBefore',
      disabled: editor.value && !editor.value!.can().addColumnBefore()
    },
    {
      label: 'Добавить колонку после',
      key: 'addColumnAfter',
      disabled: editor.value && !editor.value!.can().addColumnAfter()
    },
    {
      label: 'Удалить колонку',
      key: 'deleteColumn',
      disabled: editor.value && !editor.value!.can().deleteColumn()
    },
    {
      label: 'Добавить строку до',
      key: 'addRowBefore',
      disabled: editor.value && !editor.value!.can().addRowBefore()
    },
    {
      label: 'Добавить строку после',
      key: 'addRowAfter',
      disabled: editor.value && !editor.value!.can().addRowAfter()
    },
    {
      label: 'Удалить строку',
      key: 'deleteRow',
      disabled: editor.value && !editor.value!.can().deleteRow()
    },
    {
      label: 'Удалить таблицу',
      key: 'deleteTable',
      disabled: editor.value && !editor.value!.can().deleteTable()
    }
  ]
})

const textFormatUpdateHandler = (value: string) => {
  textFormatValue.value = value
  if (!editor.value) {
    return null
  }
  switch (value) {
    case 'paragraph':
      editor.value.chain().focus().setParagraph().run()
      break
    case 'headingOne':
      editor.value.chain().focus().toggleHeading({ level: 1 }).run()
      break
    case 'headingTwo':
      editor.value.chain().focus().toggleHeading({ level: 2 }).run()
      break
    case 'headingThree':
      editor.value.chain().focus().toggleHeading({ level: 3 }).run()
      break
    default:
      editor.value.chain().focus().setParagraph().run()
      break
  }
}

const handleTableSelect = (key: string | number) => {
  if (!editor.value) {
    return null
  }

  switch (key) {
    case 'insertTable':
      editor.value.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
      break
    case 'addColumnBefore':
      editor.value.chain().focus().addColumnBefore().run()
      break
    case 'addColumnAfter':
      editor.value.chain().focus().addColumnAfter().run()
      break
    case 'deleteColumn':
      editor.value.chain().focus().deleteColumn().run()
      break
    case 'addRowBefore':
      editor.value.chain().focus().addRowBefore().run()
      break
    case 'addRowAfter':
      editor.value.chain().focus().addRowAfter().run()
      break
    case 'deleteRow':
      editor.value.chain().focus().deleteRow().run()
      break
    case 'deleteTable':
      editor.value.chain().focus().deleteTable().run()
      break
    default:
      break
  }
}

const setLink = () => {
  if (!editor.value) {
    return null
  }

  const previousUrl = editor.value.getAttributes('link').href
  const url = window.prompt('URL', previousUrl)

  if (url === null) {
    return null
  }

  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
    return null
  }
  editor.value
    .chain()
    .focus()
    .extendMarkRange('link')
    .setLink({ href: url, target: '_blank' })
    .run()
}

const toggleMediaModal = () => {
  isMediaModal.value = !isMediaModal.value
}

// TODO: Рефакторинг типа
const selectMedia = (media: {
  year: number
  monthNum: number
  month: string
  num: number
  regdate: string
  id: number
  imgPath: string
  fileName: string
  ext: string
  isImg: boolean
}) => {
  if (!editor.value) {
    return null
  }

  if (media && media.isImg) {
    editor.value.chain().focus().setImage({ src: media.imgPath, alt: media.fileName }).run()
  }
  isMediaModal.value = false
}

// TODO: Сделать модальное окно для вставки ссылок и добавление видео вместо браузерного Prompt
// const showLinkMoadal = ref(false)
// const linkValue = ref('')

// const _setYoutubeVideo = () => {
//   if (!editor.value) {
//     return null
//   }

//   const url = prompt('Введите ссылку на Youtube видео')

//   if (url === null) {
//     return null
//   }

//   editor.value.commands.setYoutubeVideo({ src: url })
// }

watchEffect(() => {
  if (!editor.value) return null
  if (editor.value.isActive('paragraph')) {
    textFormatValue.value = 'paragraph'
  }
  if (editor.value.isActive('heading', { level: 1 })) {
    textFormatValue.value = 'headingOne'
  }
  if (editor.value.isActive('heading', { level: 2 })) {
    textFormatValue.value = 'headingTwo'
  }
  if (editor.value.isActive('heading', { level: 3 })) {
    textFormatValue.value = 'headingThree'
  }
})

onUnmounted(() => {
  if (editor.value) editor.value.destroy()
})
</script>

<template>
  <div class="editor" v-if="editor">
    <div class="editor__menu">
      <n-button
        secondary
        size="small"
        style="padding-left: 8px; padding-right: 8px"
        :type="editor.isActive('bold') ? 'primary' : 'default'"
        @click="editor.chain().focus().toggleBold().run()"
        :disabled="!editor.can().chain().focus().toggleBold().run()"
      >
        <template #icon>
          <n-icon size="20px">
            <Bold />
          </n-icon>
        </template>
      </n-button>
      <n-button
        secondary
        size="small"
        :type="editor.isActive('italic') ? 'primary' : 'default'"
        style="padding-left: 8px; padding-right: 8px"
        @click="editor.chain().focus().toggleItalic().run()"
        :disabled="!editor.can().chain().focus().toggleItalic().run()"
      >
        <template #icon>
          <n-icon size="20px">
            <Italic />
          </n-icon>
        </template>
      </n-button>
      <n-button
        secondary
        size="small"
        :type="editor.isActive('strike') ? 'primary' : 'default'"
        style="padding-left: 8px; padding-right: 8px"
        @click="editor.chain().focus().toggleStrike().run()"
        :disabled="!editor.can().chain().focus().toggleStrike().run()"
      >
        <template #icon>
          <n-icon size="20px">
            <Strikethrough />
          </n-icon>
        </template>
      </n-button>

      <n-button
        secondary
        size="small"
        :type="editor.isActive('underline') ? 'primary' : 'default'"
        style="padding-left: 8px; padding-right: 8px"
        @click="editor.chain().focus().toggleUnderline().run()"
        :disabled="!editor.can().chain().focus().toggleUnderline().run()"
      >
        <template #icon>
          <n-icon size="20px">
            <UnderlineIcon />
          </n-icon>
        </template>
      </n-button>

      <n-select
        size="small"
        @update:value="textFormatUpdateHandler"
        :value="textFormatValue"
        :options="textFormatOptions"
        style="width: 130px"
      />

      <n-button
        secondary
        size="small"
        :type="editor.isActive('bulletList') ? 'primary' : 'default'"
        style="padding-left: 8px; padding-right: 8px"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        <template #icon>
          <n-icon size="20px">
            <List />
          </n-icon>
        </template>
      </n-button>
      <n-button
        secondary
        size="small"
        :type="editor.isActive('orderedList') ? 'primary' : 'default'"
        style="padding-left: 8px; padding-right: 8px"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        <template #icon>
          <n-icon size="20px">
            <ListNumbers />
          </n-icon>
        </template>
      </n-button>

      <n-button
        secondary
        size="small"
        @click="editor.chain().focus().undo().run()"
        style="padding-left: 8px; padding-right: 8px"
        :disabled="!editor.can().chain().focus().undo().run()"
      >
        <template #icon>
          <n-icon size="20px">
            <ArrowBackUp />
          </n-icon>
        </template>
      </n-button>

      <n-button
        secondary
        size="small"
        @click="editor.chain().focus().redo().run()"
        style="padding-left: 8px; padding-right: 8px"
        :disabled="!editor.can().chain().focus().redo().run()"
      >
        <template #icon>
          <n-icon size="20px">
            <ArrowForwardUp />
          </n-icon>
        </template>
      </n-button>
      <n-button
        secondary
        size="small"
        style="padding-left: 8px; padding-right: 8px"
        @click="editor.chain().focus().clearNodes().unsetAllMarks().run()"
      >
        <template #icon>
          <n-icon size="20px">
            <ClearFormatting />
          </n-icon> </template
      ></n-button>
      <n-button
        secondary
        size="small"
        style="padding-left: 8px; padding-right: 8px"
        :type="editor.isActive('link') ? 'primary' : 'default'"
        @click="setLink"
      >
        <template #icon>
          <n-icon size="20px">
            <LinkIcon />
          </n-icon>
        </template>
      </n-button>
      <n-button
        secondary
        size="small"
        @click="editor.chain().focus().unsetLink().run()"
        style="padding-left: 8px; padding-right: 8px"
        :disabled="!editor.isActive('link')"
      >
        <template #icon>
          <n-icon size="20px">
            <Unlink />
          </n-icon>
        </template>
      </n-button>

      <n-button
        secondary
        size="small"
        style="padding-left: 8px; padding-right: 8px"
        @click="toggleMediaModal"
      >
        <template #icon>
          <n-icon size="20px">
            <Photo />
          </n-icon>
        </template>
      </n-button>
      <n-dropdown
        trigger="click"
        :options="optionsTable"
        @select="handleTableSelect"
        :show-arrow="true"
      >
        <n-button secondary size="small" style="padding-left: 8px; padding-right: 8px">
          <template #icon>
            <n-icon size="20px">
              <TableIcon />
            </n-icon>
          </template>
        </n-button>
      </n-dropdown>
      <!-- Формат -->
      <n-button
        secondary
        size="small"
        :type="editor.isActive({ textAlign: 'left' }) ? 'primary' : 'default'"
        style="padding-left: 8px; padding-right: 8px"
        @click="editor.chain().focus().setTextAlign('left').run()"
        :disabled="!editor.can().chain().focus().setTextAlign('left').run()"
      >
        <template #icon>
          <n-icon size="20px">
            <AlignLeft />
          </n-icon>
        </template>
      </n-button>
      <n-button
        secondary
        size="small"
        :type="editor.isActive({ textAlign: 'center' }) ? 'primary' : 'default'"
        style="padding-left: 8px; padding-right: 8px"
        @click="editor.chain().focus().setTextAlign('center').run()"
        :disabled="!editor.can().chain().focus().setTextAlign('center').run()"
      >
        <template #icon>
          <n-icon size="20px">
            <AlignCenter />
          </n-icon>
        </template>
      </n-button>
      <n-button
        secondary
        size="small"
        :type="editor.isActive({ textAlign: 'right' }) ? 'primary' : 'default'"
        style="padding-left: 8px; padding-right: 8px"
        @click="editor.chain().focus().setTextAlign('right').run()"
        :disabled="!editor.can().chain().focus().setTextAlign('right').run()"
      >
        <template #icon>
          <n-icon size="20px">
            <AlignRight />
          </n-icon>
        </template>
      </n-button>
      <n-button
        secondary
        size="small"
        :type="editor.isActive({ textAlign: 'justify' }) ? 'primary' : 'default'"
        style="padding-left: 8px; padding-right: 8px"
        @click="editor.chain().focus().setTextAlign('justify').run()"
        :disabled="!editor.can().chain().focus().setTextAlign('justify').run()"
      >
        <template #icon>
          <n-icon size="20px">
            <AlignJustified />
          </n-icon>
        </template>
      </n-button>
      <!-- <n-button
        secondary
        size="small"
        style="padding-left: 8px; padding-right: 8px"
        @click="setYoutubeVideo"
      >
        <template #icon>
          <n-icon size="20px">
            <Movie />
          </n-icon>
        </template>
      </n-button> -->
    </div>
    <editor-content class="editor__content" :editor="editor" />
  </div>
  <Teleport to="body">
    <n-modal
      style="margin: 24px"
      title="Выберите изображение"
      size="huge"
      preset="card"
      :bordered="false"
      :show="isMediaModal"
      @close="toggleMediaModal"
    >
      <slot name="media-manager" :on-media-select="selectMedia"></slot>
      <!-- <media-list media-view-mode="select" @on-media-select="selectMediaHandler"></media-list> -->
    </n-modal>
    <!-- <media-select-modal
      :show="isMediaModal"
      @on-close="() => (isMediaModal = false)"
      @on-select="setImage"
    /> -->
  </Teleport>
</template>

<style lang="scss">
.editor {
  background-color: #fff;
  border: 1px solid #e3e3e3;
  border-radius: 0.75rem;
  color: #0d0d0d;
  display: flex;
  flex-direction: column;
  max-height: 40rem;
  width: 100%;

  &__menu {
    display: flex;
    gap: 0.25rem;
    padding: 0.5rem 0.5rem;
    flex-wrap: wrap;
    background-color: #f9fafb;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }

  &__content {
    flex: 1 1 auto;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 1.25rem 1rem;
    -webkit-overflow-scrolling: touch;
    min-height: 10rem;
  }
}

.ProseMirror-focudes {
  outline: none;
}
.ProseMirror:focus-visible {
  outline: none;
}

/* Basic editor styles */
.tiptap {
  > * + * {
    margin-top: 0.75em;
  }

  ul {
    list-style: disc;
  }

  ul ul {
    list-style: circle;
  }

  ol {
    list-style: decimal;
  }

  ul,
  ol {
    padding: 0.75rem 2rem;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.1;
  }

  code {
    background-color: rgba(#616161, 0.1);
    color: #616161;
  }

  pre {
    background: #0d0d0d;
    border-radius: 0.5rem;
    color: #fff;
    font-family: 'JetBrainsMono', monospace;
    padding: 0.75rem 1rem;

    code {
      background: none;
      color: inherit;
      font-size: 0.8rem;
      padding: 0;
    }
  }

  mark {
    background-color: #faf594;
  }

  img {
    height: auto;
    max-width: 100%;

    &.ProseMirror-selectednode {
      outline: 3px solid #68cef8;
    }
  }

  hr {
    margin: 1rem 0;
  }

  blockquote {
    border-left: 2px solid rgba(#0d0d0d, 0.1);
    padding-left: 1rem;
  }

  hr {
    border: none;
    border-top: 2px solid rgba(#0d0d0d, 0.1);
    margin: 2rem 0;
  }

  ul[data-type='taskList'] {
    list-style: none;
    padding: 0;

    li {
      align-items: center;
      display: flex;

      > label {
        flex: 0 0 auto;
        margin-right: 0.5rem;
        user-select: none;
      }

      > div {
        flex: 1 1 auto;
      }
    }
  }
  table {
    border-collapse: collapse;
    table-layout: fixed;
    width: 100%;
    margin: 0;
    overflow: hidden;

    td,
    th {
      min-width: 1em;
      border: 2px solid #ced4da;
      padding: 3px 5px;
      vertical-align: top;
      box-sizing: border-box;
      position: relative;

      > * {
        margin-bottom: 0;
      }
    }

    th {
      font-weight: bold;
      text-align: left;
      background-color: #f1f3f5;
    }

    .selectedCell:after {
      z-index: 2;
      position: absolute;
      content: '';
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background: rgba(200, 200, 255, 0.4);
      pointer-events: none;
    }

    .column-resize-handle {
      position: absolute;
      right: -2px;
      top: 0;
      bottom: -2px;
      width: 4px;
      background-color: #adf;
      pointer-events: none;
    }

    p {
      margin: 0;
    }
  }

  iframe {
    border: 8px solid #000;
    border-radius: 4px;
    min-width: 200px;
    min-height: 200px;
    display: block;
    outline: 0px solid transparent;
  }

  div[data-youtube-video] {
    cursor: move;
    padding-right: 24px;
  }

  .ProseMirror-selectednode iframe {
    transition: outline 0.15s;
    outline: 3px solid #68cef8;
  }
}

.tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #c2c2c2;
  pointer-events: none;
  height: 0;
}

.tableWrapper {
  padding: 1rem 0;
  overflow-x: auto;
}

.resize-cursor {
  cursor: ew-resize;
  cursor: col-resize;
}
</style>
