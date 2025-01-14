<script setup lang="ts">
import ConfigProvider from './app/provider/ConfigProvider.vue'
</script>

<template>
  <ConfigProvider>
    <div class="app">
      <NuxtLoadingIndicator color="#1976d2" />
      <!-- TODO: Error Boundary -->
      <NuxtLayout>
        <NuxtPage :page-key="(route: any) => route.fullPath" />
      </NuxtLayout>
    </div>
  </ConfigProvider>
</template>
