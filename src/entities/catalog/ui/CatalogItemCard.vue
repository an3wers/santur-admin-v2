<script setup lang="ts">
import {
  NCard,
  NForm,
  type FormInst,
  NFormItem,
  NInput,
  NGrid,
  NFormItemGi,
  NInputGroup,
  NButton,
  NIcon,
  NSpace,
  useMessage
} from 'naive-ui'
import { Refresh } from '@vicons/tabler'
import type { CatalogItemModel } from '../model/catalog-types'
import { MediaList } from '@/entities/media'
import { useSaveCatalogItem } from '../model/use-save-catalog-item'

const model = defineModel<CatalogItemModel>('state', { required: true })

const files = ref<File[]>([])

defineProps<{
  isModified: boolean
}>()

defineEmits<{
  (e: 'onCreateAlias', value: string): void
}>()

const formRef = ref<FormInst | null>(null)

const formRules = {}

const { status: saveStatus, saveCatalogItem } = useSaveCatalogItem()

function saveHandler() {
  const { imgExist, ...data } = model.value
  saveCatalogItem({ ...data, files: files.value })
}

async function cancelHandler() {
  return navigateTo('/tntks')
}

const message = useMessage()

watchEffect(() => {
  if (saveStatus.value === 'success') {
    message.success('Категория успешно сохранена')
  }
  if (saveStatus.value === 'error') {
    message.error('Произошла ошибка при сохранении')
  }
})
</script>

<template>
  <n-card>
    <n-form ref="formRef" :model="model" :rules="formRules">
      <n-form-item label="Название" path="name">
        <n-input v-model:value="model.name" readonly placeholder="Введите название" />
      </n-form-item>
      <n-form-item label="Alias" path="alias">
        <n-input-group>
          <n-input v-model:value="model.alias" placeholder="Введите алиас" />
          <n-button ghost @click.stop="$emit('onCreateAlias', model.name)">
            <n-icon size="20px" :component="Refresh" />
          </n-button>
        </n-input-group>
      </n-form-item>
      <n-form-item label="Title" path="title">
        <n-input v-model:value="model.seotitle" placeholder="Введите title" />
      </n-form-item>
      <n-grid :cols="2" :x-gap="24" :y-gap="16">
        <n-form-item-gi label="Keywords" path="keywords">
          <n-input v-model:value="model.keywords" placeholder="Введите keywords" type="textarea" />
        </n-form-item-gi>
        <n-form-item-gi label="Description" path="description">
          <n-input
            v-model:value="model.shortDescr"
            readonly
            placeholder="Введите description"
            type="textarea"
          />
        </n-form-item-gi>
      </n-grid>
      <n-form-item label="Описание">
        <AppEditor v-model="model.descr">
          <template #media-manager="{ onMediaSelect }">
            <media-list media-view-mode="select" @on-media-select="onMediaSelect"></media-list>
          </template>
        </AppEditor>
      </n-form-item>
    </n-form>
    <template #action>
      <n-space justify="end">
        <n-button
          attr-type="button"
          @click="cancelHandler"
          :dashed="saveStatus === 'pending'"
          secondary
          type="primary"
          >Отменить</n-button
        >
        <n-button
          attr-type="button"
          @click="saveHandler"
          :loading="saveStatus === 'pending'"
          type="primary"
          >Сохранить</n-button
        >
      </n-space>
    </template>
  </n-card>
</template>
