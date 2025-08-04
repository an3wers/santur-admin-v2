<script setup lang="ts">
import { NCard, NSpace, NSpin, useMessage, NTabs, NTabPane } from 'naive-ui'
import { groupCatalogItems, useCatalogApi } from '@/entities/catalog'
import type { CatalogItem } from '@/widgets/uploading'
import { useUploadingApi } from '@/entities/uploading'
import { BrandLatters } from '@/widgets/brand'
import { useBrands, useSaveConstructor } from '@/widgets/uploading'
import FeedZnaks from '@/widgets/uploading/ui/FeedZnaks.vue'
import FeedBrands from '@/widgets/uploading/ui/FeedBrands.vue'
import FeedCatalog from '@/widgets/uploading/ui/FeedCatalog.vue'
import FeedSelector from '@/widgets/uploading/ui/FeedSelector.vue'
import { useFeed } from '@/widgets/uploading/model/use-feed'
import { transformPlatformOptions } from '../utlils/transform-platform-options'

const { ctx } = defineProps<{ ctx: string }>()

const { activeTab, currentPlatform, tabs, selectPlatform } = useFeed()

const DEFAULT_XML_FEED_KEY = 'YAND'
const DEFAULT_SANTUR_FEED_KEY = 'santur:ur'

function init() {
  if (ctx === '1') selectPlatform(DEFAULT_XML_FEED_KEY) // 1 xml
  if (ctx === '2') selectPlatform(DEFAULT_SANTUR_FEED_KEY) // 2 santur.ru
}

init()

const makexmlfeed = computed(() => ctx === '1')

const api = useUploadingApi()
const { getCatalog } = useCatalogApi()

const {
  data: platformOptionsData,
  status: platformOptionsStatus,
  execute: platformOptionsExecute
} = useAsyncData(`catalog-filter-keys-${ctx}`, () => api.getCatalogFilterKeys(), {
  transform: (data) => {
    return transformPlatformOptions(ctx, data)
  },
  lazy: true
})

const {
  data: exportConstructor,
  status: exportConstructorStatus,
  refresh: refreshExportConstructor
} = useAsyncData(
  `export-constructor-xml-feed-${ctx}`,
  () => api.getCatalogFilter(currentPlatform.value),
  {
    lazy: true,
    watch: [currentPlatform]
  }
)

const {
  data: catalogData,
  status: catalogDataStatus,
  execute: catalogDataExecute
} = useAsyncData(`catalog-xml-feed-${ctx}`, getCatalog, {
  transform: (data) => {
    const mapped = data.map((item) => ({
      id: item.id,
      name: item.name,
      parent_id: item.parent_id,
      vid: item.vid,
      isChecked: !exportConstructor.value?.excludedCategories?.includes(item.id)
    }))

    return { data: groupCatalogItems(mapped), fetchedAt: new Date() }
  },
  immediate: false
})

const {
  excludedBrands,
  toggleExcludedBrand,
  initExcludedBrands,
  lettersRus,
  lettersEng,
  brands,
  getBrands,
  currentLetter,
  status: brandsStatus,
  setLetter,
  resetState: resetBrandsState
} = useBrands()

watchEffect(() => {
  if (exportConstructorStatus.value === 'success') {
    initExcludedBrands(exportConstructor.value?.excludedBrends || [])
    catalogDataStatus.value = 'idle'
    brandsStatus.value = 'idle'
  }
})

watchEffect(() => {
  if (
    activeTab.value === 'Каталог' &&
    catalogDataStatus.value === 'idle' &&
    exportConstructorStatus.value === 'success'
  ) {
    catalogDataExecute()
  }
})

watchEffect(() => {
  if (
    activeTab.value === 'Бренды' &&
    brandsStatus.value === 'idle' &&
    exportConstructorStatus.value === 'success'
  ) {
    getBrands()
  }
})

const { saveConstructor, status: saveConstructorStatus } = useSaveConstructor(ctx)

const message = useMessage()

async function updateHandler() {
  const excludedCategories = getExcludedCategoryIds(catalogData.value!.data)

  await saveConstructor(
    currentPlatform.value,
    {
      excludedCategories,
      excludedBrends: excludedBrands.value,
      znaks: exportConstructor.value!.znaks,
      title: exportConstructor.value!.title,
      descr: exportConstructor.value!.descr
    },
    makexmlfeed.value
  )

  if (saveConstructorStatus.value === 'success') {
    message.success('Данные успешно сохранены')
  } else {
    message.error('Произошла ошибка при сохранении')
  }

  resetBrandsState()
  clearNuxtData(`catalog-xml-feed-${ctx}`)

  await refreshExportConstructor()
}

function getExcludedCategoryIds(payload: CatalogItem[]): number[] {
  if (!payload.length) {
    return []
  }

  const result: number[] = []
  payload.forEach((item) => {
    if (item.child) {
      item.child.forEach((c) => {
        if (!c.isChecked) {
          result.push(c.id)
        }
      })
    }
  })

  return result
}

function toggleCheckedAllInCategory(catId: number) {
  catalogData.value?.data?.forEach((item) => {
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

async function removedFeedHandler() {
  await platformOptionsExecute()

  if (platformOptionsStatus.value === 'success') {
    const key = ctx === '1' ? DEFAULT_XML_FEED_KEY : DEFAULT_SANTUR_FEED_KEY

    const defaultKeyIsExist = platformOptionsData.value?.find((el) => el.value === key)

    if (defaultKeyIsExist) {
      selectPlatform(key)
    } else if (platformOptionsData.value?.length) {
      selectPlatform(platformOptionsData.value[0].value)
    }
  }
}
</script>

<template>
  <!-- TODO: Обработать пустое состояние -->
  <n-space vertical size="large">
    <FeedSelector
      :platform-options-data="platformOptionsData"
      :platform-options-status="platformOptionsStatus"
      @on-removed-key="removedFeedHandler"
      @on-update-feed="updateHandler"
      @on-after-success-save-key="platformOptionsExecute"
    />
    <div v-if="exportConstructor">
      <div class="constructor-grid">
        <div class="constructor-grid__item">
          <n-card>
            <n-tabs v-model:value="activeTab" type="line" size="large">
              <n-tab-pane :name="tabs[0]" :tab="tabs[0]">
                <n-space justify="center" v-if="catalogDataStatus === 'pending'">
                  <n-spin size="small" />
                </n-space>
                <FeedCatalog
                  v-if="catalogData?.data"
                  v-model:state="catalogData.data"
                  @on-toggle-check-all-in-category="toggleCheckedAllInCategory"
                />
              </n-tab-pane>
              <n-tab-pane :name="tabs[1]" :tab="tabs[1]">
                <FeedBrands
                  :data="brands?.brends || []"
                  :status="brandsStatus"
                  @on-update="toggleExcludedBrand"
                >
                  <template #letters>
                    <BrandLatters
                      v-if="lettersEng.length || lettersRus.length"
                      :letters-eng="lettersEng"
                      :letters-rus="lettersRus"
                      :status="brandsStatus"
                      :current-letter="currentLetter"
                      @on-letter-click="setLetter($event)"
                    />
                  </template>
                </FeedBrands>
              </n-tab-pane>
            </n-tabs>
          </n-card>
        </div>
        <div class="constructor-grid__item">
          <FeedZnaks v-model:state="exportConstructor.znaks" />
        </div>
      </div>
    </div>
  </n-space>
</template>

<style scoped>
.constructor-grid {
  display: grid;
  grid-template-columns: 1fr minmax(240px, 320px);
  gap: 1rem;
}
</style>
