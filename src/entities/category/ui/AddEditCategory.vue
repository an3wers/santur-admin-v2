<script setup lang="ts">
interface Props {
  id?: number
  firstLevelName: string
}

const { id, firstLevelName } = defineProps<Props>()
</script>

<template>
  <n-card>
    <n-form ref="formRef" :model="category">
      <n-form-item label="Название категории" path="title">
        <n-input v-model:value="categoryTitleLocal" placeholder="Название категории" />
      </n-form-item>
      <n-space v-if="type === 'post'" vertical>
        <n-form-item label="Дополнительные поля">
          <n-space vertical style="width: 100%">
            <n-dynamic-input
              :value="extendFieldsLocal"
              placeholder="Название поля"
              :on-create="onCreateExtFields"
              :on-remove="onRemoveExtFields"
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
          v-if="Number(category.id)"
          attr-type="button"
          secondary
          type="error"
          :disabled="isProcessing"
          :loading="isRemoveProcess"
          @click="removeHandler"
          >Удалить</n-button
        >
        <div class="btns-rigth">
          <n-button
            attr-type="button"
            secondary
            type="primary"
            :disabled="isProcessing"
            @click="$emit('onCancel')"
            >Отменить</n-button
          >
          <n-button
            attr-type="button"
            type="primary"
            @click="saveHandler"
            :disabled="isProcessing"
            :loading="isSaveProcess"
            >Сохранить</n-button
          >
        </div>
      </div>
    </template>

    <n-modal
      v-model:show="showConfirmModal"
      :mask-closable="false"
      preset="dialog"
      title="Внимание"
      content="Дополнительное поле используется в записях
      Вы уверены что хотите удалить его?"
      positive-text="Удалить"
      negative-text="Отмена"
      @positive-click="removeExtField"
      @negative-click="
        () => {
          showConfirmModal = false
        }
      "
    />
  </n-card>
</template>

<style scoped></style>
