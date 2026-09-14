<script setup lang="ts">
import { NModal, NButton, NSlider, NIcon, NText, useThemeVars } from 'naive-ui'
import { AlertTriangle, Check, InfoCircle } from '@vicons/tabler'
import {
  alignTransform,
  clampTransform,
  fillTransform,
  fitTransform,
  getAlignPosition,
  getDrawRect,
  getFillZoom,
  getWhiteFill,
  getZoomRange,
  type AlignPosition,
  type SquareTransform
} from './square-geometry'
import { analyzeImage, type ImageAnalysis } from './analyze-image'
import { renderSquareImage } from './render-square-image'
import type { ImageSquareEditorResult } from './types'

const props = withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    outputSize?: number
    maxFileSize?: number
    initialFile?: File | null
    initialTransform?: SquareTransform | null
  }>(),
  {
    title: 'Подготовка изображения',
    subtitle: '',
    outputSize: 500,
    maxFileSize: 20_000_000,
    initialFile: null,
    initialTransform: null
  }
)

const show = defineModel<boolean>('show', { default: false })

const emits = defineEmits<{
  (e: 'apply', value: ImageSquareEditorResult): void
}>()

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ZOOM_STEP = 1.1

const themeVars = useThemeVars()

// Модалка телепортируется, поэтому переменные темы задаём inline, а не через CSS v-bind
const cssVars = computed(() => ({
  '--ise-border': themeVars.value.borderColor,
  '--ise-action': themeVars.value.actionColor,
  '--ise-primary': themeVars.value.primaryColor,
  '--ise-text-3': themeVars.value.textColor3,
  '--ise-divider': themeVars.value.dividerColor,
  '--ise-hover': themeVars.value.hoverColor
}))

const fileInputRef = ref<HTMLInputElement | null>(null)
const stageRef = ref<HTMLElement | null>(null)

const sourceFile = shallowRef<File | null>(null)
const sourceUrl = ref('')
const sourceImage = shallowRef<HTMLImageElement | null>(null)
const transform = ref<SquareTransform>(fitTransform())
const analysis = ref<ImageAnalysis | null>(null)
const error = ref('')
const isDragOver = ref(false)
const isApplying = ref(false)

let loadToken = 0

const width = computed(() => sourceImage.value?.naturalWidth ?? 0)
const height = computed(() => sourceImage.value?.naturalHeight ?? 0)
const isLoaded = computed(() => sourceImage.value !== null)

/*
  ЗАГРУЗКА ИСХОДНИКА
*/

function releaseSource() {
  if (sourceUrl.value) URL.revokeObjectURL(sourceUrl.value)
  sourceUrl.value = ''
  sourceImage.value = null
  sourceFile.value = null
  analysis.value = null
}

function reset() {
  loadToken++
  releaseSource()
  transform.value = fitTransform()
  error.value = ''
  isDragOver.value = false
  isApplying.value = false
}

async function loadFile(file: File, initial?: SquareTransform | null) {
  error.value = ''

  if (!ACCEPTED_TYPES.includes(file.type)) {
    error.value = 'Поддерживаются JPG, PNG и WebP'
    return
  }

  if (file.size > props.maxFileSize) {
    error.value = `Максимальный размер изображения ${formatMb(props.maxFileSize)}`
    return
  }

  const token = ++loadToken
  const url = URL.createObjectURL(file)
  const img = new Image()
  img.src = url

  try {
    await img.decode()
  } catch {
    URL.revokeObjectURL(url)
    if (token === loadToken) error.value = 'Не удалось прочитать изображение'
    return
  }

  if (token !== loadToken) {
    URL.revokeObjectURL(url)
    return
  }

  releaseSource()
  sourceFile.value = file
  sourceUrl.value = url
  sourceImage.value = img
  transform.value = clampTransform(initial ?? fitTransform(), img.naturalWidth, img.naturalHeight)
  analysis.value = analyzeImage(img, img.naturalWidth, img.naturalHeight)
}

watch(show, (value) => {
  if (!value) return

  reset()
  if (props.initialFile) loadFile(props.initialFile, props.initialTransform)
})

onBeforeUnmount(reset)

function openFileDialog() {
  fileInputRef.value?.click()
}

function fileInputHandler(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) loadFile(file)
}

function dropHandler(event: DragEvent) {
  isDragOver.value = false
  if (isApplying.value) return

  const file = event.dataTransfer?.files[0]
  if (file) loadFile(file)
}

/*
  ТРАНСФОРМАЦИЯ
*/

function setTransform(value: SquareTransform) {
  transform.value = clampTransform(value, width.value, height.value)
}

const zoomRange = computed(() => getZoomRange(width.value || 1, height.value || 1))
const zoomPercent = computed(() => Math.round(transform.value.zoom * 100))

