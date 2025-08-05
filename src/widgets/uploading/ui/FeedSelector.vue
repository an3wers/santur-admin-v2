<script setup lang="ts">
import {
  NCard,
  NSpace,
  NSelect,
  NInput,
  NButton,
  NIcon,
  NModal,
  NDropdown,
  NP,
  NText,
  useMessage
} from 'naive-ui'
import { Copy, ExternalLink, Dots } from '@vicons/tabler'
import { useCopyToClipboard } from '~/shared/libs/copy-to-clipboard'
import { useFeed } from '@/entities/uploading'
import type { AsyncDataRequestStatus } from '#app'
import { useRemoveFeed } from '../model/use-remove-feed'
import { EditFeedKeyForm } from '@/features/uploading/edit-feed-key'

const { platformOptionsData } = defineProps<{
  platformOptionsData: { value: string; label: string; descr: string }[] | null
  platformOptionsStatus: AsyncDataRequestStatus
}>()

const emits = defineEmits<{
  (e: 'onUpdateFeed'): void
  (e: 'onAfterSuccessSaveKey'): void
  (e: 'onRemovedKey'): void
}>()

const { feedLink, currentFeed, selectFeed, feedSettings } = useFeed()

const currentPlatformData = computed(() => {
  return platformOptionsData?.find((el) => el.value === currentFeed.value)
})

const dropdownOptions = computed(() => {
  if (feedSettings.value.canEdit && feedSettings.value.canRemove) {
    return [
      { label: 'Изменить', key: 'edit' },
      { label: 'Удалить', key: 'remove' }
    ]
  } else if (feedSettings.value.canEdit) {
    return [{ label: 'Изменить', key: 'edit' }]
  } else if (feedSettings.value.canRemove) {
    return [{ label: 'Удалить', key: 'remove' }]
  }

  return []
})

type dropdownKeys = 'edit' | 'remove'

function handleDropdown(key: dropdownKeys) {
  switch (key) {
    case 'edit':
      editFeed()
      break
    case 'remove':
      removeFeed()
      break
  }
}

const isOpenKeyModal = ref(false)

const openInNewTabHandler = () => {
  window.open(feedLink.value, '_blank')
}
const copyToClipboard = useCopyToClipboard()
const copyHandler = async () => {
  await copyToClipboard(feedLink.value)
}

function addFeed() {
  keyModalMode.value = 'add'
  isOpenKeyModal.value = true
}

function editFeed() {
  keyModalMode.value = 'edit'
  isOpenKeyModal.value = true
}

function feedSavedhandler() {
  if (keyModalMode.value === 'edit') {
    isOpenKeyModal.value = false
  }

  emits('onAfterSuccessSaveKey')
}

const message = useMessage()

const { removeFeedByKey, error: removeFeedError, status: removeFeedStatus } = useRemoveFeed()
async function removeFeed() {
  await removeFeedByKey(currentFeed.value)

  if (removeFeedStatus.value === 'success') {
    emits('onRemovedKey')
    message.success('Фид успешно удален')
  } else if (removeFeedStatus.value === 'error') {
    message.error(removeFeedError.value || 'Произошла ошибка при удалении')
  }
}

const keyModalMode = ref<'add' | 'edit'>('add')

const currentKeyValue = computed(() => {
  return platformOptionsData?.find((el) => el.value === currentFeed.value) || null
})

watch(isOpenKeyModal, () => {
  if (!isOpenKeyModal.value) {
    keyModalMode.value = 'add'
  }
})
</script>

<template>
  <n-card>
    <n-space justify="space-between" size="medium" align="start">
      <n-space vertical size="medium">
        <div class="row row-select">
          <n-select
            class="row-select__input"
            :options="platformOptionsData ?? []"
            :loading="platformOptionsStatus === 'pending'"
            :value="currentFeed"
            @update:value="selectFeed"
          />
          <div class="row-select__btn">
            <n-button v-if="feedSettings.canAddNewKey" @click="addFeed">Добавить фид</n-button>
            <n-dropdown
              v-if="feedSettings.canEdit || feedSettings.canRemove"
              trigger="click"
              :options="dropdownOptions"
              @select="handleDropdown"
            >
              <n-button>
                <n-icon size="20px" :component="Dots" />
              </n-button>
            </n-dropdown>
          </div>
        </div>
        <div v-if="feedSettings.canViewFeedLink" class="row">
          <n-input class="row__input" :value="feedLink" readonly />
          <div class="row__btns">
            <n-button ghost @click="openInNewTabHandler">
              <n-icon size="20px" :component="ExternalLink" />
            </n-button>
            <n-button ghost @click="copyHandler">
              <n-icon size="20px" :component="Copy" />
            </n-button>
            <!-- <n-button type="primary" @click="$emit('onUpdateFeed')">Обновить выгрузку</n-button> -->
          </div>
        </div>
        <n-p v-if="currentPlatformData?.descr">
          <n-text :depth="3" style="display: block">Описание</n-text>
          {{ currentPlatformData.descr }}
        </n-p>
      </n-space>
      <n-button type="primary" @click="$emit('onUpdateFeed')">Обновить выгрузку</n-button>
    </n-space>
    <n-modal
      style="width: 100%; max-width: 480px"
      preset="dialog"
      :title="keyModalMode === 'add' ? 'Добавить фид' : 'Редактировать'"
      :show="isOpenKeyModal"
      :show-icon="false"
      @esc="isOpenKeyModal = false"
      @close="isOpenKeyModal = false"
    >
      <EditFeedKeyForm
        :mode="keyModalMode"
        :current-key-value="currentKeyValue"
        :can-edit-key="feedSettings.canEditKey"
        @on-after-success-save-key="feedSavedhandler"
      />
    </n-modal>
  </n-card>
</template>

<style scoped>
.row {
  display: flex;
  gap: 0.5rem;
}

.row-select {
  display: flex;
  /* justify-content: space-between; */
  gap: 0.5rem;
}

.row-select__input {
  width: 220px;
  flex-shrink: 1;
}

.row-select__btn {
  flex-shrink: 0;
  display: flex;
  gap: 0.5rem;
}

.row__input {
  max-width: 400px;
  flex-shrink: 1;
}

.row__btns {
  display: flex;
  gap: 0.5rem;
}

/* .form-container {
  margin-top: 1rem;
} */
</style>
