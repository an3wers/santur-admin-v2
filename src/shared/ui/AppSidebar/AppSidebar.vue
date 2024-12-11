<script setup lang="ts"></script>
<template>
  <div class="sidebar">
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
</style>
