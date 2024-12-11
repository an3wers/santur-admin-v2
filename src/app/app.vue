<script setup lang="ts">
import ConfigProvider from './provider/ConfigProvider.vue'
</script>

<template>
  <ConfigProvider>
    <NuxtLayout>
      <NuxtPage :page-key="(route: any) => route.fullPath" />
    </NuxtLayout>
  </ConfigProvider>
</template>
