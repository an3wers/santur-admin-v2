<script setup lang="ts">
import {
  NForm,
  NFormItem,
  NInput,
  NSpace,
  NSpin,
  NCheckbox,
  NCheckboxGroup,
  NText,
  NAlert,
  NSwitch,
  NSelect,
  NCollapse,
  NCollapseItem,
  NButton,
  NImage,
  NUpload,
  type UploadFileInfo,
  useMessage
} from 'naive-ui'
import { MediaList, type OptionsType } from '@/entities/media'
import { usePresetFilterForm } from '../model/use-preset-filter-form'

const props = defineProps<{
  catalogItemId: number
  categoryName: string
  presetId?: number | null
}>()

const emit = defineEmits<{
  (e: 'onSaved'): void
  (e: 'onRemoved'): void
  (e: 'onCancel'): void
}>()

const {
  charFilters,
  selections,
  shortDescr,
  descr,
  loadStatus,
  saveStatus,
  removeStatus,
  isEditing,
  title,
  alias,
  onTitleInput,
  onAliasInput,
  location,
  locations,
  includeCategoryInTitle,
  isDuplicate,
  duplicatePreset,
  imageUrl,
  imageFile,
  imgExist,
  removeImage,
  removeImageStatus,
  open,
  save,
  remove,
  confirmRemove,
  isTitleManuallyEdited,
  isAliasManuallyEdited
} = usePresetFilterForm()

const message = useMessage()

onMounted(() => {
  open({
    catalogItemId: props.catalogItemId,
    categoryName: props.categoryName,
    presetId: props.presetId
  })
})

watch(saveStatus, (value) => {
  if (value === 'success') {
    message.success('Подфильтровая страница сохранена')
    emit('onSaved')
  }
  if (value === 'error') {
    message.error('Произошла ошибка при сохранении')
  }
})

watch(removeStatus, (value) => {
  if (value === 'success') {
    message.success('Подфильтровая страница удалена')
    emit('onRemoved')
  }
  if (value === 'error') {
    message.error('Произошла ошибка при удалении')
  }
})

/*
  IMAGE
*/

const MAX_SIZE_FILE = 20_000_000

const fileImageRef = ref<UploadFileInfo[]>([])

function imageChangeHandler({ file }: OptionsType) {
  if (file.status === 'removed') {
    fileImageRef.value = []
    imageFile.value = null
    return
  }

  if (file.file && file.file.size > MAX_SIZE_FILE) {
    message.error('Максимальный размер изображения 20 мб')
    fileImageRef.value = []
    imageFile.value = null
    return
  }

  fileImageRef.value = [{ ...file, status: 'finished' }]
  imageFile.value = file.file ?? null
}

async function removeImageHandler() {
  await removeImage()

  if (removeImageStatus.value === 'success') {
    fileImageRef.value = []
    message.success('Изображение удалено')
  }

  if (removeImageStatus.value === 'error') {
    message.error('Произошла ошибка при удалении изображения')
  }
}

function removeHandler() {
  if (!confirmRemove()) {
    return
  }
  return remove()
}

// Кнопки формы вынесены в футер модального окна родителя, поэтому действие
// сохранения и его состояния отдаём наружу через defineExpose.
const saveDisabled = computed(
  () =>
    !alias.value ||
    isDuplicate.value ||
    removeStatus.value === 'pending' ||
    removeImageStatus.value === 'pending'
)

defineExpose({
  save,
  saveStatus,
  saveDisabled,
  loadStatus,
  remove: removeHandler,
  removeStatus,
  isEditing
})

// Развёрнутые группы фильтров. При открытии формы раскрываем те группы, в которых
// уже есть отмеченные значения (режим редактирования), иначе — первую группу.
const expandedFilterGroups = ref<string[]>([])

watch(loadStatus, (value) => {
  if (value !== 'success') {
    return
  }
  const withSelected = charFilters.value
    .filter((charFilter) => selections.value[charFilter.name]?.length)
    .map((charFilter) => charFilter.name)

  expandedFilterGroups.value = withSelected.length
    ? withSelected
    : charFilters.value.slice(0, 1).map((charFilter) => charFilter.name)
})
</script>

