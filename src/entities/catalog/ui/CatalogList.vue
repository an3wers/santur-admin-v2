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
  NPopover
} from 'naive-ui'
import { Edit, FileDownload } from '@vicons/tabler'
import type { DropdownMixedOption } from 'naive-ui/es/dropdown/src/interface'
import { useDownloadTemplate } from '../model/use-download-template'
import type { DownloadTemplateOption } from '../api/catalog-schemas'

defineProps<{
  items: CatalogItem[]
}>()
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
</script>

<template>
  <n-card>
    <n-collapse :trigger-areas="['main', 'arrow']">
      <n-collapse-item v-for="item in items" :name="item.name" :key="item.id">
        <template #header
          ><div>
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
                    <n-icon size="24px">
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
                  <n-icon size="24px">
                    <Edit />
                  </n-icon>
                </n-button>
              </template>
              <span> Редактировать </span>
            </n-popover>
          </div>
        </template>
        <div class="child-container">
          <n-list hoverable>
            <n-list-item v-for="child in item.child" :key="child.id">
              <div class="row">
                <div class="row-name">{{ child.name }}</div>
                <div class="row-button">
                  <n-popover placement="bottom" trigger="hover">
                    <template #trigger>
                      <n-button quaternary circle size="small" @click="moveEdit(child.id)">
                        <n-icon size="24px">
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
.child-container {
  margin-left: 2rem;
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