function zoomHandler(percent: number) {
  setTransform({ ...transform.value, zoom: percent / 100 })
}

function wheelHandler(event: WheelEvent) {
  if (!isLoaded.value || isApplying.value) return

  const factor = event.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP
  setTransform({ ...transform.value, zoom: transform.value.zoom * factor })
}

const isFit = computed(() => Math.abs(transform.value.zoom - 1) < 0.005)
const isFill = computed(
  () =>
    isLoaded.value &&
    Math.abs(transform.value.zoom - getFillZoom(width.value, height.value)) < 0.005
)

function fitHandler() {
  setTransform(fitTransform())
}

function fillHandler() {
  setTransform(fillTransform(width.value, height.value))
}

const ALIGN_CELLS = ([-1, 0, 1] as AlignPosition[]).flatMap((row) =>
  ([-1, 0, 1] as AlignPosition[]).map((col) => ({ col, row }))
)

const alignPosition = computed(() =>
  isLoaded.value ? getAlignPosition(transform.value, width.value, height.value) : null
)

function alignHandler(col: AlignPosition, row: AlignPosition) {
  transform.value = alignTransform(transform.value, width.value, height.value, col, row)
}

let dragStart: { pointerX: number; pointerY: number; transform: SquareTransform } | null = null

function pointerDownHandler(event: PointerEvent) {
  if (!isLoaded.value || isApplying.value || event.button !== 0) return

  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  dragStart = { pointerX: event.clientX, pointerY: event.clientY, transform: transform.value }
}

function pointerMoveHandler(event: PointerEvent) {
  const stage = stageRef.value
  if (!dragStart || !stage) return

  const size = stage.clientWidth
  setTransform({
    ...dragStart.transform,
    x: dragStart.transform.x + (event.clientX - dragStart.pointerX) / size,
    y: dragStart.transform.y + (event.clientY - dragStart.pointerY) / size
  })
}

function pointerUpHandler() {
  dragStart = null
}

const imageStyle = computed(() => {
  const rect = getDrawRect(transform.value, width.value, height.value, 100)

  return {
    left: `${rect.left}%`,
    top: `${rect.top}%`,
    width: `${rect.width}%`,
    height: `${rect.height}%`
  }
})

const whiteFill = computed(() => {
  const fill = getWhiteFill(transform.value, width.value, height.value)
  return `${Math.round(fill.x * 100)}% · ${Math.round(fill.y * 100)}%`
})

/*
  ПРОВЕРКИ
*/

function formatMb(bytes: number) {
  return `${(bytes / 1_000_000).toFixed(1)} МБ`
}

const sourceType = computed(() => sourceFile.value?.type.replace('image/', '').toUpperCase() ?? '')

const checks = computed(() => {
  if (!isLoaded.value) return []

  const longSide = Math.max(width.value, height.value)
  const result: { ok: boolean; text: string }[] = [
    longSide >= props.outputSize
      ? { ok: true, text: `${longSide} px — не меньше ${props.outputSize} px` }
      : {
          ok: false,
          text: `${longSide} px — меньше ${props.outputSize} px, изображение будет растянуто`
        }
  ]

  if (analysis.value) {
    result.push(
      analysis.value.isWhiteBackground
        ? { ok: true, text: 'Фон белый' }
        : { ok: false, text: 'Фон по краям не белый' }
    )

    if (analysis.value.hasTransparency) {
      result.push({ ok: false, text: 'Есть прозрачность — будет залита белым' })
    }
  }

  return result
})

const warningsCount = computed(() => checks.value.filter((c) => !c.ok).length)

const footerStatus = computed(() => {
  if (!isLoaded.value) return 'Ожидание файла'
  if (warningsCount.value === 0) return 'Все проверки пройдены'
  return `Предупреждений: ${warningsCount.value}`
})

/*
  ПРИМЕНЕНИЕ
*/

async function applyHandler() {
  if (!sourceImage.value || !sourceFile.value) return

  isApplying.value = true

  try {
    const file = await renderSquareImage({
      source: sourceImage.value,
      sourceWidth: width.value,
      sourceHeight: height.value,
      transform: transform.value,
      size: props.outputSize,
      fileName: sourceFile.value.name
    })

    emits('apply', { file, sourceFile: sourceFile.value, transform: { ...transform.value } })
    show.value = false
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось подготовить изображение'
  } finally {
    isApplying.value = false
  }
}
</script>

