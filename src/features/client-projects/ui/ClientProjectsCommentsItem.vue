<script setup lang="ts">
import type { ClientProjectDetailDto } from '~/entities/client-projects'
import { NDropdown, NButton, NIcon } from 'naive-ui'
import type { DropdownMixedOption } from 'naive-ui/es/dropdown/src/interface'
import { Dots } from '@vicons/tabler'

const { comment } = defineProps<{
  comment: ClientProjectDetailDto['comments'][number]
}>()

const emits = defineEmits<{
  (e: 'onEdit', id: number, comment: string): void
  (e: 'onDelete', id: number): void
}>()

const dropdownOptions: DropdownMixedOption[] = [
  {
    label: 'Изменить',
    key: 'edit'
  },
  {
    label: 'Удалить',
    key: 'delete'
  }
]

function handleSelect(key: string | number) {
  if (key === 'edit') {
    emits('onEdit', comment.id, comment.comment)
  } else if (key === 'delete') {
    emits('onDelete', comment.id)
  }
}
</script>

<template>
  <div
    class="comment-item"
    :key="comment.id"
    :class="{
      'comment-item__self comment-item__right': comment.iamAuthor,
      'comment-item__left': !comment.iamAuthor
    }"
  >
    <div class="comment-item__header">
      <div class="comment-item__meta">{{ comment.regdate }}, {{ comment.author }}</div>
      <n-dropdown
        v-if="comment.iamAuthor"
        trigger="click"
        :options="dropdownOptions"
        @select="handleSelect"
      >
        <n-button quaternary circle size="small">
          <n-icon size="20px">
            <Dots />
          </n-icon>
        </n-button>
      </n-dropdown>
    </div>

    <div>{{ comment.comment }}</div>
  </div>
</template>

<style scoped>
.comment-item {
  max-width: 80%;
  padding: 0.5rem;
  border-radius: var(--border-radius);
  background-color: var(--gray-150);
  font-size: var(--font-size-sm);
}

.comment-item__meta {
  font-size: var(--font-size-xs);
  opacity: 0.7;
}

.comment-item__self {
  background-color: var(--blue-200);
}

.comment-item__left {
  align-self: flex-start;
}

.comment-item__right {
  align-self: flex-end;
}

.comment-item__header {
  display: flex;
  justify-content: space-between;
  gap: 0.875rem;
  align-items: center;
}
</style>
