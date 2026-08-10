<script setup lang="ts"></script>
<template>
  <div class="witout-sidebar-layout">
    <main class="main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.main {
  min-height: 100dvh;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
