<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { useCategoryStore } from '../model/category.store'

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

await categoryStore.loadCategory(id ?? 0)

const {
  category,
  categoryStatus,
  removeStatus,
  removeError,
  categoryError,
  saveStatus,
  saveError,
  extFieldsError,
  showConfirmForRemoveField
} = storeToRefs(categoryStore)

async function saveCategory() {
  await categoryStore.saveCategory()

  if (saveStatus.value === 'success') {
    emits('onUpdate')
    emits('onCancel')
  }
}

async function removeCategory() {
  await categoryStore.removeCategory()

  if (removeStatus.value === 'success') {
    emits('onUpdate')
    emits('onCancel')
  }

  message.success('Категория удалена')

  navigateTo({ name: firstLevelName, replace: true })
}

onUnmounted(() => {
  categoryStore.$reset()
})
</script>

<template>
  <n-card>
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
              :on-create="categoryStore.addExtendFiledInput"
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

<style scoped></style>
