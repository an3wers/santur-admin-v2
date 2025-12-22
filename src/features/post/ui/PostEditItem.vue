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
  NIcon
} from 'naive-ui'
import type { PostItem } from '../model/types'
import { useNavStore } from '~/shared/navigation'
import { useRemovePost } from '../model/use-remove-post'
import { useSavePost } from '../model/use-save-post'
import { formattedDateForServer } from '@/entities/post'
import { Check } from '@vicons/tabler'

import { MediaList } from '@/entities/media'

const model = defineModel<PostItem>('state', { required: true })

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
      published: model.value.published ? 'Y' : 'N',
      extFields: model.value.extFields,
      alias: model.value.alias,
      date: formattedDateForServer(new Date(model.value.dateTimestamp))
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

<style scoped></style>
