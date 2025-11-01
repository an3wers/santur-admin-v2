<script setup lang="ts">
import { NSpace, NH1, NSpin, NCard, NTabs, NTabPane } from 'naive-ui'
import { BrandLatters } from '~/entities/brand'
import { groupCatalogItems, useCatalogApi } from '~/entities/catalog'
import { useFeedsApi } from '~/entities/feeds'
import { FeedsSelector, useFeedsSetup } from '~/features/feeds/feeds-setup'
import { useFeedsBrands } from '~/features/feeds/feeds-setup/model/use-feeds-brands'
import FeedsBrandsSetup from '~/features/feeds/feeds-setup/ui/FeedsBrandsSetup.vue'
import FeedsCategorySetup from '~/features/feeds/feeds-setup/ui/FeedsCategorySetup.vue'
import FeedsSignSetup from '~/features/feeds/feeds-setup/ui/FeedsSignSetup.vue'
import { transformPlatformOptions } from '~/features/feeds/feeds-setup/utlils/transform-platform-options'
import { useNavStore } from '~/shared/navigation'

const navStore = useNavStore()
const route = useRoute()

const title = computed(() => {
  return navStore.currentNavigationMenu?.items.find((i) => i.id === parseInt(catId.value))?.label
})

const catId = ref(route.params.catId as string)

const feedSetup = useFeedsSetup()

const { getFeedFilter, getFeedsKeys } = useFeedsApi()

const {
  data: feedsKeysData,
  status: feedsKeysStatus,
  execute: feedsKeysExecute
} = useAsyncData(`feeds-keys-${catId.value}`, () => getFeedsKeys(), {
  transform: (data) => {
    return transformPlatformOptions(catId.value, data)
  },
  lazy: true
})

// При старте ключ по умолчанию пустая строка, поэтому после загрузки ключей устанавливаем первый из списка достпупных
watch(feedsKeysData, () => {
  if (feedsKeysData.value?.length && feedSetup.currentFeedKey === '') {
    feedSetup.setFeedKey(feedsKeysData.value[0].value)
  }
})

const {
  data: feedFilterData,
  status: feedFilterStatus,
  execute: feedFilterExecute
} = useAsyncData(`feed-filter-${catId.value}`, () => getFeedFilter(feedSetup.currentFeedKey), {
  lazy: true,
  immediate: false
})

watch(
  () => feedSetup.currentFeedKey,
  async () => {
    if (feedSetup.currentFeedKey) {
      await feedFilterExecute()
    }
  }
)

const { getCatalog } = useCatalogApi()

const {
  data: feedCategoryData,
  status: feedCategoryStatus,
  execute: feedCategoryExecute
} = useAsyncData(`feed-category-${catId.value}`, getCatalog, {
  transform: (data) => {
    const mapped = data.map((item) => ({
      id: item.id,
      name: item.name,
      parent_id: item.parent_id,
      vid: item.vid,
      isChecked: !feedFilterData.value?.excludedCategories?.includes(item.id)
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
} = useFeedsBrands()

watchEffect(() => {
  if (feedFilterStatus.value === 'success' && feedFilterData.value) {
    initExcludedBrands(feedFilterData.value.excludedBrends || [])

    feedCategoryStatus.value = 'idle'
    brandsStatus.value = 'idle'
  }
})

watchEffect(async () => {
  if (
    feedSetup.activeTab === 'Каталог' &&
    feedCategoryStatus.value === 'idle' &&
    feedFilterStatus.value === 'success'
  ) {
    await feedCategoryExecute()
  }
})

watchEffect(async () => {
  if (
    feedSetup.activeTab === 'Бренды' &&
    brandsStatus.value === 'idle' &&
    feedFilterStatus.value === 'success'
  ) {
    await getBrands()
  }
})
</script>

<template>
  <div class="container">
    <n-spin :show="feedsKeysStatus === 'pending'">
      <n-space vertical size="large">
        <page-title back-label="Выгрузки" has-back :back-path="`/feeds`">
          <template #title>
            <n-h1>{{ title }}</n-h1>
          </template>
        </page-title>
      </n-space>
      <n-space vertical size="large">
        <FeedsSelector
          :ctx="catId"
          :feed-keys="feedsKeysData || []"
          @on-after-success-save-key="() => {}"
        />
        <div v-if="feedFilterData" class="constructor-grid">
          <div class="constructor-grid__item">
            <n-card>
              <n-tabs v-model:value="feedSetup.activeTab" type="line" size="large">
                <n-tab-pane :name="feedSetup.tabs[0]" :tab="feedSetup.tabs[0]">
                  <FeedsCategorySetup
                    v-if="feedCategoryData?.data"
                    v-model:state="feedCategoryData.data"
                    :status="feedCategoryStatus"
                  />
                  <!-- <FeedCatalog
                  v-if="catalogData?.data"
                  v-model:state="catalogData.data"
                  :status="catalogDataStatus"
                  @on-toggle-check-all-in-category="toggleCheckedAllInCategory"
                /> -->
                </n-tab-pane>
                <n-tab-pane :name="feedSetup.tabs[1]" :tab="feedSetup.tabs[1]">
                  <FeedsBrandsSetup
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
                  </FeedsBrandsSetup>

                  <!-- <FeedBrands
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
                </FeedBrands> -->
                </n-tab-pane>
                <n-tab-pane :name="feedSetup.tabs[2]" :tab="feedSetup.tabs[2]">
                  <FeedsSignSetup v-model:state="feedFilterData.znaks" />
                  <!-- <FeedZnaks v-model:state="filterFeed.znaks" /> -->
                </n-tab-pane>
              </n-tabs>
            </n-card>
          </div>
        </div>
      </n-space>
    </n-spin>
  </div>
</template>

<style scoped></style>
