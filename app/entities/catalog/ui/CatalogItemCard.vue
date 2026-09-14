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
  NImage,
  NText,
  useMessage
} from 'naive-ui'
import { Refresh } from '@vicons/tabler'
import type { CatalogItemModel } from '../model/catalog-types'
import { MediaList } from '@/entities/media'
import { useSaveCatalogItem } from '../model/use-save-catalog-item'
import { useRemoveCatalogItemImage } from '../model/use-remove-catalog-item-image'
import type {
  ImageSquareEditorResult,
  SquareTransform
} from '~/shared/ui/image-square-editor/types'

const model = defineModel<CatalogItemModel>('state', { required: true })

defineProps<{
  isModified: boolean
}>()

const emits = defineEmits<{
  (e: 'onCreateAlias', value: string): void
  (e: 'onAfterSave'): void
}>()

const formRef = ref<FormInst | null>(null)

const formRules = {}

const message = useMessage()

const { status: saveStatus, saveCatalogItem } = useSaveCatalogItem()

async function saveHandler() {
  const { imgExist, imgUrl, ...data } = model.value

  const files = imageDraft.value ? [imageDraft.value.file] : []

  const result = await saveCatalogItem({ ...data, files })

  if (result.ok) {
    resetImageDraft()
    message.success('Категория успешно сохранена')
    emits('onAfterSave')
    return
  }

  message.error(result.error.message || 'Произошла ошибка при сохранении')
}

async function cancelHandler() {
  return navigateTo('/tntks')
}

/*
  IMAGE
*/

const IMAGE_SIZE = 500

type ImageDraft = {
  file: File
  sourceFile: File
  transform: SquareTransform
  previewUrl: string
}

const imageEditorShow = ref(false)
const imageEditorInitial = shallowRef<{ file: File; transform: SquareTransform } | null>(null)
const imageDraft = shallowRef<ImageDraft | null>(null)

function openImageEditor(fromDraft = false) {
  imageEditorInitial.value =
    fromDraft && imageDraft.value
      ? { file: imageDraft.value.sourceFile, transform: imageDraft.value.transform }
      : null
  imageEditorShow.value = true
}

function resetImageDraft() {
  if (imageDraft.value) URL.revokeObjectURL(imageDraft.value.previewUrl)
  imageDraft.value = null
}

function applyImageHandler({ file, sourceFile, transform }: ImageSquareEditorResult) {
  resetImageDraft()
  imageDraft.value = { file, sourceFile, transform, previewUrl: URL.createObjectURL(file) }
}

onBeforeUnmount(resetImageDraft)

const { removeImage, status: removeImageStatus } = useRemoveCatalogItemImage()

async function removeImageHandler() {
  const { imgExist, imgUrl, ...data } = model.value

  const result = await removeImage(data)

  if (result.ok) {
    model.value.imgExist = false
    model.value.imgUrl = ''
    message.success('Изображение удалено')
    return
  }

  message.error(result.error.message || 'Произошла ошибка при удалении изображения')
}
</script>

<template>
  <n-form ref="formRef" :model="model" :rules="formRules">
    <n-space vertical size="large">
      <n-card>
        <n-form-item label="Название" path="name">
          <n-input v-model:value="model.name" readonly placeholder="Введите название" />
        </n-form-item>
        <n-form-item label="Alias" path="alias">
          <n-input-group>
            <n-input v-model:value="model.alias" placeholder="Введите алиас" />
            <n-button
              ghost
              :disabled="model.name.length === 0"
              @click.stop="$emit('onCreateAlias', model.name)"
            >
              <n-icon size="20px" :component="Refresh" />
            </n-button>
          </n-input-group>
        </n-form-item>
        <n-form-item label="Изображение">
          <n-space align="center">
            <template v-if="imageDraft">
              <n-image width="80" height="80" object-fit="contain" :src="imageDraft.previewUrl" />
              <n-button size="small" secondary @click="openImageEditor(true)">Изменить</n-button>
              <n-button size="small" tertiary @click="resetImageDraft">Сбросить</n-button>
              <n-text depth="3">
                {{
                  model.imgExist
                    ? 'Заменит текущее изображение при сохранении'
                    : 'Будет загружено при сохранении'
                }}
              </n-text>
            </template>

            <template v-else-if="model.imgExist">
              <n-image width="100" height="60" object-fit="contain" :src="model.imgUrl" />
              <n-button size="small" secondary @click="openImageEditor()">Заменить</n-button>
              <n-button
                tertiary
                type="error"
                size="small"
                :loading="removeImageStatus === 'pending'"
                @click="removeImageHandler"
                >Удалить</n-button
              >
            </template>

            <n-button v-else @click="openImageEditor()">Выбрать изображение</n-button>
          </n-space>

          <ImageSquareEditorModal
            v-model:show="imageEditorShow"
            title="Подготовка изображения категории"
            :subtitle="model.name"
            :output-size="IMAGE_SIZE"
            :initial-file="imageEditorInitial?.file"
            :initial-transform="imageEditorInitial?.transform"
            @apply="applyImageHandler"
          />
        </n-form-item>
        <n-form-item label="Описание">
          <AppEditor v-model="model.descr">
            <template #media-manager="{ onMediaSelect }">
              <media-list media-view-mode="select" @on-media-select="onMediaSelect"></media-list>
            </template>
          </AppEditor>
        </n-form-item>
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
      <n-card title="Метатеги">
        <n-form-item label="Title" path="title">
          <n-input v-model:value="model.seotitle" placeholder="Введите title" />
        </n-form-item>
        <n-grid :cols="2" :x-gap="24" :y-gap="16">
          <n-form-item-gi label="Keywords" path="keywords">
            <n-input
              v-model:value="model.keywords"
              placeholder="Введите keywords"
              type="textarea"
            />
          </n-form-item-gi>
          <n-form-item-gi label="Description" path="description">
            <n-input
              v-model:value="model.shortDescr"
              placeholder="Введите description"
              type="textarea"
            />
          </n-form-item-gi>
        </n-grid>
      </n-card>
    </n-space>
  </n-form>
</template>
