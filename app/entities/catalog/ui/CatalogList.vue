<script setup lang="ts">
import type { CatalogItem, CatalogNode } from '../model/catalog-types'
import {
  NCard,
  NButton,
  NIcon,
  NText,
  NDropdown,
  NModal,
  NSpin,
  useMessage,
  NPopover,
  NTag
} from 'naive-ui'
import { Copy, Edit, FileDownload, SquarePlus, LayoutGridAdd } from '@vicons/tabler'
import type { DropdownMixedOption } from 'naive-ui/es/dropdown/src/interface'
import { useDownloadTemplate } from '../model/use-download-template'
import { useRemovePresetFilter } from '../model/use-remove-preset-filter'
import type { DownloadTemplateOption } from '../api/catalog-schemas'
import { useCopyToClipboard } from '~/shared/libs/copy-to-clipboard'
import { getLocationLabel } from '../libs/preset-location'
import CatalogNodeCard from './CatalogNodeCard.vue'

const props = defineProps<{
  items: CatalogItem[]
}>()

const emit = defineEmits<{
  (e: 'addPreset', payload: { catalogItemId: number; categoryName: string }): void
  (e: 'addPresetsBulk', payload: { catalogItemId: number; categoryName: string }): void
  (
    e: 'editPreset',
    payload: { catalogItemId: number; categoryName: string; presetId: number }
  ): void
  (e: 'presetRemoved'): void
}>()

// Структура каталога разложена по колонкам: товарное направление -> категория ->
// виды и подфильтровые страницы -> карточка выбранного элемента.
const selectedTnId = ref<number | null>(null)
const selectedTkId = ref<number | null>(null)
const selectedNodeKey = ref<string | null>(null)

const selectedTn = computed(
  () => props.items.find((item) => item.id === selectedTnId.value) ?? null
)

const categories = computed(() => selectedTn.value?.child ?? [])

const selectedTk = computed(
  () => categories.value.find((child) => child.id === selectedTkId.value) ?? null
)

// Плоский список третьего уровня: сначала виды, затем подфильтровые страницы
const nodes = computed<CatalogNode[]>(() => {
  const child = selectedTk.value

  if (!child) {
    return []
  }

  const vids = (child.categoryVids ?? []).map<CatalogNode>((vid) => ({
    kind: 'vid',
    key: `vid-${vid.id}`,
    id: vid.id,
    name: vid.name,
    alias: vid.alias,
    raw: vid
  }))

  const presets = (child.presets ?? []).map<CatalogNode>((preset) => ({
    kind: 'preset',
    key: `preset-${preset.id}`,
    id: preset.id,
    name: preset.title,
    alias: preset.alias,
    location: preset.location,
    filters: preset.presets ?? [],
    raw: preset
  }))

  return [...vids, ...presets]
})

const selectedNode = computed(
  () => nodes.value.find((node) => node.key === selectedNodeKey.value) ?? null
)

// Первое направление выбираем сразу, чтобы страница не открывалась пустой.
// Если выбранное направление пропало после обновления данных — переключаемся на первое.
watch(
  () => props.items,
  (items) => {
    if (!items.some((item) => item.id === selectedTnId.value)) {
      selectedTnId.value = items[0]?.id ?? null
    }
  },
  { immediate: true }
)

// Выбор вложенного уровня сбрасываем, если он больше не принадлежит выбранному родителю
watch(categories, (list) => {
  if (!list.some((child) => child.id === selectedTkId.value)) {
    selectedTkId.value = null
  }
})

watch(nodes, (list) => {
  if (!list.some((node) => node.key === selectedNodeKey.value)) {
    selectedNodeKey.value = null
  }
})

function getCategoryMeta(child: CatalogItem['child'][number]) {
  return `Видов: ${child.categoryVids?.length ?? 0} · Фильтров: ${child.presets?.length ?? 0}`
}

function moveEdit(itemId: number) {
  return navigateTo(`/tntks/${itemId}`)
}

function addPresetHandler() {
  if (!selectedTk.value) {
    return
  }

  emit('addPreset', { catalogItemId: selectedTk.value.id, categoryName: selectedTk.value.name })
}

function addPresetsBulkHandler() {
  if (!selectedTk.value) {
    return
  }

  emit('addPresetsBulk', {
    catalogItemId: selectedTk.value.id,
    categoryName: selectedTk.value.name
  })
}

function editNodeHandler() {
  const node = selectedNode.value

  if (!node) {
    return
  }

  if (node.kind === 'vid') {
    moveEdit(node.id)
    return
  }

  if (!selectedTk.value) {
    return
  }

  emit('editPreset', {
    catalogItemId: selectedTk.value.id,
    categoryName: selectedTk.value.name,
    presetId: node.id
  })
}

const downloadMenu: DropdownMixedOption[] = [
  {
    label: 'Все категории',
    key: 'all'
  },
  {
    label: 'Категории с заполненными атрибутами',
    key: 'full'
  },
  {
    label: 'Категории с пустыми атрибутами',
    key: 'empty'
  }
] as const