<template>
  <n-modal
    v-model:show="show"
    preset="card"
    class="image-square-editor"
    :mask-closable="!isApplying"
    :closable="!isApplying"
    :bordered="false"
    :segmented="{ content: true, footer: true }"
    @after-leave="reset"
  >
    <template #header>
      <div class="image-square-editor__title">{{ title }}</div>
      <n-text v-if="subtitle" depth="3" class="image-square-editor__subtitle">
        {{ subtitle }}
      </n-text>
    </template>

    <input
      ref="fileInputRef"
      type="file"
      :accept="ACCEPTED_TYPES.join(',')"
      hidden
      @change="fileInputHandler"
    />

    <div class="image-square-editor__body" :style="cssVars">
      <div class="image-square-editor__main">
        <div
          v-if="!isLoaded"
          class="image-square-editor__stage image-square-editor__stage--drop"
          :class="{ 'is-drag-over': isDragOver }"
          @dragover.prevent="isDragOver = true"
          @dragleave="isDragOver = false"
          @drop.prevent="dropHandler"
        >
          <div class="image-square-editor__drop">
            <n-text depth="2">Перетащите изображение сюда</n-text>
            <n-text depth="3">или</n-text>
            <n-button secondary @click="openFileDialog">Выбрать файл</n-button>
          </div>
        </div>

        <div
          v-else
          ref="stageRef"
          class="image-square-editor__stage"
          :class="{ 'is-locked': isApplying }"
          @pointerdown="pointerDownHandler"
          @pointermove="pointerMoveHandler"
          @pointerup="pointerUpHandler"
          @pointercancel="pointerUpHandler"
          @wheel.prevent="wheelHandler"
          @dragover.prevent
          @drop.prevent="dropHandler"
        >
          <img
            :src="sourceUrl"
            alt=""
            draggable="false"
            class="image-square-editor__image"
            :style="imageStyle"
          />
          <div class="image-square-editor__guide" />
          <span class="image-square-editor__badge">белые поля {{ whiteFill }}</span>
        </div>

        <div class="image-square-editor__hint">
          <n-text depth="3">перетаскивайте внутри кадра · колесо — масштаб</n-text>
          <n-text depth="3">1:1 · {{ outputSize }}×{{ outputSize }}</n-text>
        </div>

        <n-text v-if="error" type="error" class="image-square-editor__error">{{ error }}</n-text>
      </div>

      <div class="image-square-editor__rail" :class="{ 'is-disabled': !isLoaded }">
        <div class="image-square-editor__group">
          <div class="image-square-editor__caption">Исходник</div>
          <div v-if="sourceFile" class="image-square-editor__mono">
            <div class="image-square-editor__file-name" :title="sourceFile.name">
              {{ sourceFile.name }}
            </div>
            <div>{{ width }} × {{ height }} px</div>
            <div>{{ formatMb(sourceFile.size) }} · {{ sourceType }}</div>
          </div>
          <div v-else class="image-square-editor__mono">—</div>
          <n-button
            v-if="isLoaded"
            size="small"
            secondary
            block
            :disabled="isApplying"
            @click="openFileDialog"
          >
            Выбрать другой файл
          </n-button>
        </div>

        <div class="image-square-editor__group">
          <div class="image-square-editor__caption">Масштаб</div>
          <div class="image-square-editor__zoom">
            <n-slider
              :value="zoomPercent"
              :min="Math.round(zoomRange.min * 100)"
              :max="Math.round(zoomRange.max * 100)"
              :step="1"
              :disabled="!isLoaded || isApplying"
              :format-tooltip="(v: number) => `${v}%`"
              @update:value="zoomHandler"
            />
            <span class="image-square-editor__mono">{{ zoomPercent }}%</span>
          </div>
          <div class="image-square-editor__row">
            <n-button
              size="small"
              :secondary="isFit"
              :quaternary="!isFit"
              :disabled="!isLoaded || isApplying"
              @click="fitHandler"
            >
              Вписать
            </n-button>
            <n-button
              size="small"
              :secondary="isFill"
              :quaternary="!isFill"
              :disabled="!isLoaded || isApplying"
              @click="fillHandler"
            >
              Заполнить
            </n-button>
          </div>
        </div>

        <div class="image-square-editor__group">
          <div class="image-square-editor__caption">Выравнивание</div>
          <div class="image-square-editor__pad">
            <button
              v-for="cell in ALIGN_CELLS"
              :key="`${cell.col}:${cell.row}`"
              type="button"
              class="image-square-editor__pad-cell"
              :class="{
                'is-active': alignPosition?.col === cell.col && alignPosition?.row === cell.row
              }"
              :disabled="!isLoaded || isApplying"
              @click="alignHandler(cell.col, cell.row)"
            />
          </div>
        </div>

        <div v-if="isLoaded" class="image-square-editor__group">
          <div class="image-square-editor__caption">Проверки</div>
          <div class="image-square-editor__checks">
            <div v-for="check in checks" :key="check.text" class="image-square-editor__check">
              <n-icon
                :component="check.ok ? Check : AlertTriangle"
                :color="check.ok ? themeVars.successColor : themeVars.warningColor"
                size="16"
              />
              <span>{{ check.text }}</span>
            </div>
          </div>
        </div>

        <div class="image-square-editor__group">
          <div class="image-square-editor__caption">
            {{ isLoaded ? 'Результат' : 'Требования' }}
          </div>
          <div class="image-square-editor__mono">
            <div>квадрат 1:1 · белый фон</div>
            <div>{{ outputSize }} × {{ outputSize }} px · JPG</div>
            <div v-if="!isLoaded">JPG, PNG, WebP · до {{ formatMb(maxFileSize) }}</div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="image-square-editor__footer">
        <n-text depth="3" class="image-square-editor__status">
          <n-icon v-if="isLoaded && warningsCount > 0" :component="InfoCircle" size="16" />
          {{ footerStatus }}
        </n-text>
        <div class="image-square-editor__row">
          <n-button :disabled="isApplying" @click="show = false">Отмена</n-button>
          <n-button
            type="primary"
            :disabled="!isLoaded"
            :loading="isApplying"
            @click="applyHandler"
          >
            Применить
          </n-button>
        </div>
      </div>
    </template>
  </n-modal>
