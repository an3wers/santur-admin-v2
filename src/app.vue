<script setup lang="ts">
import ConfigProvider from './app/provider/ConfigProvider.vue'
</script>

<template>
  <NuxtLoadingIndicator color="#1976d2" />
  <ConfigProvider>
    <div class="app">
      <!-- TODO: Error Boundary -->
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
  </ConfigProvider>
</template>
