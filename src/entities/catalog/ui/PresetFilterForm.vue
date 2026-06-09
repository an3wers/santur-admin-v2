<script setup lang="ts">
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NSpace,
  NSpin,
  NButton,
  NCheckbox,
  NCheckboxGroup,
  NText,
  NAlert,
  NSwitch,
  useMessage
} from 'naive-ui'
import { MediaList } from '@/entities/media'
import { usePresetFilterForm } from '../model/use-preset-filter-form'

const props = defineProps<{
  catalogItemId: number
  categoryName: string
  presetId?: number | null
}>()

const emit = defineEmits<{
  (e: 'onSaved'): void
  (e: 'onCancel'): void
}>()

const {
  charFilters,
  selections,
  shortDescr,
  descr,
  loadStatus,
  saveStatus,
  generatedTitle,
  generatedAlias,
  includeCategoryInTitle,
  isDuplicate,
  duplicatePreset,
  open,
  save
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

const saveDisabled = computed(() => !generatedAlias.value)
</script>

<template>
  <n-card>
    <n-spin :show="loadStatus === 'pending'">
      <n-form>
        <n-form-item label="Заголовок страницы" feedback="Формируется автоматически">
          <n-space vertical style="width: 100%">
            <n-space align="center">
              <n-switch v-model:value="includeCategoryInTitle" size="small" />
              <n-text> Добавить название категории </n-text>
            </n-space>
            <n-input :value="generatedTitle" readonly placeholder="Отметьте фильтры" />
          </n-space>
        </n-form-item>
        <n-alert v-if="isDuplicate" type="warning" :show-icon="true" style="margin-bottom: 1.5rem">
          Подфильтровая страница с таким же набором фильтров уже существует в этой
          категории<template v-if="duplicatePreset"> — «{{ duplicatePreset.title }}»</template>.
        </n-alert>
        <n-form-item label="Alias" feedback="Формируется автоматически">
          <n-input :value="generatedAlias" readonly placeholder="Формируется автоматически" />
        </n-form-item>
        <n-form-item label="Meta: description">
          <n-input v-model:value="shortDescr" type="textarea" placeholder="Введите description" />
        </n-form-item>
        <n-form-item label="Описание">
          <AppEditor v-model="descr">
            <template #media-manager="{ onMediaSelect }">
              <media-list media-view-mode="select" @on-media-select="onMediaSelect"></media-list>
            </template>
          </AppEditor>
        </n-form-item>

        <n-space vertical size="large">
          <div v-for="charFilter in charFilters" :key="charFilter.nn" class="filter-group">
            <n-text tag="p" strong>{{ charFilter.name }}</n-text>
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
          </div>
        </n-space>
      </n-form>
    </n-spin>
    <template #action>
      <n-space justify="end">
        <n-button attr-type="button" secondary type="primary" @click="emit('onCancel')"
          >Отменить</n-button
        >
        <n-button
          attr-type="button"
          type="primary"
          :disabled="saveDisabled || isDuplicate"
          :loading="saveStatus === 'pending'"
          @click="save"
          >Сохранить</n-button
        >
      </n-space>
    </template>
  </n-card>
</template>

<style scoped>
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
