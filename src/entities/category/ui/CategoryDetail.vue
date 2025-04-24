<script setup lang="ts">
import { useCategoryStore } from '../model/use-category-store'
import {
  NCard,
  NDynamicInput,
  NForm,
  NFormItem,
  NInput,
  NSpace,
  NModal,
  NButton,
  NP,
  useMessage
} from 'naive-ui'

interface Props {
  id?: number
  firstLevelName: string
}

const { id, firstLevelName } = defineProps<Props>()

const emits = defineEmits<{
  (e: 'onCancel'): void
  (e: 'onUpdate'): void
}>()

const message = useMessage()

const categoryStore = useCategoryStore()

categoryStore.$reset()

await categoryStore.loadCategory(id ?? 0)

const {
  category,
  categoryStatus,
  removeStatus,
  removeError,
  saveStatus,
  saveError,
  showConfirmForRemoveField
} = storeToRefs(categoryStore)

const getType = computed(() => {
  switch (firstLevelName) {
    case 'posts':
      return 'post'
    case 'banners':
      return 'banner'
    default:
      return ''
  }
})

async function saveCategory() {
  await categoryStore.saveCategory(getType.value)

  if (saveStatus.value === 'success') {
    emits('onUpdate')
    emits('onCancel')
    message.success('Категория сохранена')
  }

  if (saveStatus.value === 'error') {
    message.error(saveError.value)
  }
}

async function removeCategory() {
  await categoryStore.removeCategory()

  if (removeStatus.value === 'success') {
    emits('onUpdate')
    emits('onCancel')
    message.success('Категория удалена')
    return navigateTo({ name: firstLevelName, replace: true })
  }

  if (removeStatus.value === 'error') {
    message.error(removeError.value)
  }
}
</script>

<template>
  <n-card>
    <div v-if="id" style="margin-bottom: 8px">
      <n-p :depth="3">ID: {{ id }}</n-p>
    </div>
    <n-form :model="category">
      <n-form-item label="Название категории" path="name">
        <n-input v-model:value="category.name" placeholder="Название категории" />
      </n-form-item>
      <n-space v-if="firstLevelName === 'posts'" vertical>
        <n-form-item label="Дополнительные поля">
          <n-space vertical style="width: 100%">
            <n-dynamic-input
              :value="category.extFields"
              placeholder="Название поля"
              :on-create="categoryStore.addExtendFieldInput"
              :on-remove="categoryStore.removeExtendFieldInput"
            >
              <template #default="{ value }">
                <div style="display: flex; align-items: center; width: 100%">
                  <n-input v-model:value="value.title" type="text" />
                </div>
              </template>
            </n-dynamic-input>
          </n-space>
        </n-form-item>
      </n-space>
    </n-form>
    <template #action>
      <div class="btn-group">
        <n-button
          v-if="categoryStore.category.id"
          attr-type="button"
          secondary
          type="error"
          :disabled="categoryStatus === 'pending'"
          :loading="removeStatus === 'pending'"
          @click="removeCategory"
          >Удалить</n-button
        >
        <div class="btns-rigth">
          <n-button
            attr-type="button"
            secondary
            type="primary"
            :disabled="categoryStatus === 'pending'"
            @click="$emit('onCancel')"
            >Отменить</n-button
          >
          <n-button
            attr-type="button"
            type="primary"
            @click="saveCategory"
            :disabled="categoryStatus === 'pending'"
            :loading="saveStatus === 'pending'"
            >Сохранить</n-button
          >
        </div>
      </div>
    </template>

    <n-modal
      v-model:show="showConfirmForRemoveField"
      :mask-closable="false"
      preset="dialog"
      title="Внимание"
      content="Дополнительное поле используется в записях
      Вы уверены что хотите удалить его?"
      positive-text="Удалить"
      negative-text="Отмена"
      @positive-click="categoryStore.removeAfterConfirm"
      @negative-click="categoryStore.cancelRemoveConfirm"
    />
  </n-card>
</template>

<style scoped>
.btn-group {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.btns-rigth {
  width: 100%;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
</style>
