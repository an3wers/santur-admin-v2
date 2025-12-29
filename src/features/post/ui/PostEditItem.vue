<script setup lang="ts">
import {
  useMessage,
  type FormInst,
  type FormItemRule,
  NForm,
  NSpace,
  NCard,
  NFormItem,
  NSelect,
  NInput,
  NDatePicker,
  NSwitch,
  NButton,
  NIcon,
  NUpload,
  NUploadDragger,
  NText,
  NP,
  NImage,
  type UploadFileInfo
} from 'naive-ui'
import type { PostItem } from '../model/types'
import { useNavStore } from '~/shared/navigation'
import { useRemovePost } from '../model/use-remove-post'
import { useSavePost } from '../model/use-save-post'
import { formattedDateForServer } from '@/entities/post'
import { Check, X, Plus } from '@vicons/tabler'

import { MediaList } from '@/entities/media'

const model = defineModel<PostItem>('state', { required: true })

//const previewImage = ref(null)
const previewImageUrl = ref('')
const previewImageName = ref('')

const handleUploadChange = (file: UploadFileInfo) => {
  if (file.file) {
    model.value.previewImage = file.file
    previewImageName.value = file.name
    console.log('file.', file)
    previewImageUrl.value = URL.createObjectURL(file.file)
  }
}

const removeImage = () => {
  model.value.previewImage = undefined
  previewImageUrl.value = ''
  previewImageName.value = ''
}

const removeLoadedImage = () => {
  model.value.previewImgUrl = ''
}

const dateFormat = 'dd-MM-yyyy'

const { ownerId, isModified } = defineProps<{
  ownerId: number
  isModified: boolean
}>()

const navStore = useNavStore()

const categoryOptions = computed(() => {
  return navStore.currentNavigationMenu?.items.map((item) => {
    if (item.id === 0) {
      return { value: item.id, label: 'Все', disabled: true }
    }
    return { value: item.id, label: item.label }
  })
})

const formRef = ref<FormInst | null>(null)

const formRules = {
  title: {
    required: true,
    message: 'Добавьте заголовок',
    trigger: ['change', 'blur']
  },
  categoryId: {
    required: true,
    message: 'Выберите категорию',
    trigger: ['change', 'blur'],
    validator: (_rule: FormItemRule, value: any) => value !== 0
  },
  descr: {
    required: false,
    message: 'Добавьте описание',
    trigger: ['change', 'blur']
  }
}

const message = useMessage()

function cancelHandler() {
  if (!model.value) return

  if (isModified && !confitmation('cancel')) return

  return navigateTo({ path: `/banners/${ownerId}` })
}

function confitmation(action: 'delete' | 'cancel') {
  let message = ''

  switch (action) {
    case 'cancel':
      message = 'При отмене изменения не будут сохранены'
      break
    case 'delete':
      message = 'Вы действительно хотите удалить запись?'
      break
    default:
      message = 'Подтвердить?'
      break
  }

  const isConfirm = confirm(message)
  return isConfirm
}

const { removePost, status: removeStatus } = useRemovePost()
async function removeHandler() {
  if (!confitmation('delete')) return

  await removePost(model.value.id)

  if (removeStatus.value === 'success') {
    message.success('Запись удалена')
    return navigateTo({ path: `/posts/${ownerId}` })
  }
}
const { savePost, status: saveSatus } = useSavePost()
async function saveHandler() {
  try {
    const errors = await formRef.value?.validate()

    if (errors?.warnings) {
      throw new Error('Проверьте корректность заполнения полей')
    }
    await savePost({
      id: model.value.id,
      title: model.value.title,
      descr: model.value.descr,
      content: model.value.content,
      categoryId: model.value.categoryId,
      published: model.value.published,
      extFields: model.value.extFields,
      alias: model.value.alias,
      date: formattedDateForServer(new Date(model.value.dateTimestamp)),
      dateTimestamp: model.value.dateTimestamp,
      previewImgUrl: model.value.previewImgUrl,
      ...(model.value.previewImage && { previewImage: model.value.previewImage })
    })
    if (saveSatus.value === 'error') {
      throw new Error('Ошибка сохранения')
    }

    if (saveSatus.value === 'success') {
      message.success('Запись сохранена')
      return navigateTo({ path: `/posts/${ownerId}` })
    }
  } catch (error) {
    if (Array.isArray(error)) {
      error.forEach((err) => {
        message.error(err[0].message)
      })
    } else {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)
      message.error(errorMessage)
    }
  }
}

console.log('model.value', model.value)
</script>

