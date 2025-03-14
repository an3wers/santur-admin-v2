<script setup lang="ts">
import { NH1, NSpace } from 'naive-ui'
import { CategoryList } from '~/entities/category'
import { useNavStore } from '~/shared/navigation'
import PageTitle from '~/shared/ui/page-title/PageTitle.vue'

const navStore = useNavStore()
</script>

<template>
  <div class="container">
    <n-space vertical size="large">
      <page-title>
        <template #title>
          <n-h1>
            {{ navStore.currentNavigationMenu?.label }}
          </n-h1>
        </template>
      </page-title>
      <CategoryList
        v-if="navStore.currentNavigationMenu"
        :items="navStore.currentNavigationMenu.items"
      />
    </n-space>
  </div>
</template>
