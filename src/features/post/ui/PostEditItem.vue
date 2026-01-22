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
import { useNavStore } from '~/shared/navigation'
import { useRemovePost } from '../model/use-remove-post'
import { useSavePost } from '../model/use-save-post'
import type { PostItem } from '@/entities/post'
import { Check, Trash, Plus } from '@vicons/tabler'
import { MediaList } from '@/entities/media'
import { usePostEditItem } from '../model/use-edit-post-item'

const { ownerId, postItem = undefined } = defineProps<{
  ownerId: number
  postItem?: PostItem
}>()

const {
  postItem: postItemModel,
  isModified,
  previewImage,
  previewImageName,
  removeImage
} = usePostEditItem(ownerId, postItem)

const handleUploadChange = (file: UploadFileInfo) => {
  if (file.file) {
    previewImage.value = file.file
    previewImageName.value = file.name
    postItemModel.value.previewImgUrl = URL.createObjectURL(file.file)
  }
}

const dateFormat = 'dd-MM-yyyy'

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
  description: {
    required: false,
    message: 'Добавьте описание',
    trigger: ['change', 'blur']
  }
}

const message = useMessage()

function cancelHandler() {
  if (isModified.value && !confitmation('cancel')) return

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

  await removePost(postItemModel.value.id)

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
    console.log('savePost', postItemModel.value)
    await savePost({ ...postItemModel.value, previewImage: previewImage.value })

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
</script>

<template>
  <n-form ref="formRef" :rules="formRules" :model="postItemModel">
    <n-space vertical size="large" style="width: 100%">
      <n-card :title="postItemModel.id ? 'Редактировать запись' : 'Создать запись'">
        <n-form-item label="Заголовок" path="title">
          <n-input v-model:value="postItemModel.title" placeholder="Введите заголовок" />
        </n-form-item>
        <n-form-item label="Категория" path="categoryId">
          <n-select
            :disabled="postItemModel.id !== 0"
            v-model:value="postItemModel.categoryId"
            :options="categoryOptions"
          ></n-select>
        </n-form-item>
        <n-form-item label="Описание" path="description">
          <n-input
            type="textarea"
            v-model:value="postItemModel.description"
            placeholder="Введите короткое описание"
          />
        </n-form-item>
        <n-form-item label="Изображение" path="previewImage">
          <div v-if="!postItemModel.previewImgUrl">
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
                  <n-icon size="30" :depth="3">
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

          <div class="image-preview" v-else>
            <div class="image-preview-img">
              <n-image
                :src="postItemModel.previewImgUrl"
                width="120"
                height="120"
                object-fit="contain"
                preview-disabled
              />
            </div>
            <n-button
              class="image-preview-remove"
              size="small"
              @click="removeImage"
              type="error"
              secondary
              circle
            >
              <n-icon size="16px">
                <Trash />
              </n-icon>
            </n-button>
          </div>
        </n-form-item>
        <n-form-item label="Содержание">
          <app-editor v-model="postItemModel.content">
            <template #media-manager="{ onMediaSelect }">
              <media-list media-view-mode="select" @on-media-select="onMediaSelect"></media-list>
            </template>
          </app-editor>
        </n-form-item>
        <n-form-item label="Дата публикации">
          <n-space align="center">
            <n-date-picker
              :format="dateFormat"
              v-model:value="postItemModel.timestamp"
              type="date"
              :first-day-of-week="0"
            />
            <n-switch v-model:value="postItemModel.published" />
            <span>Опубликовано</span>
          </n-space>
        </n-form-item>
        <template #action>
          <n-space justify="space-between">
            <n-button
              v-show="postItemModel.id"
              secondary
              type="error"
              :disabled="removeStatus === 'pending'"
              :loading="removeStatus === 'pending'"
              @click="removeHandler"
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
      <n-card v-if="postItemModel.extFields.length" title="Дополнительные поля">
        <n-form-item
          v-for="field in postItemModel.extFields"
          :key="field.title"
          :label="field.title"
        >
          <n-input v-model:value="field.value" placeholder="Введите значение" />
        </n-form-item>
      </n-card>
      <n-card title="Мета-теги">
        <n-form-item label="Title" path="seotitle">
          <n-input v-model:value="postItemModel.seotitle" placeholder="Введите seotitle" />
        </n-form-item>
        <n-form-item label="Keywords" path="keywords">
          <n-input v-model:value="postItemModel.keywords" placeholder="Введите keywords" />
        </n-form-item>
        <n-form-item label="Description">
          <n-input
            type="textarea"
            v-model:value="postItemModel.shortDescr"
            placeholder="Введите короткое описание"
          />
        </n-form-item>

      </n-card>
    </n-space>
  </n-form>
</template>

<style scoped>
.hidden-file-input {
  display: none;
}

.image-preview {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.image-preview-img {
  border-radius: 4px;
  border: 1px solid #c1c0c0;
  padding: 4px;
  display: flex;
  flex-direction: column;
  justify-items: center;
}
</style>