const { downloadTemplate, status: downloadStatus, downloadFile, reset } = useDownloadTemplate()
function handleDropdown(key: DownloadTemplateOption, payload: CatalogItem) {
  downloadTemplate(payload.name, key)
  showDownloadModal.value = true
}

const showDownloadModal = ref(false)
const message = useMessage()

watchEffect(() => {
  if (downloadStatus.value === 'error') {
    showDownloadModal.value = false
    message.error('Произошла ошибка при загрузке')
  }
})

function changeShowDownloadModal(show: boolean) {
  if (!show) {
    reset()
  }
}

const copyToClipboard = useCopyToClipboard()
function copyCategoryId(id: number) {
  copyToClipboard(id.toString())
}

// Удаление подфильтровой страницы прямо из карточки — логика общая с формой редактирования
const {
  removeStatus,
  confirmRemove,
  remove: removePresetFilter,
  reset: resetRemoveStatus
} = useRemovePresetFilter()

const isRemoving = computed(() => removeStatus.value === 'pending')

async function removeNodeHandler() {
  const node = selectedNode.value

  if (node?.kind !== 'preset' || isRemoving.value || !confirmRemove()) {
    return
  }

  await removePresetFilter(node.id)

  if (removeStatus.value === 'success') {
    message.success('Подфильтровая страница удалена')
    selectedNodeKey.value = null
    emit('presetRemoved')
  }

  if (removeStatus.value === 'error') {
    message.error('Произошла ошибка при удалении')
  }

  resetRemoveStatus()
}
</script>

<template>
  <n-card :content-style="{ padding: 0 }">
    <div class="columns">
      <!-- Уровень 1: товарные направления -->
      <div class="column">
        <div class="column__head">
          <span>Товарные направления</span>
          <span class="column__count">{{ items.length }}</span>
        </div>
        <div class="column__body">
          <div
            v-for="item in items"
            :key="item.id"
            class="row"
            :class="{ 'row--selected': item.id === selectedTnId }"
            @click="selectedTnId = item.id"
          >
            <div class="row__main">
              <div class="row__meta">
                <n-text :depth="3" class="row__id">{{ item.id }}</n-text>
                <n-button text size="tiny" @click.stop="copyCategoryId(item.id)">
                  <n-icon><Copy /></n-icon>
                </n-button>
              </div>
              <p class="row__name">{{ item.name }}</p>
              <n-text :depth="3" tag="p" class="row__sub"
                >Категорий: {{ item.child.length }}</n-text
              >
            </div>
            <div class="row__actions">
              <n-dropdown
                trigger="click"
                :options="downloadMenu"
                @select="(key) => handleDropdown(key, item)"
              >
                <n-popover placement="bottom" trigger="hover">
                  <template #trigger>
                    <n-button quaternary circle size="small" @click.stop>
                      <n-icon size="18px"><FileDownload /></n-icon>
                    </n-button>
                  </template>
                  <span>Скачать шаблон для заполнения</span>
                </n-popover>
              </n-dropdown>
              <n-popover placement="bottom" trigger="hover">
                <template #trigger>
                  <n-button quaternary circle size="small" @click.stop="moveEdit(item.id)">
                    <n-icon size="18px"><Edit /></n-icon>
                  </n-button>
                </template>
                <span>Редактировать</span>
              </n-popover>
            </div>
          </div>
        </div>
      </div>

      <!-- Уровень 2: товарные категории -->
      <div class="column">
        <div class="column__head">
          <span>Категории</span>
          <span class="column__count">{{ categories.length }}</span>
        </div>
        <div class="column__body">
          <div v-if="!selectedTn" class="column__empty">Выберите товарное направление</div>
          <div v-else-if="!categories.length" class="column__empty">Нет категорий</div>
          <div
            v-for="child in categories"
            :key="child.id"
            class="row"
            :class="{ 'row--selected': child.id === selectedTkId }"
            @click="selectedTkId = child.id"
          >
            <div class="row__main">
              <div class="row__meta">
                <n-text :depth="3" class="row__id">{{ child.id }}</n-text>
                <n-button text size="tiny" @click.stop="copyCategoryId(child.id)">
                  <n-icon><Copy /></n-icon>
                </n-button>
              </div>
              <p class="row__name">{{ child.name }}</p>
              <n-text :depth="3" tag="p" class="row__sub">{{ getCategoryMeta(child) }}</n-text>
            </div>
            <div class="row__actions">
              <n-popover placement="bottom" trigger="hover">
                <template #trigger>
                  <n-button quaternary circle size="small" @click.stop="moveEdit(child.id)">
                    <n-icon size="18px"><Edit /></n-icon>
                  </n-button>
                </template>
                <span>Редактировать</span>
              </n-popover>
            </div>
          </div>
        </div>
      </div>

      <!-- Уровень 3: виды и подфильтровые страницы -->
      <div class="column">
        <div class="column__head">
          <span>Виды и подфильтровые страницы</span>
          <span class="column__count">{{ nodes.length }}</span>
        </div>
        <div class="column__body">
          <div v-if="!selectedTk" class="column__empty">Выберите категорию</div>
          <div v-else-if="!nodes.length" class="column__empty">
            Нет видов и подфильтровых страниц
          </div>
          <div
            v-for="node in nodes"
            :key="node.key"
            class="row row--node"
            :class="{ 'row--selected': node.key === selectedNodeKey }"
            @click="selectedNodeKey = node.key"
          >
            <div class="row__main">
              <div class="row__meta">
                <n-tag :type="node.kind === 'vid' ? 'success' : 'info'" size="tiny">
                  {{ node.kind === 'vid' ? 'вид' : 'фильтр' }}
                </n-tag>
                <n-text :depth="3" class="row__id">{{ node.id }}</n-text>
                <n-tag
                  v-if="node.kind === 'preset'"
                  :type="node.location === 'hidden' ? 'warning' : 'default'"
                  :bordered="node.location !== 'hidden'"
                  size="tiny"
                >
                  {{ getLocationLabel(node.location) }}
                </n-tag>
              </div>
              <p class="row__name" :title="node.alias">{{ node.name }}</p>
            </div>
          </div>
        </div>
        <div class="column__footer">
          <n-button
            block
            dashed
            size="small"
            type="primary"
            :disabled="!selectedTk"
            @click="addPresetHandler"
          >
            <template #icon>
              <n-icon><SquarePlus /></n-icon>
            </template>
            Подфильтровая страница
          </n-button>
          <n-button
            block
            quaternary
            size="small"
            :disabled="!selectedTk"
            @click="addPresetsBulkHandler"
          >
            <template #icon>
              <n-icon><LayoutGridAdd /></n-icon>
            </template>
            Добавить множество
          </n-button>
        </div>
      </div>

      <!-- Карточка выбранного элемента -->
      <div class="column column--last">
        <div class="column__head">
          <span>Карточка элемента</span>
        </div>
        <div class="column__card">
          <CatalogNodeCard
            :node="selectedNode"
            :tn-name="selectedTn?.name"
            :tk-name="selectedTk?.name"
            :removing="isRemoving"
            @edit="editNodeHandler"
            @remove="removeNodeHandler"
          />
        </div>
      </div>
    </div>

    <n-modal
      v-model:show="showDownloadModal"
      preset="dialog"
      title="Шаблон товарного направления"
      :show-icon="false"
      @update:show="changeShowDownloadModal"
    >
      <div style="padding: 1rem 0; text-align: center">
        <n-spin v-if="downloadStatus === 'pending'" size="small" />
        <a
          v-if="downloadStatus === 'success'"
          :download="downloadFile?.name"
          :href="downloadFile?.url"
          >Скачать шаблон</a
        >
      </div>
    </n-modal>
  </n-card>
