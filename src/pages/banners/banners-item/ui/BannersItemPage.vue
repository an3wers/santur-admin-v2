<script setup lang="ts">
import { NSpace, NH1 } from 'naive-ui'
import { useBannerApi } from '~/entities/banner'
import BannerEditItem from '~/features/banner/ui/BannerEditItem.vue'

const route = useRoute()

const { itemId, catId } = route.params

const title = ref('')

const { getBanner } = useBannerApi()
const { data, status, error } = await useAsyncData(
  `banner-${String(itemId)}`,
  () => getBanner(Number(itemId as string)),
  {
    lazy: false
  }
)

if (status.value === 'error') {
  throw createError({
    statusCode: 400,
    statusMessage: error.value?.message || 'Произошла ошибка при загрузке баннера',
    fatal: true
  })
}

if (status.value === 'success' && data.value) {
  title.value = data.value.name
}
</script>

<template>
  <div class="container">
    <n-space vertical size="large">
      <page-title back-label="Баннеры" has-back :back-path="`/banners/${$route.params.catId}`">
        <template #title>
          <n-h1>{{ title }}</n-h1>
        </template>
      </page-title>

      <BannerEditItem :banner="data ?? undefined" :owner-id="Number(catId as string)" />
    </n-space>
  </div>
</template>

<style scoped></style>
