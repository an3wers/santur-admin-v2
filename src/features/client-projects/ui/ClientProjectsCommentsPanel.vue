<script setup lang="ts">
import { NDrawer, NDrawerContent, NInput, NButton, NIcon, NText } from 'naive-ui'
import { ArrowUp } from '@vicons/tabler'

// const commentValue = defineModel<string>('commentValue', { required: true })
defineProps<{
  projectId: number
  show: boolean
}>()

const commentValue = ref('')

const emits = defineEmits<{
  (e: 'update:show', show: boolean): void
}>()

function updateShowHandler(show: boolean) {
  console.log('updateShowHandler', show)
  emits('update:show', show)
}
</script>

<template>
  <n-drawer
    :show="show"
    :width="480"
    placement="right"
    @update:show="updateShowHandler"
    :theme-overrides="{
      footerPadding: '1rem 1rem'
    }"
  >
    <n-drawer-content title="Комментарии" closable :native-scrollbar="false">
      <section>
        <n-text tag="p" style="text-align: center">Нет комментариев</n-text>
      </section>
      <template #footer>
        <section class="write-comment">
          <n-input
            v-model:value="commentValue"
            type="textarea"
            placeholder="Напишите комментарий"
            size="small"
            :autosize="{
              minRows: 2,
              maxRows: 5
            }"
            :input-props="{
              id: 'comment-input'
            }"
            :theme-overrides="{
              border: '1px solid transparent',
              borderFocus: '1px solid transparent',
              borderHover: '1px solid transparent',
              boxShadowFocus: 'none',
              paddingSmall: '0.5rem 0'
            }"
          />
          <div class="actions">
            <n-button strong circle type="primary" size="medium">
              <template #icon>
                <n-icon><ArrowUp /></n-icon>
              </template>
            </n-button>
          </div>
        </section>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped>
.write-comment {
  width: 100%;
  border-radius: var(--border-radius);
  padding: 0.5rem;
  border: 1px solid var(--gray-200);
}

.write-comment .actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* :deep(.n-input--textarea) {
  background-color: transparent;
} */
</style>
