<script setup lang="ts">
import { APP_SUB_NAME } from '~/shared/config/constants'
import { NText } from 'naive-ui'
</script>
<template>
  <div class="sidebar">
    <div class="logo-container">
      <div class="logo-img">
        <NuxtLink href="/">
          <img src="/logo/logo.svg" alt="logo" />
        </NuxtLink>
      </div>
      <n-text depth="3" class="logo-descr">{{ APP_SUB_NAME }}</n-text>
    </div>
    <slot name="navigation" />
    <slot name="footer" />
  </div>
</template>

<style scoped>
.sidebar {
  background-color: var(--white);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100dvh;
  padding: 1rem 0.5rem 1.25rem 0.5rem;
  width: 260px;
  min-width: 260px;
  top: 0px;
  position: sticky;
  border-right: 1px solid var(--gray-200);
}

.logo-container {
  margin: 0 0.75rem;
}

.logo-descr {
  font-size: var(--font-size-sm);
}
</style>
