<script setup lang="ts">
import { useNavStore } from '~/shared/navigation'
import AppSidebar from '~/shared/ui/AppSidebar/AppSidebar.vue'

// import { storeToRefs } from 'pinia'
// import AppSidebar from '~/components/common/Sidebar/AppSidebar.vue'
// import AppSubSidebar from '~/components/common/Sidebar/AppSubSidebar.vue'
// import { useNavStore } from '~/stores/Navigation/index'
// import { useResourcesStore } from '~/stores/Resources/index'

// const navStore = useNavStore()
// const { loadResurces, checkAndSetActiveResource, saveActiveResourceToLS } = useResourcesStore()
// const { activeResource } = storeToRefs(useResourcesStore())
// const route = useRoute()
// const refMain = ref(null)

// try {
//   await loadResurces()
//   checkAndSetActiveResource()
//   await navStore.loadMenu(activeResource.value)
//   saveActiveResourceToLS(activeResource.value)
// } catch (error) {
//   throw createError({ fatal: false, statusMessage: 'Произошла ошибка' })
// }

// watch(activeResource, () => {
//   if (route.params?.slug) {
//     navigateTo(`/${route.params.slug}`)
//   }
// })

// const getSubmenu = computed(() => {
//   if ('slug' in route.params && !Array.isArray(route.params.slug)) {
//     return navStore.getSubMenu(route.params.slug)
//   }
//   // TODO: Рефакторинг
//   else if (route.name?.toString().includes('analytics')) {
//     return navStore.getSubMenu('analytics')
//   } else if (route.name?.toString().includes('pvzs')) {
//     return navStore.getSubMenu('pvzs')
//   }
//   return { label: '', items: [], needSubmenu: false }
// })

// // TODO: Добавил костыль, но нужно переделывать компонент
// const hasActionButton = computed(() => {
//   return getSubmenu.value.label !== 'Аналитика'
// })
const navStore = useNavStore()
async function initLayout() {
  try {
    await navStore.loadResurces()
    navStore.checkAndSetActiveResource()
    await navStore.loadMenu(navStore.activeResource)
    navStore.saveActiveResourceToLS(navStore.activeResource)
  } catch (error) {
    throw createError({ fatal: false, statusMessage: 'Произошла ошибка при инициализации' })
  }
}

await initLayout()
</script>

<template>
  <div class="default-layout">
    <div class="wrapper">
      <!-- <AppSidebar />
      <AppSubSidebar
        v-if="getSubmenu.needSubmenu"
        :title="getSubmenu.label"
        :categories="getSubmenu.items"
        :has-add-action="hasActionButton"
      /> -->
      <AppSidebar>
        <template #navigation> </template>
        <template #footer></template>
      </AppSidebar>
      <main class="main">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: row;
  align-items: start;
}

.main {
  flex-grow: 1;
}
</style>
