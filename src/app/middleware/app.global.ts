import { useUserStore } from '~/entities/user/model/user.store'
import { publicRoutes } from '~/shared/config/config'
// import { useAppRequest } from '~/shared/libs/api/useAppRequests'

export default defineNuxtRouteMiddleware(async (to) => {
  // const { baseFetch } = useAppRequest()
  // const res = await baseFetch('/api/users/app-cookie', { method: 'GET' })

  const { checkAuth, $reset } = useUserStore()
  const isAuth = await checkAuth()

  if (
    !isAuth &&
    to.path !== publicRoutes['sign-in'] &&
    to.path !== publicRoutes['fogot-password']
  ) {
    return navigateTo({ path: publicRoutes['sign-in'] })
  }

  if (to.path === publicRoutes['sign-in'] && isAuth && to.query.meta === 'error') {
    $reset()
    return navigateTo({ path: '/profile/sign-in' })
  }

  if (
    isAuth &&
    (to.path === publicRoutes['sign-in'] || to.path === publicRoutes['fogot-password'])
  ) {
    return navigateTo({ path: '/' })
  }
})