<template>
  <div style="position: relative">
    <n-spin :show="loadStatus === 'pending'">
      <n-form>
        <n-form-item
          label="Заголовок страницы"
          feedback="Формируется автоматически, но можно отредактировать вручную"
        >
          <n-space vertical style="width: 100%">
            <n-space align="center">
              <n-switch v-model:value="includeCategoryInTitle" size="small" />
              <n-text> Добавить название категории </n-text>
            </n-space>
            <n-input :value="title" placeholder="Отметьте фильтры" @update:value="onTitleInput">
              <template #suffix>
                <span
                  class="input-suffix"
                  :class="isTitleManuallyEdited ? 'input-suffix--disabled' : 'input-suffix--active'"
                  >auto</span
                >
              </template>
            </n-input>
          </n-space>
        </n-form-item>
        <n-alert v-if="isDuplicate" type="warning" :show-icon="true" style="margin-bottom: 1.5rem">
          Подфильтровая страница с таким же набором фильтров уже существует в этой
          категории<template v-if="duplicatePreset"> — «{{ duplicatePreset.title }}»</template>.
        </n-alert>
        <n-form-item
          label="Alias"
          feedback="Формируется автоматически, но можно отредактировать вручную"
        >
          <n-input
            :value="alias"
            placeholder="Формируется автоматически"
            @update:value="onAliasInput"
          >
            <template #suffix>
              <span
                class="input-suffix"
                :class="isAliasManuallyEdited ? 'input-suffix--disabled' : 'input-suffix--active'"
                >auto</span
              >
            </template>
          </n-input>
        </n-form-item>
        <n-form-item label="Meta: description">
          <n-input v-model:value="shortDescr" type="textarea" placeholder="Введите description" />
        </n-form-item>
        <n-form-item label="Изображение">
          <n-space align="center">
            <template v-if="imgExist">
              <n-image width="100" height="60" object-fit="contain" :src="imageUrl" />
              <n-button
                tertiary
                type="error"
                size="small"
                :loading="removeImageStatus === 'pending'"
                @click="removeImageHandler"
                >Удалить</n-button
              >
            </template>

            <n-upload
              v-else
              :file-list="fileImageRef"
              :default-upload="false"
              :max="1"
              accept="image/*"
              @change="imageChangeHandler"
            >
              <n-button>Выбрать изображение</n-button>
            </n-upload>
          </n-space>
        </n-form-item>
        <n-form-item label="Описание">
          <AppEditor v-model="descr">
            <template #media-manager="{ onMediaSelect }">
              <media-list media-view-mode="select" @on-media-select="onMediaSelect"></media-list>
            </template>
          </AppEditor>
        </n-form-item>
        <n-form-item label="Расположение на странице">
          <n-select v-model:value="location" :options="locations" />
        </n-form-item>
        <n-text class="filter-label">Фильтры</n-text>
        <n-form-item :show-feedback="false">
          <n-collapse
            v-model:expanded-names="expandedFilterGroups"
            :trigger-areas="['main', 'arrow']"
            style="width: 100%"
          >
            <n-collapse-item
              v-for="charFilter in charFilters"
              :key="charFilter.nn"
              :name="charFilter.name"
            >
              <template #header>
                <n-text strong>{{ charFilter.name }}</n-text>
              </template>
              <template #header-extra>
                <n-text v-if="selections[charFilter.name]?.length" depth="3">
                  выбрано: {{ selections[charFilter.name]?.length }}
                </n-text>
              </template>
              <n-checkbox-group v-model:value="selections[charFilter.name]">
                <n-space item-style="display: flex;">
                  <n-checkbox
                    v-for="item in charFilter.items"
                    :key="item.nn"
                    :value="item.name"
                    :label="`${item.name} (${item.qtyRecords})`"
                  />
                </n-space>
              </n-checkbox-group>
            </n-collapse-item>
          </n-collapse>
        </n-form-item>
      </n-form>
    </n-spin>
  </div>
</template>

<style scoped>
.input-suffix {
  font-size: 0.625rem;
  text-transform: uppercase;
}

.input-suffix--active {
  color: green;
}

.input-suffix--disabled {
  color: inherit;
  text-decoration: line-through;
}

.filter-label {
  font-size: 1rem;
  font-weight: 600;
}
</style>
