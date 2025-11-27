<script setup lang="ts">
import {
  NCollapse,
  NCollapseItem,
  NList,
  NListItem,
  NText,
  NCheckbox,
  NButton,
  NModal,
  NSpace
} from 'naive-ui'
import type { BrandItem, CategoryId, CategoryItem } from '../../model/types'
import CategoriesBrands from './CategoriesBrands.vue'

const { expandedAll, brandsFilter, subjectId } = defineProps<{
  subjectId: number
  expandedAll: boolean
  brandsFilter: Map<CategoryId, BrandItem[]>
}>()

const emits = defineEmits<{
  (e: 'onUpdateBrandsFilter', categoryId: number, brands: BrandItem[]): void
}>()

const { data: categoriesData } = useNuxtData<{ data: CategoryItem[] }>(
  `client-catalog-categories-${subjectId}`
)

const expandedCategories = computed(() => {
  return expandedAll ? categoriesData.value?.data.map((item) => item.name) : []
})

const selectedCategoryId = ref<number | null>(null)
const showBrandsSetting = ref(false)

function openBrandsSetting(childId: number) {
  selectedCategoryId.value = childId
  showBrandsSetting.value = true
}

watch(showBrandsSetting, (newVal) => {
  if (!newVal) {
    selectedCategoryId.value = null
  }
})

function toggleCheckedAllInCategory(catId: number) {
  categoriesData.value?.data.forEach((item) => {
    if (item.id === catId) {
      const isCheckedAll = item.child?.every((c) => c.isChecked)

      if (isCheckedAll) {
        item.child?.forEach((c) => {
          c.isChecked = false
        })
      } else {
        item.child?.forEach((c) => {
          c.isChecked = true
        })
      }
    }
  })
}

type BrandsDataItem = BrandItem & { isChecked: boolean }

function saveBrandsSetting() {
  const { data: brandsData } = useNuxtData<BrandsDataItem[]>(
    `client-catalog-brands-${selectedCategoryId.value}`
  )

  if (!brandsData.value || !selectedCategoryId.value) {
    return
  }

  const checkedBrands = brandsData.value
    .filter((item) => item.isChecked)
    .map((item) => {
      const { isChecked, ...data } = item

      return data
    })

  emits('onUpdateBrandsFilter', selectedCategoryId.value, checkedBrands)

  showBrandsSetting.value = false
}
</script>

<template>
  <div>
    <n-collapse :trigger-areas="['main', 'arrow']" :default-expanded-names="expandedCategories">
      <n-collapse-item v-for="parent in categoriesData?.data" :key="parent.id" :name="parent.name">
        <template #header>
          <n-text tag="p" strong>{{ parent.name }}</n-text>
        </template>
        <div class="child-container">
          <n-list hoverable>
            <n-list-item v-for="item in parent.child" :key="item.id">
              <div class="child__item">
                <n-checkbox v-model:checked="item.isChecked">{{ item.name }}</n-checkbox>
                <n-button
                  size="tiny"
                  :disabled="!item.isChecked"
                  @click="openBrandsSetting(item.id)"
                  >Настроить</n-button
                >
              </div>
            </n-list-item>
          </n-list>
        </div>
      </n-collapse-item>
    </n-collapse>

    <n-modal
      v-model:show="showBrandsSetting"
      style="max-width: 960px"
      size="medium"
      preset="card"
      title="Настройка брендов и цен"
      :mask-closable="false"
    >
      <CategoriesBrands
        v-if="selectedCategoryId !== null"
        :category-id="selectedCategoryId"
        :brands-filter="brandsFilter"
      />

      <template #footer>
        <n-space justify="end">
          <n-button secondary type="primary" @click="showBrandsSetting = false">Отменить</n-button>
          <n-button type="primary" @click="saveBrandsSetting">Сохранить</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<style scoped>
.child-container {
  margin-left: 2rem;
}

.child__item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
