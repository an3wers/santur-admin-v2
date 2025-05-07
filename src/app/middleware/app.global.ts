import { useUserStore } from '~/entities/user/model/use-user-store'
import { publicRoutes } from '~/shared/config/config'

export default defineNuxtRouteMiddleware(async (to) => {
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
  // TODO: Сделать нормальную проверку ролей пользователя
  if (isAuth && to.path !== '/' && !to.path.includes('analytics')) {
    if (!checkRole()) {
      return navigateTo({ path: '/', query: { error: 'checkRole' } })
    }
  }
})
