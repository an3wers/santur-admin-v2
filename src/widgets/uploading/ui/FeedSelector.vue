<script setup lang="ts">
import {
  NCard,
  NSpace,
  NSelect,
  NInput,
  NButton,
  NIcon,
  NModal,
  NForm,
  NFormItem,
  type FormRules,
  useMessage,
  NDropdown,
  NP,
  NText
} from 'naive-ui'
import { Copy, ExternalLink, Dots } from '@vicons/tabler'
import { useCopyToClipboard } from '~/shared/libs/copy-to-clipboard'
import { useFeed } from '../model/use-feed'
import type { AsyncDataRequestStatus } from '#app'
import { useSaveConstructorKey } from '../model/use-save-constructor-key'
import { useRemoveFeed } from '../model/use-remove-feed'

const { platformOptionsData } = defineProps<{
  platformOptionsData: { value: string; label: string; descr: string }[] | null
  platformOptionsStatus: AsyncDataRequestStatus
}>()

const emits = defineEmits<{
  (e: 'onUpdateFeed'): void
  (e: 'onAfterSuccessSaveKey'): void
  (e: 'onRemovedKey'): void
}>()
const { platformLink, currentPlatform, selectPlatform, feedSettings } = useFeed()
const currentPlatformData = computed(() => {
  return platformOptionsData?.find((el) => el.value === currentPlatform.value)
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
  window.open(platformLink.value, '_blank')
}
const copyToClipboard = useCopyToClipboard()
const copyHandler = async () => {
  await copyToClipboard(platformLink.value)
}

function addFeed() {
  formMode.value = 'add'
  isOpenKeyModal.value = true
}
const { removeFeedByKey, error: removeFeedError, status: removeFeedStatus } = useRemoveFeed()
async function removeFeed() {
  await removeFeedByKey(currentPlatform.value)

  if (removeFeedStatus.value === 'success') {
    emits('onRemovedKey')
    message.success('Фид успешно удален')
  } else if (removeFeedStatus.value === 'error') {
    message.error(removeFeedError.value || 'Произошла ошибка при удалении')
  }
}

function editFeed() {
  formMode.value = 'edit'
  isOpenKeyModal.value = true
}

const formMode = ref<'add' | 'edit'>('add')

watch(formMode, () => {
  if (formMode.value === 'add') {
    keyFormValue.value = {
      name: '',
      key: '',
      descr: ''
    }
  } else {
    const found = platformOptionsData?.find((el) => el.value === currentPlatform.value)

    keyFormValue.value = {
      name: found?.label || '',
      key: found?.value || '',
      descr: found?.descr || ''
    }
  }
})

watch(isOpenKeyModal, () => {
  if (!isOpenKeyModal.value) {
    formMode.value = 'add'
  }
})

const formRef = ref()

const keyFormValue = ref({
  name: '',
  key: '',
  descr: ''
})

const formRules: FormRules = {
  name: {
    required: true,
    message: 'Введите название',
    trigger: 'blur'
  },
  key: {
    required: true,
    trigger: 'blur',
    validator(_, value) {
      if (!value) return Promise.reject('Введите ключ')

      // Проверка на наличие только латинских символов, цифр, дефиса и двоеточия без пробелов
      if (!/^[a-zA-Z0-9\-:]+$/.test(value)) {
        return Promise.reject(
          'Ключ должен содержать только латинские буквы, цифры, дефис ("-") и двоеточие (":") без пробелов'
        )
      }

      return Promise.resolve()
    }
  },
  descr: {
    required: false
  }
}
const message = useMessage()

const {
  status: saveConstructorKeyStatus,
  saveConstructorKey,
  error: saveConstructorKeyError
} = useSaveConstructorKey()
async function submitHandler() {
  try {
    const isValid = await formRef.value?.validate()

    if (!isValid) {
      throw new Error('Проверьте корректность заполнения полей')
    }

    const { name, key, descr } = keyFormValue.value

    await saveConstructorKey({ descr, key, name })

    if (saveConstructorKeyStatus.value === 'success') {
      message.success('Фид успешно сохранен')

      if (formMode.value === 'edit') {
        isOpenKeyModal.value = false
      }

      keyFormValue.value.name = ''
      keyFormValue.value.key = ''
      keyFormValue.value.descr = ''

      emits('onAfterSuccessSaveKey')
    } else if (saveConstructorKeyStatus.value === 'error') {
      throw new Error(saveConstructorKeyError.value)
    }
  } catch (error) {
    console.error(error)
    message.error(error instanceof Error ? error.message : 'Что-то пошло не так')
  }
}
</script>

<template>
  <n-card>
    <n-space vertical size="medium">
      <div class="row row-select">
        <n-select
          class="row-select__input"
          :options="platformOptionsData ?? []"
          :loading="platformOptionsStatus === 'pending'"
          :value="currentPlatform"
          @update:value="selectPlatform"
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
      <div class="row">
        <n-input class="row__input" :value="platformLink" readonly />
        <div class="row__btns">
          <n-button ghost @click="openInNewTabHandler">
            <n-icon size="20px" :component="ExternalLink" />
          </n-button>
          <n-button ghost @click="copyHandler">
            <n-icon size="20px" :component="Copy" />
          </n-button>
          <n-button type="primary" @click="$emit('onUpdateFeed')">Обновить выгрузку</n-button>
        </div>
      </div>
      <n-p v-if="currentPlatformData?.descr">
        <n-text :depth="3" style="display: block">Описание</n-text>
        {{ currentPlatformData.descr }}
      </n-p>
    </n-space>
    <n-modal
      style="width: 100%; max-width: 480px"
      preset="dialog"
      :title="formMode === 'add' ? 'Добавить фид' : 'Редактировать'"
      :show="isOpenKeyModal"
      :show-icon="false"
      @esc="isOpenKeyModal = false"
      @close="isOpenKeyModal = false"
    >
      <div class="form-container"></div>
      <n-form
        ref="formRef"
        label-placement="left"
        label-width="auto"
        :model="keyFormValue"
        :rules="formRules"
        :disabled="saveConstructorKeyStatus === 'pending'"
        @submit.prevent="submitHandler"
      >
        <n-form-item path="name" label="Название">
          <n-input v-model:value="keyFormValue.name" placeholder="Введите название" />
        </n-form-item>
        <n-form-item path="key" label="Ключ">
          <n-input
            v-model:value="keyFormValue.key"
            placeholder="Введите ключ"
            :readonly="formMode === 'edit' || !feedSettings.canEditKey"
          />
        </n-form-item>
        <n-form-item path="descr" label="Описание">
          <n-input v-model:value="keyFormValue.descr" type="textarea" placeholder="" />
        </n-form-item>
        <div class="form-btn">
          <n-button
            :attr-type="'submit'"
            type="primary"
            :loading="saveConstructorKeyStatus === 'pending'"
            >{{ formMode === 'add' ? 'Добавить' : 'Сохранить' }}</n-button
          >
        </div>
      </n-form>
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
  max-width: 240px;
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

.form-btn {
  display: flex;
  justify-content: flex-end;
}

.form-container {
  margin-top: 1rem;
}
</style>
