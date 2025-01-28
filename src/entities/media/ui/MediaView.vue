<script setup lang="ts">
import { useDeleteMedia } from '../libs/useDeleteMedia'
import { useMediaView } from '../libs/useMediaView'
import type { MediaListItem } from '../model/media.types'
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
  NSpace
} from 'naive-ui'

const { mediaItem } = defineProps<{
  mediaItem: MediaListItem
}>()

const emits = defineEmits<{
  (e: 'onUpdate'): void
}>()

const formRef = ref()

const message = useMessage()

const { status, mediaViewModel, updateFileName, validateRules } = useMediaView({
  fileName: mediaItem?.fileName ?? ''
})
const { deleteFile, status: deleteStatus } = useDeleteMedia()

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
          object-fit="contain"
          height="200"
          :alt="mediaItem.fileName"
          :src="mediaItem.imgPath"
        />
      </n-grid-item>
      <n-grid-item>
        <n-form ref="formRef" :model="mediaViewModel" :rules="validateRules">
          <n-form-item label="Название файла" path="fileName">
            <n-input v-model:value="mediaViewModel.fileName" placeholder="Название файла" />
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

<style scoped></style>