</template>

<style lang="scss">
.image-square-editor.n-card {
  width: 780px;
  max-width: calc(100vw - 32px);
}
</style>

<style lang="scss" scoped>
.image-square-editor {
  &__title {
    font-size: 18px;
    font-weight: 500;
  }

  &__subtitle {
    display: block;
    font-size: 13px;
    font-weight: 400;
  }

  &__body {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 240px;
    gap: 24px;

    @media (max-width: 720px) {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  &__stage {
    position: relative;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    background: #fff;
    border: 1px solid var(--ise-border);
    cursor: grab;
    touch-action: none;
    user-select: none;

    &:active {
      cursor: grabbing;
    }

    &.is-locked {
      opacity: 0.6;
      pointer-events: none;
    }

    &--drop {
      display: grid;
      place-items: center;
      cursor: default;
      border-style: dashed;
      background: var(--ise-action);
      transition: border-color 0.2s;

      &.is-drag-over {
        border-color: var(--ise-primary);
      }
    }
  }

  &__drop {
    display: grid;
    gap: 10px;
    justify-items: center;
    text-align: center;
  }

  &__image {
    position: absolute;
    max-width: none;
    pointer-events: none;
  }

  &__guide {
    position: absolute;
    inset: 0;
    pointer-events: none;

    &::before,
    &::after {
      content: '';
      position: absolute;
      background: rgb(0 0 0 / 15%);
    }

    &::before {
      left: 50%;
      top: 0;
      bottom: 0;
      width: 1px;
    }

    &::after {
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
    }
  }

  &__badge {
    position: absolute;
    left: 8px;
    top: 8px;
    padding: 2px 6px;
    font-size: 11px;
    color: #666;
    background: rgb(255 255 255 / 85%);
    pointer-events: none;
  }

  &__hint {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    margin-top: 8px;
    font-size: 12px;
  }

  &__error {
    display: block;
    margin-top: 8px;
  }

  &__rail {
    display: grid;
    gap: 20px;
    align-content: start;

    &.is-disabled {
      opacity: 0.5;
    }
  }

  &__group {
    display: grid;
    gap: 8px;
  }

  &__caption {
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ise-text-3);
  }

  &__mono {
    font-size: 12px;
    line-height: 1.6;
    font-variant-numeric: tabular-nums;
  }

  &__file-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__zoom {
    display: flex;
    align-items: center;
    gap: 12px;

    .n-slider {
      flex: 1;
    }

    span {
      min-width: 40px;
      text-align: right;
    }
  }

  &__row {
    display: flex;
    gap: 8px;
  }

  &__pad {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    width: 72px;
    height: 72px;
    border: 1px solid var(--ise-border);
  }

  &__pad-cell {
    padding: 0;
    border: 0;
    border-right: 1px dotted var(--ise-divider);
    border-bottom: 1px dotted var(--ise-divider);
    background: transparent;
    cursor: pointer;

    &:nth-child(3n) {
      border-right: 0;
    }

    &:nth-child(n + 7) {
      border-bottom: 0;
    }

    &:hover:not(:disabled) {
      background: var(--ise-hover);
    }

    &.is-active {
      background: var(--ise-primary);
    }

    &:disabled {
      cursor: default;
    }
  }

  &__checks {
    display: grid;
    gap: 6px;
  }

  &__check {
    display: flex;
    gap: 6px;
    align-items: flex-start;
    font-size: 13px;
    line-height: 1.35;

    .n-icon {
      flex: none;
      margin-top: 1px;
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  &__status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
  }
}
</style>
