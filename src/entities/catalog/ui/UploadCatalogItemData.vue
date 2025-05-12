<script setup lang="ts">
import {
  NCard,
  NP,
  NButton,
  NUpload,
  NSpace,
  useMessage,
  type UploadFileInfo,
  type UploadInst
} from 'naive-ui'
import { useCatalogApi } from '../api/catalog-api'

const emit = defineEmits<{
  (e: 'onCancel'): void
  (e: 'onUploaded'): void
  (e: 'onSaved'): void
}>()

const uploadFiles = ref<UploadFileInfo[]>([])

function checkFileSize(file: UploadFileInfo['file']) {
  if (!file) return false
  return file?.size < 5 * 1024 * 1024
}

function checkFileIsExcel(file: UploadFileInfo['file']) {
  if (!file) return false
  const result = /\.(xls|xlsx|XLS|XLSX)$/i.test(file.name)
  return result
}

function handleFile(payload: {
  file: UploadFileInfo
  fileList: Array<UploadFileInfo>
  event?: Event
}) {
  if (!payload.file.file || payload.file.status === 'removed' || payload.file.status === 'error') {
    uploadFiles.value = []
    return
  }

  if (!checkFileSize(payload.file.file)) {
    message.error('Слишком большой размер файла')
  }

  if (!checkFileIsExcel(payload.file.file)) {
    message.error('Некорректный формат файла')
  }
  uploadFiles.value = [payload.file]
  emit('onUploaded')
}

const uploadRef = ref<UploadInst | null>(null)
const uploadStatus = ref<ProcessStatus>('idle')

const api = useCatalogApi()
const message = useMessage()

const saveDisable = computed(() => !uploadFiles.value.length)

async function saveHandler() {
  try {
    uploadStatus.value = 'pending'
    const formData = new FormData()
    if (!uploadFiles.value[0].file) return
    formData.append('files', uploadFiles.value[0].file)
    await api.uploadCategoryDescriptionFromXls(formData)
    uploadStatus.value = 'success'
    message.success('Файл успешно загружен')
    uploadRef.value?.clear()
    uploadFiles.value = []
    emit('onSaved')
  } catch (error) {
    uploadStatus.value = 'error'
    console.error(error)
    message.error('При загрузки файла произошла ошибка')
  }
}
</script>

<template>
  <n-card>
    <n-space vertical>
      <n-upload
        ref="uploadRef"
        accept=".xls,.xlsx"
        :format="['xls', 'xlsx']"
        :file-list="uploadFiles"
        @change="handleFile"
      >
        <n-button size="large" secondary type="primary">Выбрать файл</n-button>
      </n-upload>
      <n-p>Файл в формате xls или xlsx.</n-p>
      <nuxt-link to="/examples/upload_catalog_example.xlsx" external>Пример файла</nuxt-link>
    </n-space>
    <template #action>
      <div class="btn-group">
        <n-button
          attr-type="button"
          type="success"
          :disabled="saveDisable"
          :loading="uploadStatus === 'pending'"
          @click="saveHandler"
          >Загрузить</n-button
        >
      </div>
    </template>
  </n-card>
</template>

<style scoped>
.btn-group {
  display: flex;
  justify-content: flex-end;
}
</style>