</template>

<style scoped>
.columns {
  display: grid;
  grid-template-columns: 260px 300px 360px minmax(320px, 1fr);
  height: calc(100dvh - 220px);
  min-height: 520px;
}

.column {
  border-right: 1px solid var(--gray-200);
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.column--last {
  border-right: none;
}

.column__head {
  align-items: center;
  background-color: var(--gray-100);
  border-bottom: 1px solid var(--gray-200);
  color: var(--gray-500);
  display: flex;
  flex-shrink: 0;
  font-size: var(--font-size-xs);
  font-weight: 500;
  gap: 0.5rem;
  justify-content: space-between;
  letter-spacing: 0.05em;
  padding: 0.75rem 1rem;
  text-transform: uppercase;
}

.column__count {
  font-weight: 400;
  letter-spacing: 0;
}

.column__body {
  flex-grow: 1;
  overflow-y: auto;
}

.column__card {
  flex-grow: 1;
  min-height: 0;
  overflow: hidden;
}

.column__footer {
  border-top: 1px solid var(--gray-200);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: 0.375rem;
  padding: 0.75rem 1rem;
}

.column__empty {
  color: var(--gray-500);
  font-size: var(--font-size-sm);
  padding: 1rem;
}

.row {
  border-bottom: 1px solid var(--gray-100);
  border-left: 3px solid transparent;
  cursor: pointer;
  display: flex;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem 0.625rem 0.8125rem;
}

.row:hover {
  background-color: var(--gray-100);
}

.row--selected,
.row--selected:hover {
  background-color: var(--blue-200);
  border-left-color: var(--primary-color);
}

.row__main {
  flex-grow: 1;
  min-width: 0;
}

.row__meta {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 0.125rem;
}

.row__id {
  font-size: var(--font-size-xs);
}

.row__name {
  font-size: var(--font-size-sm);
  line-height: 1.35;
  margin: 0;
  overflow-wrap: anywhere;
}

.row__sub {
  font-size: var(--font-size-xs);
  margin: 0.125rem 0 0 0;
}

.row__actions {
  align-items: flex-start;
  display: flex;
  flex-shrink: 0;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.row:hover .row__actions,
.row--selected .row__actions {
  opacity: 1;
}
</style>
