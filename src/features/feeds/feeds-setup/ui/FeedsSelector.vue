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
import { useRemoveFeed } from '../model/use-remove-feed'
import EditFeedKeyForm from './EditFeedKeyForm.vue'

const { ctx, currentFeedKeyWithPrefix, feedKeys, feedPermissions, feedLink } = defineProps<{
  ctx: string
  currentFeedKeyWithPrefix: string | null
  feedKeys: { label: string; value: string; descr: string }[]
  feedPermissions: {
    canAddNewKey: boolean
    canEdit: boolean
    canEditKey: boolean
    canEditKeyName: boolean
    canRemove: boolean
    canViewFeedLink: boolean
  }
  feedLink: string
}>()

const currentFeedKeyWithoutPrefixValue = defineModel<string | null>('feedKey')

const emits = defineEmits<{
  (e: 'onUpdateFeed'): void
  (e: 'onSavedKey', key: string): void
  (e: 'onRemovedKey', key: string): void
}>()

const currentFeedMeta = computed(() => {
  return feedKeys?.find((el) => el.value === currentFeedKeyWithoutPrefixValue.value)
})

const dropdownOptions = computed(() => {
  if (feedPermissions.canEdit && feedPermissions.canRemove) {
    return [
      { label: 'Изменить', key: 'edit' },
      { label: 'Удалить', key: 'remove' }
    ]
  } else if (feedPermissions.canEdit) {
    return [{ label: 'Изменить', key: 'edit' }]
  } else if (feedPermissions.canRemove) {
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
  window.open(feedLink, '_blank')
}
const copyToClipboard = useCopyToClipboard()
const copyHandler = async () => {
  await copyToClipboard(feedLink)
}

function addFeed() {
  keyModalMode.value = 'add'
  isOpenKeyModal.value = true
}

function editFeed() {
  keyModalMode.value = 'edit'
  isOpenKeyModal.value = true
}

async function savedFeedKeyhandler(key: string) {
  isOpenKeyModal.value = false

  // key without prefix
  emits('onSavedKey', key)
}

const message = useMessage()

const { removeFeedByKey, error: removeFeedError, status: removeFeedStatus } = useRemoveFeed()

async function removeFeed() {
  if (currentFeedKeyWithPrefix == null) return

  await removeFeedByKey(currentFeedKeyWithPrefix)

  if (removeFeedStatus.value === 'success') {
    emits('onRemovedKey', currentFeedKeyWithPrefix)
    message.success('Настройка успешно удалена')
  } else if (removeFeedStatus.value === 'error') {
    message.error(removeFeedError.value || 'Произошла ошибка при удалении')
  }
}

const keyModalMode = ref<'add' | 'edit'>('add')

const currentKeyValue = computed(() => {
  return feedKeys?.find((el) => el.value === currentFeedKeyWithoutPrefixValue.value) || null
})

function saveFeedHandler() {
  emits('onUpdateFeed')
}

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
          <!--:value="currentFeedKey"
            @update:value="feedsSetup.setFeedKey"
            -->
          <n-select
            v-model:value="currentFeedKeyWithoutPrefixValue"
            class="row-select__input"
            :options="feedKeys ?? []"
          />
          <div class="row-select__btn">
            <n-button v-if="feedPermissions.canAddNewKey" @click="addFeed"
              >Добавить настройку</n-button
            >
            <n-dropdown
              v-if="feedPermissions.canEdit || feedPermissions.canRemove"
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
        <div v-if="feedPermissions.canViewFeedLink" class="row">
          <n-input class="row__input" :value="feedLink" readonly />
          <div class="row__btns">
            <n-button ghost @click="openInNewTabHandler">
              <n-icon size="20px" :component="ExternalLink" />
            </n-button>
            <n-button ghost @click="copyHandler">
              <n-icon size="20px" :component="Copy" />
            </n-button>
          </div>
        </div>
        <n-p v-if="currentKeyValue">
          <n-text :depth="3" style="display: block">Ключ</n-text>
          <span class="key-value"
            >{{ currentKeyValue.value }}
            <n-button
              size="tiny"
              type="primary"
              text
              @click="copyToClipboard(currentKeyValue.value)"
            >
              <template #icon>
                <n-icon size="16px" :component="Copy" />
              </template>
            </n-button>
          </span>
        </n-p>
        <n-p v-if="currentFeedMeta?.descr">
          <n-text :depth="3" style="display: block">Описание</n-text>
          {{ currentFeedMeta.descr }}
        </n-p>
      </n-space>
      <n-button type="primary" @click="saveFeedHandler">Обновить настройку</n-button>
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
        :ctx="ctx"
        :mode="keyModalMode"
        :current-key-value="currentKeyValue"
        :can-edit-key="feedPermissions.canEditKey"
        @on-after-success-save-key="savedFeedKeyhandler"
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
  width: 420px;
  flex-shrink: 1;
}

.row__btns {
  display: flex;
  gap: 0.5rem;
}

.key-value {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
