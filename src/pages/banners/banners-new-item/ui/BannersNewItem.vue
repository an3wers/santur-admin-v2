<script setup lang="ts">
import { NSpace, NH1 } from 'naive-ui'
import BannerEditItem from '~/features/banner/ui/BannerEditItem.vue'

const title = ref('Новый баннер')

const route = useRoute()

const { catId } = route.params
</script>

<template>
  <div class="container">
    <n-space vertical size="large">
      <page-title back-label="Баннеры" has-back :back-path="`/banners/${$route.params.catId}`">
        <template #title>
          <n-h1>{{ title }}</n-h1>
        </template>
      </page-title>

      <BannerEditItem :owner-id="Number(catId as string)" />
    </n-space>
  </div>
</template>

<style scoped></style>
