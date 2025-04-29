<script setup lang="ts">
import { useNavStore } from '~/shared/navigation'
import type { BannerItem } from '../model/banner-types'
import {
  NCard,
  NForm,
  NFormItem,
  NP,
  NInput,
  NText,
  NButton,
  NSelect,
  type FormInst,
  type FormItemRule,
  useMessage,
  NSpace,
  NIcon,
  NInputGroup
} from 'naive-ui'
import { useSaveBanner } from '../model/use-save-banner'
import { useRemoveBanner } from '../model/use-remove-banner'
import { Check, Copy } from '@vicons/tabler'
import { useCopyToClipboard } from '~/shared/libs/copy-to-clipboard'

const model = defineModel<BannerItem>('state')

// TODO: ownertId -> ownerId
const { isModified, ownertId } = defineProps<{
  isModified: boolean
  ownertId: number
}>()

defineEmits<{
  (e: 'onSelectMedia'): void
  (e: 'onRemoveMedia'): void
}>()

const copyToClipboard = useCopyToClipboard()
const navStore = useNavStore()

const categoryOptions = computed(() => {
  return navStore.currentNavigationMenu?.items.map((item) => {
    if (item.id === 0) {
      return { value: item.id, label: 'Все баннеры', disabled: true }
    }
    return { value: item.id, label: item.label }
  })
})

const formRef = ref<FormInst | null>(null)
const formRules = {
  name: {
    required: true,
    message: 'Добавьте название баннера',
    trigger: ['change', 'blur']
  },
  imgPath: {
    required: true,
    message: 'Добавьте изображение',
    trigger: ['change', 'blur']
  },
  categoryId: {
    required: true,
    message: 'Выберите категорию',
    trigger: ['change', 'blur'],
    validator: (_rule: FormItemRule, value: any) => value !== 0
  }
}

const message = useMessage()
const { save, status: saveStatus } = useSaveBanner()

async function saveHandler() {
  try {
    const errors = await formRef.value?.validate()

    if (errors?.warnings) {
      throw new Error('Проверьте корректность заполнения полей')
    }

    if (!model.value) return

    await save({
      categoryId: model.value.categoryId,
      id: model.value.id,
      app: navStore.activeResource,
      descr: '',
      imgPath: model.value.imgPath,
      link: model.value.link,
      name: model.value.name,
      nn: model.value.nn
    })

    if (saveStatus.value === 'error') {
      throw new Error('Ошибка сохранения')
    }

    if (saveStatus.value === 'success') {
      message.success('Баннер сохранен')
      return navigateTo({ path: `/banners/${ownertId}` })
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

const { remove, status: removeStatus } = useRemoveBanner()

async function removeHandler() {
  if (!model.value) return

  if (!confitmation('delete')) return

  await remove(model.value.id)

  if (removeStatus.value === 'success') {
    return navigateTo({ path: `/banners/${ownertId}` })
  }
}

function cancelHandler() {
  if (!model.value) return

  if (isModified && !confitmation('cancel')) return

  return navigateTo({ path: `/banners/${ownertId}` })
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
</script>

<template>
  <n-card>
    <n-form ref="formRef" :model="model" :rules="formRules" v-if="model">
      <n-form-item label="Заголовок" path="name">
        <n-input v-model:value="model.name" placeholder="Введите заголовок" />
      </n-form-item>

      <n-form-item label="Категория" path="categoryId">
        <n-select v-model:value="model.categoryId" :options="categoryOptions"></n-select>
      </n-form-item>

      <div class="image-container">
        <div class="image-container__preview">
          <img v-if="model?.imgPath" :src="model.imgPath" />
          <div v-else class="image-container__preview-empty">
            <n-text depth="3">Изображение не выбрано</n-text>
          </div>
          <n-p class="text-info" v-if="model?.categoryId === 30"
            >Рекомендуемый размер: 1505×404 px</n-p
          >
          <n-p class="text-info" v-if="model?.categoryId === 29"
            >Рекомендуемый размер: 1505×220 px</n-p
          >
        </div>
        <div class="image-container__controls">
          <n-form-item label="Ссылка на изображение" path="imgPath">
            <n-input-group>
              <n-input
                v-model:value="model.imgPath"
                :readonly="true"
                placeholder="Cсылка на изображение"
              />
              <n-button ghost @click.stop="copyToClipboard(model.imgPath)">
                <n-icon size="20px" :component="Copy" />
              </n-button>
            </n-input-group>
          </n-form-item>
          <div class="image-container__btns-select">
            <n-button @click="$emit('onSelectMedia')" type="primary">Выбрать изображение</n-button>
            <n-button secondary type="primary" @click="$emit('onRemoveMedia')">Очистить</n-button>
          </div>
          <n-form-item label="Ссылка для перехода" path="link">
            <n-input-group>
              <n-input v-model:value="model.link" placeholder="https://santur.ru/about/company" />
              <n-button ghost @click.stop="copyToClipboard(model.link)">
                <n-icon size="20px" :component="Copy" />
              </n-button>
            </n-input-group>
          </n-form-item>
        </div>
      </div>
    </n-form>
    <template #action>
      <n-space justify="space-between">
        <n-button
          v-show="model?.id"
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
            :disabled="saveStatus === 'pending' || !isModified"
            type="primary"
            >Отменить</n-button
          >
          <n-button
            @click="saveHandler"
            :disabled="saveStatus === 'pending' || !isModified"
            :loading="saveStatus === 'pending'"
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
</template>

<style scoped lang="scss">
.image-container {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;

  &__preview {
    flex-basis: 17rem;
    flex-shrink: 0;

    img {
      width: 100%;
      max-height: 17rem;
      object-fit: cover;
    }

    &-empty {
      width: 100%;
      height: 10rem;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      background-color: #f1f5f9;
    }
  }

  &__controls {
    flex-grow: 1;
  }

  &__btns-select {
    margin-bottom: 1.5rem;

    > :not(:last-child) {
      margin-right: 0.75rem;
    }
  }

  .text-info {
    font-size: 13px;
  }
}
</style>
