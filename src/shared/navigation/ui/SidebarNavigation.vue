<script setup lang="ts">
import { NMenu } from 'naive-ui'
import { useNavStore } from '../model/nav.store'

const navStore = useNavStore()
const route = useRoute()

const selectedKey = ref(0)

const slug = route.name?.toString().split('-')[0]
if (slug) {
  selectedKey.value = navStore.mapNavigation?.[slug].id ?? 0
}
</script>

<template>
  <div class="siderbar-nav-container">
    <div class="siderbar-nav-container__menu">
      <NMenu v-model:value="selectedKey" :options="navStore.getMenuOptions" />
    </div>
  </div>
</template>

<style scoped></style>
