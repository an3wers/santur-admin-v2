<script setup lang="ts">
import { MediaList } from '~/entities/media'
import { useNavStore } from '~/shared/navigation'
import PageTitle from '~/shared/ui/PageTitle/PageTitle.vue'
import { NH1, NButton } from 'naive-ui'

const navStore = useNavStore()
</script>

<template>
  <div class="media-container">
    <media-list>
      <template #header="{ onUpload }">
        <page-title back-label="Главная" has-back :back-path="`/`">
          <template #title>
            <n-h1>
              {{ navStore.currentNavigationMenu?.label }}
            </n-h1>
          </template>
          <template #actions>
            <n-button type="primary" @click="onUpload">Загрузить файл</n-button>
          </template>
        </page-title>
      </template>
    </media-list>
    <!-- Modal file preview -->
  </div>
</template>

<style scoped lang="css">
.media-container {
  height: 100%;
  margin: 0 auto;
  padding: 1rem 1rem;
  width: 100%;
}
</style>