<template>
  <n-form ref="formRef" :rules="formRules" :model="model">
    <n-space vertical size="large" style="width: 100%">
      <n-card :title="model.id ? 'Редактировать запись' : 'Создать запись'">
        <n-form-item label="Заголовок" path="title">
          <n-input v-model:value="model.title" placeholder="Введите заголовок" />
        </n-form-item>
        <n-form-item label="Категория" path="categoryId">
          <n-select
            :disabled="model.id !== 0"
            v-model:value="model.categoryId"
            :options="categoryOptions"
          ></n-select>
        </n-form-item>
        <n-form-item label="Описание" path="descr">
          <n-input
            type="textarea"
            v-model:value="model.descr"
            placeholder="Введите короткое описание"
          />
        </n-form-item>
        <n-form-item label="Изображение" path="previewImage">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; width: 100%">
            <div>
              <n-upload
                style="height: 100%"
                :show-file-list="false"
                directory-dnd
                @change="(payload) => handleUploadChange(payload.file)"
              >
                <n-upload-dragger>
                  <div
                    style="
                      display: flex;
                      flex-direction: column;
                      justify-items: center;
                      align-items: center;
                    "
                  >
                    <n-icon size="48" :depth="3">
                      <Plus />
                    </n-icon>
                    <n-text style="font-size: 14px"> Нажмите или перенесите сюда файл </n-text>
                    <n-p depth="3" style="margin: 8px 0 0 0; font-size: 12px">
                      .jpg, .jpeg, .png, .webp
                    </n-p>
                  </div>
                </n-upload-dragger>
              </n-upload>
            </div>

            <!-- Правая колонка: Превью -->
            <div style="display: flex; flex-direction: column">
              <n-button
                v-if="previewImageUrl"
                size="tiny"
                @click="removeImage"
                type="error"
                text
                style="align-self: end"
              >
                <NIcon size="24px"><X /></NIcon>
              </n-button>

              <div v-if="previewImageUrl" style="text-align: center">
                <n-image
                  :src="previewImageUrl"
                  width="120"
                  height="120"
                  object-fit="contain"
                  preview-disabled
                />
              </div>
              <n-button
                v-if="model.previewImgUrl && !previewImageUrl"
                size="tiny"
                @click="removeLoadedImage"
                type="error"
                text
                style="align-self: end"
              >
                <NIcon size="24px"><X /></NIcon>
              </n-button>
              <div v-if="model.previewImgUrl && !previewImageUrl" style="text-align: center">
                <n-image
                  :src="model.previewImgUrl"
                  width="120"
                  height="120"
                  object-fit="contain"
                  preview-disabled
                />
              </div>

              <div
                v-if="!model.previewImgUrl && !previewImageUrl"
                style="text-align: center; padding: 40px 0; color: #ccc"
              >
                <n-icon size="48">
                  <ImageIcon />
                </n-icon>
                <n-text depth="3" style="display: block; margin-top: 8px"> Нет изображения </n-text>
              </div>
            </div>
          </div>
        </n-form-item>
        <n-form-item label="Содержание">
          <app-editor v-model="model.content">
            <!-- TODO: Решить проблему с нарушением FSD -->
            <template #media-manager="{ onMediaSelect }">
              <media-list media-view-mode="select" @on-media-select="onMediaSelect"></media-list>
            </template>
          </app-editor>
        </n-form-item>
        <n-form-item label="Дата публикации">
          <n-space align="center">
            <n-date-picker
              :format="dateFormat"
              v-model:value="model.dateTimestamp"
              type="date"
              :first-day-of-week="0"
            />
            <n-switch v-model:value="model.published" />
            <span>Опубликовано</span>
          </n-space>
        </n-form-item>
        <template #action>
          <n-space justify="space-between">
            <n-button
              v-show="model.id"
              @click="removeHandler"
              :disabled="removeStatus === 'pending'"
              :loading="removeStatus === 'pending'"
              secondary
              type="error"
              >Удалить</n-button
            >
            <n-space>
              <n-button
                @click="cancelHandler"
                secondary
                type="primary"
                :disabled="saveSatus === 'pending' || !isModified"
                >Отменить</n-button
              >
              <n-button
                @click="saveHandler"
                :disabled="saveSatus === 'pending' || !isModified"
                :loading="saveSatus === 'pending'"
                :type="!isModified ? 'success' : 'primary'"
              >
                <template v-if="!isModified" #icon>
                  <n-icon size="20px">
                    <Check />
                  </n-icon>
                </template>
                {{ !isModified ? 'Сохранено' : 'Сохранить' }}
              </n-button>
            </n-space>
          </n-space>
        </template>
      </n-card>
      <n-card v-if="model.extFields.length" title="Дополнительные поля">
        <n-form-item v-for="field in model.extFields" :key="field.title" :label="field.title">
          <n-input v-model:value="field.value" placeholder="Введите значение" />
        </n-form-item>
      </n-card>
    </n-space>
  </n-form>
</template>

<style scoped>
.hidden-file-input {
  display: none;
}
</style>
