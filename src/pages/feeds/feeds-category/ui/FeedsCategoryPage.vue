<script setup lang="ts">
import { NSpace, NH1, NSpin, NCard, NTabs, NTabPane, useMessage } from 'naive-ui'
import {
  FeedsSelector,
  FeedsBrandsSetup,
  FeedsCategorySetup,
  FeedsSignSetup,
  useFeedsSetup
} from '~/features/feeds/feeds-setup'
import { useNavStore } from '~/shared/navigation'

const navStore = useNavStore()
const route = useRoute()

const title = computed(() => {
  return navStore.currentNavigationMenu?.items.find((i) => i.id === parseInt(catId.value))?.label
})

const catId = ref(route.params.catId as string)

const {
  feedLoading,
  tabs,
  activeTab,
  currentFeedKey,
  feedsKeysData,
  feedsKeysStatus,
  feedCategoryData,
  feedCategoryStatus,
  currentLetter,
  feedFilterData,
  feedFilterStatus,
  feedLink,
  feedPermissions,
  feedBrands,
  feedBrandsStatus,
  setMakeXmlFeed,
  setLetter,
  saveFeedHandler,
  toggleExcludedBrand,
  savedKeyHandler,
  removedKeyHandler
} = useFeedsSetup(catId)

if (catId.value == '1') {
  setMakeXmlFeed(true)
} else {
  setMakeXmlFeed(false)
}

const message = useMessage()
watchEffect(() => {
  if (feedsKeysStatus.value === 'error' || feedFilterStatus.value === 'error') {
    message.error('Произошла ошибка')
  }
})
</script>

<template>
  <div class="container">
    <n-spin :show="feedLoading">
      <n-space vertical size="large">
        <page-title back-label="Выгрузки" has-back :back-path="`/feeds`">
          <template #title>
            <n-h1>{{ title }}</n-h1>
          </template>
        </page-title>
      </n-space>
      <n-space vertical size="large">
        <FeedsSelector
          v-model:feed-key="currentFeedKey"
          :feed-keys="feedsKeysData || []"
          :feed-link="feedLink"
          :feed-permissions="feedPermissions"
          @on-update-feed="saveFeedHandler"
          @on-saved-key="savedKeyHandler"
          @on-removed-key="removedKeyHandler"
        />
        <div v-if="feedFilterData" class="constructor-grid">
          <div class="constructor-grid__item">
            <n-card>
              <n-tabs v-model:value="activeTab" type="line" size="large">
                <n-tab-pane :name="tabs[0]" :tab="tabs[0]">
                  <n-spin v-show="feedCategoryStatus === 'pending' && !feedCategoryData?.data">
                    <div style="height: 100px"></div>
                  </n-spin>

                  <FeedsCategorySetup
                    v-if="feedCategoryData?.data"
                    v-model:state="feedCategoryData.data"
                    :status="feedCategoryStatus"
                  />
                </n-tab-pane>
                <n-tab-pane :name="tabs[1]" :tab="tabs[1]">
                  <FeedsBrandsSetup
                    :brands="feedBrands"
                    :status="feedBrandsStatus"
                    :current-letter="currentLetter"
                    @on-toggle-brand="toggleExcludedBrand"
                    @on-set-letter="setLetter"
                  />
                </n-tab-pane>
                <n-tab-pane :name="tabs[2]" :tab="tabs[2]">
                  <FeedsSignSetup v-model:state="feedFilterData.znaks" />
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
