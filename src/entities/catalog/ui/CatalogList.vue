<script setup lang="ts">
import type { CatalogItem } from '../model/catalog-types'
import {
  NCollapse,
  NCollapseItem,
  NCard,
  NList,
  NListItem,
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
import { Copy, Edit, FileDownload, SquarePlus } from '@vicons/tabler'
import type { DropdownMixedOption } from 'naive-ui/es/dropdown/src/interface'
import { useDownloadTemplate } from '../model/use-download-template'
import type { DownloadTemplateOption } from '../api/catalog-schemas'
import { useCopyToClipboard } from '~/shared/libs/copy-to-clipboard'

defineProps<{
  items: CatalogItem[]
}>()

const emit = defineEmits<{
  (e: 'addPreset', payload: { catalogItemId: number; categoryName: string }): void
  (
    e: 'editPreset',
    payload: { catalogItemId: number; categoryName: string; presetId: number }
  ): void
}>()

const locationMap = new Map<string, string>([
  ['top', 'Над товарами'],
  ['bottom', 'Под товарами'],
  ['top-bottom', 'Над и под товарами']
])

function moveEdit(itemId: number) {
  return navigateTo(`/tntks/${itemId}`)
}

// function downloadFile(tnName: string, option: 'all' | 'full' | 'empty') {}
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
</script>

<template>
  <n-card>
    <n-collapse :trigger-areas="['main', 'arrow']">
      <n-collapse-item v-for="item in items" :name="item.name" :key="item.id">
        <template #header
          ><div>
            <div style="display: flex; gap: 0.25rem; align-items: center">
              <n-text tag="p" :depth="3" style="font-size: 12px">{{ item.id }}</n-text>
              <n-button text size="small" @click.stop="copyCategoryId(item.id)"
                ><NIcon><Copy /></NIcon
              ></n-button>
            </div>
            <n-text tag="p">{{ item.name }}</n-text>
            <n-text tag="p" :depth="3" style="font-size: 12px"
              >Категорий: {{ item.child.length }}</n-text
            >
          </div></template
        >
        <template #header-extra>
          <div class="btn-group">
            <n-dropdown
              trigger="click"
              :options="downloadMenu"
              @select="(key) => handleDropdown(key, item)"
            >
              <n-popover placement="bottom" trigger="hover">
                <template #trigger>
                  <n-button quaternary circle size="small">
                    <n-icon size="20px">
                      <FileDownload />
                    </n-icon>
                  </n-button>
                </template>
                <span> Скачать шаблон для заполнения </span>
              </n-popover>
            </n-dropdown>

            <n-popover placement="bottom" trigger="hover">
              <template #trigger>
                <n-button quaternary circle size="small" @click="moveEdit(item.id)">
                  <n-icon size="20px">
                    <Edit />
                  </n-icon>
                </n-button>
              </template>
              <span> Редактировать </span>
            </n-popover>
          </div>
        </template>
        <div class="child-container">
          <n-list>
            <n-list-item v-for="child in item.child" :key="child.id">
              <!-- Категория с видами / подфильтровыми страницами — третий раскрывающийся уровень -->
              <n-collapse
                v-if="child.presets?.length || child.categoryVids?.length"
                :trigger-areas="['main', 'arrow']"
              >
                <n-collapse-item :name="child.name">
                  <template #header>
                    <div class="row-name">
                      <div style="display: flex; gap: 0.25rem; align-items: center">
                        <n-text tag="p" :depth="3" style="font-size: 12px">{{ child.id }}</n-text>
                        <n-button text size="small" @click.stop="copyCategoryId(child.id)"
                          ><NIcon><Copy /></NIcon
                        ></n-button>
                      </div>

                      <n-text tag="p">{{ child.name }}</n-text>
                      <n-text tag="p" :depth="3" style="font-size: 12px"
                        >Виды: {{ child.vids.length ?? 0 }} | Фильтры:
                        {{ child.presets?.length ?? 0 }}</n-text
                      >
                    </div>
                  </template>
                  <template #header-extra>
                    <div class="btn-group">
                      <n-popover placement="bottom" trigger="hover">
                        <template #trigger>
                          <n-button
                            quaternary
                            circle
                            size="small"
                            @click.stop="
                              emit('addPreset', {
                                catalogItemId: child.id,
                                categoryName: child.name
                              })
                            "
                          >
                            <n-icon size="20px">
                              <SquarePlus />
                            </n-icon>
                          </n-button>
                        </template>
                        <span> Добавить подфильтровую страницу </span>
                      </n-popover>
                      <n-popover placement="bottom" trigger="hover">
                        <template #trigger>
                          <n-button quaternary circle size="small" @click.stop="moveEdit(child.id)">
                            <n-icon size="20px">
                              <Edit />
                            </n-icon>
                          </n-button>
                        </template>
                        <span> Редактировать </span>
                      </n-popover>
                    </div>
                  </template>
                  <div class="preset-container">
                    <n-list>
                      <n-list-item v-for="vid in child.categoryVids" :key="`vid-${vid.id}`">
                        <div class="row">
                          <div class="row-name">
                            <div style="display: flex; gap: 0.25rem; align-items: center">
                              <n-text tag="p" :depth="3" style="font-size: 12px">{{
                                vid.id
                              }}</n-text>
                              <n-tag type="success" size="tiny"> вид </n-tag>
                            </div>
                            <n-text tag="p" :title="vid.alias">
                              {{ vid.name }}
                            </n-text>
                          </div>
                          <div class="row-button">
                            <n-popover placement="bottom" trigger="hover">
                              <template #trigger>
                                <n-button
                                  quaternary
                                  circle
                                  size="small"
                                  @click.stop="moveEdit(vid.id)"
                                >
                                  <n-icon size="20px">
                                    <Edit />
                                  </n-icon>
                                </n-button>
                              </template>
                              <span> Редактировать </span>
                            </n-popover>
                          </div>
                        </div>
                      </n-list-item>
                      <n-list-item v-for="preset in child.presets" :key="preset.id">
                        <div class="row">
                          <div class="row-name">
                            <div style="display: flex; gap: 0.25rem; align-items: center">
                              <n-text tag="p" :depth="3" style="font-size: 12px">{{
                                preset.id
                              }}</n-text>
                              <n-tag type="info" size="tiny"> фильтр </n-tag>
                            </div>
                            <n-text tag="p" :title="preset.alias">
                              {{ preset.title }}
                            </n-text>
                            <n-tag v-if="preset.location" type="default" size="tiny">
                              {{ locationMap.get(preset.location) ?? preset.location }}
                            </n-tag>
                          </div>
                          <div class="row-button">
                            <n-popover placement="bottom" trigger="hover">
                              <template #trigger>
                                <n-button
                                  quaternary
                                  circle
                                  size="small"
                                  @click.stop="
                                    emit('editPreset', {
                                      catalogItemId: child.id,
                                      categoryName: child.name,
                                      presetId: preset.id
                                    })
                                  "
                                >
                                  <n-icon size="20px">
                                    <Edit />
                                  </n-icon>
                                </n-button>
                              </template>
                              <span> Редактировать </span>
                            </n-popover>
                          </div>
                        </div>
                      </n-list-item>
                    </n-list>
                  </div>
                </n-collapse-item>
              </n-collapse>
              <!-- Категория без подфильтров — обычная строка -->
              <div v-else class="row">
                <div class="row-name">
                  <div style="display: flex; gap: 0.25rem; align-items: center">
                    <n-text tag="p" :depth="3" style="font-size: 12px">{{ child.id }}</n-text>
                    <n-button text size="small" @click.stop="copyCategoryId(child.id)"
                      ><NIcon><Copy /></NIcon
                    ></n-button>
                  </div>
                  {{ child.name }}
                </div>
                <div class="row-button btn-group">
                  <n-popover placement="bottom" trigger="hover">
                    <template #trigger>
                      <n-button
                        quaternary
                        circle
                        size="small"
                        @click.stop="
                          emit('addPreset', { catalogItemId: child.id, categoryName: child.name })
                        "
                      >
                        <n-icon size="20px">
                          <SquarePlus />
                        </n-icon>
                      </n-button>
                    </template>
                    <span> Добавить подфильтровую страницу </span>
                  </n-popover>
                  <n-popover placement="bottom" trigger="hover">
                    <template #trigger>
                      <n-button quaternary circle size="small" @click="moveEdit(child.id)">
                        <n-icon size="20px">
                          <Edit />
                        </n-icon>
                      </n-button>
                    </template>
                    <span> Редактировать </span>
                  </n-popover>
                </div>
              </div>
            </n-list-item>
          </n-list>
        </div>
      </n-collapse-item>
    </n-collapse>
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
:deep(.n-collapse .n-collapse-item .n-collapse-item) {
  margin-left: 0;
}

.child-container {
  margin-left: 3rem;
}
.preset-container {
  margin-left: 3rem;
}
.row {
  display: flex;
  gap: 1rem;
}

.row-name {
  flex-grow: 1;
}

.row-name {
  flex-shrink: 0;
}

.btn-group {
  display: flex;
  gap: 0.5rem;
}
</style>
