<script setup lang="ts">
import { useClientCatalogApi } from '~/entities/feeds'
import type { BrandItem, CategoryId } from '../../model/types'
import { NTable, NCheckbox, NSpin, NInputNumber, NSelect } from 'naive-ui'
import { getCache } from '~/shared/libs/api/get-async-cache'

const { categoryId, brandsFilter } = defineProps<{
  categoryId: number | null
  brandsFilter: Map<CategoryId, BrandItem[]>
}>()

// const emits = defineEmits<{
//   (e: 'onClose'): void
// }>()

const { getBrandsByTk, getPriceTypes } = useClientCatalogApi()

const inputDiscountValidator = (x: number) => x >= 0

const {
  data: brandsData,
  status: brandsStatus,
  execute: brandsExecute
} = useAsyncData(`client-catalog-brands-${categoryId}`, () => getBrandsByTk(categoryId!), {
  // TODO: вынести модификацию данные в watchEffect
  // TODO: добавить кеширование данных
  transform: (data) => {
    return data.map((item) => {
      const found = brandsFilter.get(categoryId!)?.find((brand) => brand.brend === item.name)
      return {
        brend: item.name,
        priceType: found?.priceType || 'pr_br', // pr_br - default price type
        discount: found?.discount || 0,
        isChecked: !!found // Наличие бренда в brandsFilter означает что checked
      }
    })
  },
  lazy: true,
  immediate: categoryId != null
})

const { data: priceTypesData, status: priceTypesStatus } = useAsyncData(
  'client-catalog-price-types',
  getPriceTypes,
  {
    transform: (data) => {
      return data.map((item) => ({ label: item.title, value: item.code }))
    },
    getCachedData(key, nuxtApp) {
      return getCache(key, nuxtApp)
    },
    lazy: true
  }
)
</script>

<template>
  <div class="brands-container">
    <n-spin :show="brandsStatus === 'pending' || priceTypesStatus === 'pending'" size="small">
      <div v-if="!brandsData || !priceTypesData" style="min-height: 100px"></div>
      <div v-else>
        <div class="table-container">
          <n-table :bordered="false" :single-line="false">
            <thead>
              <tr>
                <th>Наименование</th>
                <th width="200px">Тип цены</th>
                <th width="140px">Скидка</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in brandsData" :key="item.brend">
                <td>
                  <n-checkbox v-model:checked="item.isChecked">{{ item.brend }}</n-checkbox>
                </td>
                <td>
                  <n-select
                    v-model:value="item.priceType"
                    label-field="label"
                    value-field="value"
                    size="small"
                    :disabled="priceTypesStatus === 'pending'"
                    :options="priceTypesData"
                  />
                </td>
                <td>
                  <n-input-number
                    v-model:value="item.discount"
                    clearable
                    size="small"
                    :validator="inputDiscountValidator"
                    :default-value="0"
                    :min="0"
                  />
                </td>
              </tr>
            </tbody>
          </n-table>
        </div>
      </div>
    </n-spin>
  </div>
</template>

<style scoped>
.table-container {
  max-height: calc(100dvh - 200px);
  overflow-y: auto;
}
</style>
