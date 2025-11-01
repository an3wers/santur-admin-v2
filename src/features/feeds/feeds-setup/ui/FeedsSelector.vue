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
// import type { FeedKeyRes } from '@/entities/feeds'
import { useFeedsSetup } from '../model/use-feeds-setup'
import { useRemoveFeed } from '../model/use-remove-feed'
import EditFeedKeyForm from './EditFeedKeyForm.vue'

const { ctx, feedKeys } = defineProps<{
  ctx: string
  feedKeys: { label: string; value: string; descr: string }[]
}>()

const emits = defineEmits<{
  (e: 'onUpdateFeed'): void
  (e: 'onAfterSuccessSaveKey'): void
  (e: 'onRemovedKey'): void
}>()

const feedsSetup = useFeedsSetup()

const currentFeedMeta = computed(() => {
  return feedKeys?.find((el) => el.value === feedsSetup.currentFeedKey)
})

const dropdownOptions = computed(() => {
  if (feedsSetup.feedPermissions.canEdit && feedsSetup.feedPermissions.canRemove) {
    return [
      { label: 'Изменить', key: 'edit' },
      { label: 'Удалить', key: 'remove' }
    ]
  } else if (feedsSetup.feedPermissions.canEdit) {
    return [{ label: 'Изменить', key: 'edit' }]
  } else if (feedsSetup.feedPermissions.canRemove) {
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
  window.open(feedsSetup.feedLink, '_blank')
}
const copyToClipboard = useCopyToClipboard()
const copyHandler = async () => {
  await copyToClipboard(feedsSetup.feedLink)
}

function addFeed() {
  keyModalMode.value = 'add'
  isOpenKeyModal.value = true
}

function editFeed() {
  keyModalMode.value = 'edit'
  isOpenKeyModal.value = true
}

function savedFeedKeyhandler(key: string) {
  isOpenKeyModal.value = false
  feedsSetup.setFeedKey(key)

  // feedsKeysExecute()
  refreshNuxtData(`feeds-keys-${ctx}`)

  //Закаментировал, потому что в useAsyncData watch: [() => feedSetup.currentFeedKey]
  // refreshNuxtData(`feed-filter-${ctx}`)
}

const message = useMessage()

const { removeFeedByKey, error: removeFeedError, status: removeFeedStatus } = useRemoveFeed()

async function removeFeed() {
  await removeFeedByKey(feedsSetup.currentFeedKey)

  if (removeFeedStatus.value === 'success') {
    // await feedsKeysExecute()
    await refreshNuxtData(`feeds-keys-${ctx}`)

    if (feedKeys?.length) {
      feedsSetup.setFeedKey(feedKeys[0].value)
    } else {
      feedsSetup.setFeedKey('')
    }

    //Закаментировал, потому что в useAsyncData watch: [() => feedSetup.currentFeedKey]
    // refreshNuxtData(`feed-filter-${ctx}`)

    message.success('Фид успешно удален')
  } else if (removeFeedStatus.value === 'error') {
    message.error(removeFeedError.value || 'Произошла ошибка при удалении')
  }
}

const keyModalMode = ref<'add' | 'edit'>('add')

const currentKeyValue = computed(() => {
  return feedKeys?.find((el) => el.value === feedsSetup.currentFeedKey) || null
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
          <n-select
            class="row-select__input"
            :options="feedKeys ?? []"
            :value="feedsSetup.currentFeedKey"
            @update:value="feedsSetup.setFeedKey"
          />
          <div class="row-select__btn">
            <n-button v-if="feedsSetup.feedPermissions.canAddNewKey" @click="addFeed"
              >Добавить фид</n-button
            >
            <n-dropdown
              v-if="feedsSetup.feedPermissions.canEdit || feedsSetup.feedPermissions.canRemove"
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
        <div v-if="feedsSetup.feedPermissions.canViewFeedLink" class="row">
          <n-input class="row__input" :value="feedsSetup.feedLink" readonly />
          <div class="row__btns">
            <n-button ghost @click="openInNewTabHandler">
              <n-icon size="20px" :component="ExternalLink" />
            </n-button>
            <n-button ghost @click="copyHandler">
              <n-icon size="20px" :component="Copy" />
            </n-button>
          </div>
        </div>
        <n-p v-if="currentFeedMeta?.descr">
          <n-text :depth="3" style="display: block">Описание</n-text>
          {{ currentFeedMeta.descr }}
        </n-p>
      </n-space>
      <n-button type="primary" @click="saveFeedHandler">Обновить выгрузку</n-button>
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
        :can-edit-key="feedsSetup.feedPermissions.canEditKey"
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
</style>
