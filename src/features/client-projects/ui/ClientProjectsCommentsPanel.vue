<script setup lang="ts">
import {
  NDrawer,
  NDrawerContent,
  NInput,
  NButton,
  NIcon,
  NText,
  NAlert,
  useMessage
} from 'naive-ui'
import { ArrowUp } from '@vicons/tabler'
import type { ClientProjectDetailDto } from '~/entities/client-projects'
import { useDeleteComment } from '../model/use-delete-comment'
import { useSaveComment } from '../model/use-save-comment'
// import { useCommonApi } from '~/shared/api/common-api'

const { projectId, show, comments } = defineProps<{
  projectId: number
  show: boolean
  comments: ClientProjectDetailDto['comments']
}>()

const emits = defineEmits<{
  (e: 'update:show', show: boolean): void
}>()

const reversedComments = computed(() => {
  return comments.toReversed()
})

function updateShowHandler(show: boolean) {
  emits('update:show', show)
}

// const { getPossibleEntitiesForComment } = useCommonApi()

// const { data: possibleEntitiesForComment } = useAsyncData('possibleEntitiesForComment', () =>
//   getPossibleEntitiesForComment()
// )

// const itemId = useRoute().params.itemId as string

const {
  saveComment,
  commentValue,
  status: saveCommentStatus,
  editComment,
  cancelEdit,
  saveCommentId,
  editingCommentValue,
  error: saveCommentError
} = useSaveComment(Number(projectId))
const { deleteComment } = useDeleteComment(Number(projectId))

const message = useMessage()

async function saveCommentHandler() {
  const isBottom = isNearBottom()

  await saveComment()

  if (saveCommentStatus.value === 'error') {
    message.error(saveCommentError.value?.message || 'Произошла ошибка')
  }

  if (saveCommentStatus.value === 'success') {
    if (isBottom) {
      setTimeout(scrollToLatestComment, 0)
    }
  }
}

const commentHiddenRef = useTemplateRef('commentHiddenRef')

function scrollToLatestComment() {
  if (!commentHiddenRef.value) {
    return
  }

  commentHiddenRef.value.scrollIntoView({
    block: 'end'
  })
}

function isNearBottom(threshold = 100) {
  const container = document.querySelector('.n-scrollbar-container')

  if (!container) {
    return false
  }

  const scrollTop = container.scrollTop
  const scrollHeight = container.scrollHeight
  const clientHeight = container.clientHeight

  const distanceToBottom = scrollHeight - scrollTop - clientHeight

  return distanceToBottom <= threshold
}

onMounted(() => {
  scrollToLatestComment()
})
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
      <section class="comments">
        <div v-if="!comments.length" class="comments-empty">
          <n-text tag="p" style="text-align: center">Нет комментариев</n-text>
        </div>
        <div v-else class="comments-list">
          <div
            v-for="item in reversedComments"
            class="comment-item"
            :key="item.id"
            :class="{
              'comment-item__self comment-item__right': item.iamAuthor,
              'comment-item__left': !item.iamAuthor
            }"
          >
            <div class="comment-item__meta">{{ item.regdate }}, {{ item.author }}</div>
            <div>{{ item.comment }}</div>
            <div v-if="item.iamAuthor" class="comment-item__actions">
              <n-button size="tiny" type="primary" text @click="editComment(item.id, item.comment)"
                >Изменить</n-button
              >
              <n-button size="tiny" type="error" text @click="deleteComment(item.id)"
                >Удалить</n-button
              >
            </div>
          </div>
          <div ref="commentHiddenRef" class="comment-item__hidden"></div>
        </div>
      </section>
      <template #footer>
        <section class="save-comment">
          <div v-if="saveCommentId > 0" class="edit-comment">
            <n-alert
              type="info"
              closable
              :show-icon="false"
              :theme-overrides="{}"
              @close="cancelEdit"
            >
              <div>
                <n-text strong tag="p">Редактирование</n-text>
                <n-text tag="p">{{ editingCommentValue }}</n-text>
              </div>
            </n-alert>
          </div>

          <div class="write-comment">
            <n-input
              v-model:value="commentValue"
              type="textarea"
              placeholder="Напишите комментарий"
              size="small"
              :disabled="saveCommentStatus === 'pending'"
              :autosize="{
                minRows: 2,
                maxRows: 5
              }"
              :input-props="{
                id: 'comment-input',
                autocomplete: 'off'
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
              <n-button
                strong
                circle
                type="primary"
                size="medium"
                :loading="saveCommentStatus === 'pending'"
                @click="saveCommentHandler"
              >
                <template #icon>
                  <n-icon><ArrowUp /></n-icon>
                </template>
              </n-button>
            </div>
          </div>
        </section>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped>
.comments {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 200px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-item {
  max-width: 80%;
  padding: 0.5rem;
  border-radius: var(--border-radius);
  background-color: var(--gray-150);
  font-size: var(--font-size-sm);
}

.comment-item__hidden {
  display: block;
  height: 1rem;
  visibility: hidden;
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

.comments-empty {
  margin: auto;
}

.comment-item__actions {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.save-comment {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

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
