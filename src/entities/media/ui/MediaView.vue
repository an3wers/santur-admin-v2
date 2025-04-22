<script setup lang="ts">
import { useDeleteMedia } from '../model/use-delete-media'
import { useMediaView } from '../model/use-media-view'
import type { MediaListItem } from '../model/media-types'
import {
  useMessage,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NButton,
  NGrid,
  NGridItem,
  NImage,
  NSpace,
  NIcon,
  NInputGroup
} from 'naive-ui'
import { checkIsImage } from '../libs/check-is-image'
import { File, Copy } from '@vicons/tabler'
import { useCopyToClipboard } from '~/shared/libs/copy-to-clipboard'

const { mediaItem } = defineProps<{
  mediaItem: MediaListItem
}>()

const emits = defineEmits<{
  (e: 'onUpdate'): void
}>()

const formRef = ref()

const message = useMessage()

const { status, mediaViewModel, updateFileName, validateRules } = useMediaView({
  fileName: mediaItem?.fileName ?? '',
  imgPath: mediaItem?.imgPath ?? ''
})

const { deleteFile, status: deleteStatus } = useDeleteMedia()

const copyToClipboard = useCopyToClipboard()

async function updateFileNameHandler(mediaId: number) {
  try {
    formRef.value?.validate((e: any) => {
      if (e) {
        throw new Error('Проверьте корректность заполнения полей')
      }
    })

    await updateFileName(mediaId.toString())

    if (status.value === 'success') {
      emits('onUpdate')
    }

    if (status.value === 'error') {
      throw new Error('Что то пошло не так')
    }
  } catch (error) {
    const text = error instanceof Error ? error.message : 'Что-то пошло не так'
    message.error(text)
  }
}

async function deleteHandler(mediaId: number) {
  await deleteFile(mediaId.toString())

  if (deleteStatus.value === 'success') {
    emits('onUpdate')
  }

  if (deleteStatus.value === 'error') {
    message.error('Что-то пошло не так')
  }
}
</script>

<template>
  <n-card>
    <n-grid :x-gap="12" :y-gap="8" :cols="2">
      <n-grid-item>
        <n-image
          v-if="checkIsImage(mediaItem.ext)"
          object-fit="contain"
          height="200"
          :alt="mediaItem.fileName"
          :src="mediaItem.imgPath"
        />
        <div v-else class="media-default">
          <n-icon size="64px" depth="3">
            <File />
          </n-icon>
        </div>
      </n-grid-item>
      <n-grid-item>
        <n-form ref="formRef" :model="mediaViewModel" :rules="validateRules">
          <n-form-item label="Название файла" path="fileName">
            <n-input-group>
              <n-input v-model:value="mediaViewModel.fileName" placeholder="Название файла">
              </n-input>
              <n-button ghost @click.stop="copyToClipboard(mediaViewModel.fileName)">
                <n-icon size="20px" :component="Copy" />
              </n-button>
            </n-input-group>
          </n-form-item>
          <n-form-item label="Ссылка на файл" path="filePath">
            <n-input-group>
              <n-input
                v-model:value="mediaViewModel.filePath"
                placeholder="Ссылка на файла"
                :readonly="true"
              />
              <n-button ghost @click.stop="copyToClipboard(mediaViewModel.filePath)">
                <n-icon size="20px" :component="Copy" />
              </n-button>
            </n-input-group>
          </n-form-item>
        </n-form>
      </n-grid-item>
    </n-grid>

    <template #action>
      <n-space justify="space-between">
        <n-button attr-type="button" type="error" secondary @click="deleteHandler(mediaItem.id)"
          >Удалить</n-button
        >
        <n-button attr-type="button" type="primary" @click="updateFileNameHandler(mediaItem.id)"
          >Сохранить</n-button
        >
      </n-space>
    </template>
  </n-card>
</template>

<style scoped>
.media-default {
  height: 200px;
  width: 100%;
  background-color: var(--gray-100);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
