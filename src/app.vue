<script setup lang="ts">
import ConfigProvider from './app/provider/ConfigProvider.vue'
</script>

<template>
  <ConfigProvider>
    <div class="app">
      <NuxtLayout>
        <NuxtPage :page-key="(route: any) => route.fullPath" />
      </NuxtLayout>
    </div>
  </ConfigProvider>
</template>
