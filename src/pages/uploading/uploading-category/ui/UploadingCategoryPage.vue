<script setup lang="ts">
import { NSpace, NH1 } from 'naive-ui'
import XmlFeedPage from '~/pages/uploading/uploading-category/ui/xml-feed/XmlFeedPage.vue'
import { useNavStore } from '~/shared/navigation'

const navStore = useNavStore()
const route = useRoute()

const title = computed(() => {
  return navStore.currentNavigationMenu?.items.find(
    (i) => i.id === parseInt(route.params.catId as string)
  )?.label
})
</script>

<template>
  <div class="container">
    <n-space vertical size="large">
      <page-title back-label="Выгрузки" has-back :back-path="`/uploading`">
        <template #title>
          <n-h1>{{ title }}</n-h1>
        </template>
      </page-title>
      <XmlFeedPage />
    </n-space>
  </div>
</template>
