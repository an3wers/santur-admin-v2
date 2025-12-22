<script setup lang="ts">
import type { DropdownMixedOption } from 'naive-ui/es/dropdown/src/interface'
import {
  type BannersListItem,
  useUpdateOrderBanner,
  useCopyBanner,
  useRemoveBanner
} from '@/features/banner'
import { NIcon, NListItem, NText, NDropdown, NButton, NImage, NInputNumber } from 'naive-ui'
import { Dots, ChevronUp, ChevronDown } from '@vicons/tabler'

const { banner: item, ownertId } = defineProps<{
  banner: BannersListItem
  ownertId: number
}>()

const emit = defineEmits<{
  (e: 'onUpdate'): void
}>()

const order = ref(item.order ?? 0)

const moreMenu = [
  { label: 'Изменить', key: 'edit' },
  { label: 'Дублировать', key: 'copy' },
  { label: 'Удалить', key: 'remove' }
] as const

type MenuKeys = (typeof moreMenu)[number]['key']

function handleDropdown(key: MenuKeys, itemId: number) {
  switch (key) {
    case 'edit':
      editBanner(itemId)
      break
    case 'copy':
      copyBanner(itemId)
      break
    case 'remove':
      removeBanner(itemId)
      break
  }
}

function editBanner(id: number) {
  return navigateTo(`${ownertId}/${id}`)
}

const { makeCopy, status: copyStatus } = useCopyBanner()
async function copyBanner(id: number) {
  await makeCopy(id)

  if (copyStatus.value === 'success') {
    emit('onUpdate')
  }
}

const { remove, status: removeStatus } = useRemoveBanner()
async function removeBanner(id: number) {
  await remove(id)

  if (removeStatus.value === 'success') {
    emit('onUpdate')
  }
}

const { updateOrder, status: updateStatus } = useUpdateOrderBanner()
const updateOrderWithDelay = useDebounceFn(changeOrder, 500)
async function changeOrder(value: number | null) {
  if (value === null) {
    return
  }

  await updateOrder(item.id, value)

  if (updateStatus.value === 'success') {
    emit('onUpdate')
  }
}
</script>

<template>
  <n-list-item>
    <div class="item-row">
      <div class="item-id">
        <n-text depth="3">{{ item.id }}</n-text>
      </div>
      <div class="item-image">
        <n-image class="item-image__preview" preview-disabled :src="item.imgPath" />
      </div>
      <div class="item-base">
        <div class="item-title">
          <nuxt-link :to="`${ownertId}/${item.id}`">
            <h4>{{ item.name }}</h4>
          </nuxt-link>
        </div>
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
          @select="(key) => handleDropdown(key, item.id)"
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

<style scoped lang="css">
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

.item-btn {
  flex-basis: 40px;
  flex-shrink: 0;
  text-align: right;
}

.item-image {
  width: 180px;
  height: 60px;
  flex-shrink: 0;
}

.item-image__preview > img {
  object-fit: contain !important;
}

.item-order {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  align-items: center;
  flex-basis: 96px;
}
</style>
