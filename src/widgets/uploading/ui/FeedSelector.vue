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
  useMessage
} from 'naive-ui'
import { Copy, ExternalLink } from '@vicons/tabler'
import { useCopyToClipboard } from '~/shared/libs/copy-to-clipboard'
import { useFeed } from '../model/use-feed'
import type { AsyncDataRequestStatus } from '#app'
import { useSaveConstructorKey } from '../model/use-save-constructor-key'

defineProps<{
  platformOptionsData: { value: string; label: string }[] | null
  platformOptionsStatus: AsyncDataRequestStatus
}>()

const emits = defineEmits<{
  (e: 'onUpdateFeed'): void
  (e: 'onAfterSuccessSaveKey'): void
}>()

const { platformLink, currentPlatform, selectPlatform, feedSettings } = useFeed()

const isOpenAddNewKeyModal = ref(false)

const openInNewTabHandler = () => {
  window.open(platformLink.value, '_blank')
}
const copyToClipboard = useCopyToClipboard()
const copyHandler = async () => {
  await copyToClipboard(platformLink.value)
}

function removeFeed() {
  message.info('Функционал еще не реализован')
}

const formRef = ref()

const newKeyFormValue = ref({
  name: '',
  key: ''
})

const formRules: FormRules = {
  name: {
    required: true,
    message: 'Введите название',
    trigger: 'blur'
  },
  key: {
    required: true,
    message: 'Введите ключ',
    trigger: 'blur'
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

    // TODO: добавить параметр name в saveConstructorKey
    // Валидация на бэкенде на уникальность name, key
    const { name, key } = newKeyFormValue.value

    await saveConstructorKey(key)

    if (saveConstructorKeyStatus.value === 'success') {
      newKeyFormValue.value.name = ''
      newKeyFormValue.value.key = ''
      message.success('Фид успешно сохранен')
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
        <div v-if="feedSettings.canAddNewKey" class="row-select__btn">
          <n-button tertiary type="primary" @click="isOpenAddNewKeyModal = true"
            >Добавить фид</n-button
          >
          <n-button tertiary type="error" @click="removeFeed">Удалить</n-button>
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
    </n-space>
    <n-modal
      style="width: 100%; max-width: 480px"
      preset="dialog"
      title="Добавить фид"
      :show="isOpenAddNewKeyModal"
      :show-icon="false"
      @esc="isOpenAddNewKeyModal = false"
      @close="isOpenAddNewKeyModal = false"
    >
      <div class="form-container"></div>
      <n-form
        ref="formRef"
        label-placement="left"
        label-width="auto"
        :model="newKeyFormValue"
        :rules="formRules"
        :disabled="saveConstructorKeyStatus === 'pending'"
        @submit.prevent="submitHandler"
      >
        <n-form-item path="name" label="Название">
          <n-input v-model:value="newKeyFormValue.name" placeholder="Введите название" />
        </n-form-item>
        <n-form-item path="key" label="Ключ">
          <n-input v-model:value="newKeyFormValue.key" placeholder="Введите ключ" />
        </n-form-item>
        <div class="form-btn">
          <n-button
            :attr-type="'submit'"
            type="primary"
            :loading="saveConstructorKeyStatus === 'pending'"
            >Добавить</n-button
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
