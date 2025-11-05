import { useUserStore } from '~/entities/user'

export default defineNuxtRouteMiddleware((to) => {
  const userStore = useUserStore()

  let hasPermission = true

  const ctx = to.meta?.ctx

  if (ctx) {
    hasPermission = userStore.checkPermissions(ctx as string)
  }

  if (!hasPermission) {
    return navigateTo('/')
  }
})
