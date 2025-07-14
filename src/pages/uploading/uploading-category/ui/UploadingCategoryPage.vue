<script setup lang="ts">
import { NSpace, NH1 } from 'naive-ui'
import UploadingXmlFeed from '~/entities/uploading/ui/UploadingXmlFeed.vue'
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
      <UploadingXmlFeed />
    </n-space>
  </div>
</template>
