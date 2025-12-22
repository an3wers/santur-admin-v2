<script setup lang="ts">
import { NListItem, NIcon, NButton, NDropdown, NTag, NText, NInputNumber } from 'naive-ui'
import type { PostListItem } from '../model/types'
import type { DropdownMixedOption } from 'naive-ui/es/dropdown/src/interface'
import { Dots, ChevronUp, ChevronDown } from '@vicons/tabler'
import { useUpdateOrderPost } from '../model/use-update-order-post'
import { useCopyPost } from '../model/use-copy-post'
import { useRemovePost } from '../model/use-remove-post'

const { ownertId, ownerName, post } = defineProps<{
  post: PostListItem
  ownertId: number
  ownerName: string
}>()

const emit = defineEmits<{
  (e: 'onUpdate'): void
}>()

const order = ref(post.order ?? 0)

const description = computed(() => {
  if (ownerName === 'Вакансии') {
    let val = ''
    if (post.extFields) {
      val = post.extFields.find((item) => item.title === 'Город')?.value ?? ''
      return val.length ? `Город: ${val}` : ''
    }
  }
  return ''
})

const moreMenu = [
  { label: 'Изменить', key: 'edit' },
  { label: 'Дублировать', key: 'copy', disabled: true },
  { label: 'Удалить', key: 'remove' }
] as const

type MenuKeys = (typeof moreMenu)[number]['key']
//  as unknown as DropdownMixedOption[]

function handleDropdown(key: MenuKeys, itemId: number) {
  switch (key) {
    case 'edit':
      editPost(itemId)
      break
    case 'copy':
      copyPost(itemId)
      break
    case 'remove':
      removePost(itemId)
      break
  }
}

function editPost(id: number) {
  return navigateTo(`${ownertId}/${id}`)
}

/*
  TODO: исправлять баг копирования поста на серверной стороне
  Копирование поста работает с ошибкой на серверной стороне.
  Скопированный объект возвращается с id = 0, alias - исходной сущности, extFields - null
*/

const { makeCopy, status: copyStatus } = useCopyPost()
async function copyPost(id: number) {
  await makeCopy(id)

  if (copyStatus.value === 'success') {
    emit('onUpdate')
  }
}

const { removePost: remove, status: removeStatus } = useRemovePost()
async function removePost(id: number) {
  await remove(id)

  if (removeStatus.value === 'success') {
    emit('onUpdate')
  }
}

const { updateOrder, status: updateStatus } = useUpdateOrderPost()
const updateOrderWithDelay = useDebounceFn(changeOrder, 500)
async function changeOrder(value: number | null) {
  if (value === null) {
    return
  }

  await updateOrder(post.id, value)

  if (updateStatus.value === 'success') {
    emit('onUpdate')
  }
}
</script>

<template>
  <n-list-item>
    <div class="item-row">
      <div class="item-id">
        <n-text depth="3">{{ post.id }}</n-text>
      </div>
      <div class="item-base">
        <div class="item-caption">
          <n-text depth="3">{{ post.regDateS.split(' ')[0] }}</n-text>
        </div>
        <div class="item-title">
          <nuxt-link :to="`${ownertId}/${post.id}`">
            <h4>{{ post.title }}</h4>
          </nuxt-link>
        </div>
        <div v-if="description" class="item-descr">
          <n-text depth="3">{{ description }}</n-text>
        </div>
      </div>
      <div class="item-status">
        <n-tag size="small" v-if="post.isPublished" type="success">Опубликовано</n-tag>
        <n-tag size="small" v-else type="error">Не опубликовано</n-tag>
      </div>
      <div class="item-order">
        <n-input-number @update:value="updateOrderWithDelay" v-model:value="order" min="0">
          <template #minus-icon>
            <n-icon :component="ChevronDown" />
          </template>
          <template #add-icon>
            <n-icon :component="ChevronUp" />
          </template>
        </n-input-number>
      </div>
      <div class="item-btn">
        <n-dropdown
          trigger="click"
          :options="moreMenu as unknown as DropdownMixedOption[]"
          @select="(key: MenuKeys) => handleDropdown(key, post.id)"
        >
          <n-button quaternary circle size="small">
            <n-icon size="24px">
              <Dots />
            </n-icon>
          </n-button>
        </n-dropdown>
      </div>
    </div>
  </n-list-item>
</template>

<style scoped>
.item-row {
  display: flex;
  gap: 1.5rem;
  justify-content: space-between;
}
.item-id {
  flex-basis: 60px;
  flex-shrink: 0;
}
.item-base {
  flex-grow: 1;
}

.item-title {
  display: inline-block;
}

.item-title h4 {
  margin-top: 0;
  margin-bottom: 0;
}

.item-title a {
  text-decoration: none;
  color: var(--gray-900);
}
.item-title a:hover {
  text-decoration: none;
  color: var(--primary-color-hover);
}

.item-status {
  flex-basis: 120px;
  flex-shrink: 0;
}
.item-btn {
  flex-basis: 40px;
  flex-shrink: 0;
  text-align: right;
}

.item-descr {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
}

.item-order {
  flex-basis: 120px;
  flex-shrink: 0;
}
</style>
