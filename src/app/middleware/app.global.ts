import { useUserStore } from '~/entities/user/model/use-user-store'
import { publicRoutes } from '~/shared/config/config'
// import { useAppRequest } from '~/shared/libs/api/useAppRequests'

export default defineNuxtRouteMiddleware(async (to) => {
  // const { baseFetch } = useAppRequest()
  // const res = await baseFetch('/api/users/app-cookie', { method: 'GET' })

  // await $fetch('/api/test/set-cookie', { method: 'POST' })

  const { checkAuth, $reset, checkRole } = useUserStore()
  const isAuth = await checkAuth()

  if (
    !isAuth &&
    to.path !== publicRoutes['sign-in'] &&
    to.path !== publicRoutes['fogot-password']
  ) {
    return await navigateTo({ path: publicRoutes['sign-in'] })
  }

  if (to.path === publicRoutes['sign-in'] && isAuth && to.query.meta === 'error') {
    $reset()
    return await navigateTo({ path: '/profile/sign-in' })
  }

  if (
    isAuth &&
    (to.path === publicRoutes['sign-in'] || to.path === publicRoutes['fogot-password'])
  ) {
    return navigateTo({ path: '/' })
  }

  if (isAuth && to.path !== '/' && !to.path.includes('analytics')) {
    if (!checkRole()) {
      return navigateTo({ path: '/', query: { error: 'checkRole' } })
    }
  }
})
