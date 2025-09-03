<script setup lang="ts">
import { NText, NMenu } from 'naive-ui'
import { useNavStore } from '~/shared/navigation'

const navStore = useNavStore()

const selectedKey = ref('')

const computedSelectedKey = computed({
  get: () => {
    let firstLevelItem = navStore.mapNavigation?.[navStore.firstLevelName]

    if (!firstLevelItem || !navStore.navigationWithZeroLavel) return ''

    let hasMenu: boolean = true

    for (const menuItem of navStore.navigationWithZeroLavel) {
      const hasItem = menuItem.items.some(
        (item) => item.id === firstLevelItem?.id && item.modelName === firstLevelItem?.modelName
      )

      if (hasItem) {
        hasMenu = true
        break
      }

      hasMenu = false
    }

    if (!hasMenu && navStore.secondLevelId > 0) {
      firstLevelItem = navStore.currentSubmenuItem || undefined
    }

    return `${firstLevelItem!.modelName}-${firstLevelItem!.id}`
  },
  set: (value) => {
    selectedKey.value = value
  }
})
</script>
<template>
  <div class="nav-container">
    <div class="nav-container__title">
      <NText depth="3">Разделы</NText>
    </div>
    <div class="nav-container__menu">
      <NMenu
        v-model:value="computedSelectedKey"
        accordion
        :options="navStore.getMenuOptionsWithZeroLavel"
        :theme-overrides="{ itemHeight: '32px' }"
        :indent="12"
      />
    </div>
  </div>
</template>

<style scoped>
.nav-container {
  flex-grow: 1;
  min-height: 200px;
  overflow-y: auto;
}

.nav-container__title {
  font-size: var(--font-size-sm);
  margin-inline: 0.75rem;
}
</style>
