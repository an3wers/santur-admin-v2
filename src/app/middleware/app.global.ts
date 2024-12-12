import { useUserStore } from '~/entities/user/model/user.store'
import { publicRoutes } from '~/shared/config/config'

export default defineNuxtRouteMiddleware(async (to) => {
  const { checkAuth } = useUserStore()

  // console.log('@META', (to.meta.meta as string[])[0])

  const isAuth = await checkAuth() // false //

  if (
    !isAuth &&
    to.path !== publicRoutes['sign-in'] &&
    to.path !== publicRoutes['fogot-password']
  ) {
    return navigateTo({ path: publicRoutes['sign-in'] })
  }

  if (
    isAuth &&
    (to.path === publicRoutes['sign-in'] || to.path === publicRoutes['fogot-password'])
  ) {
    return navigateTo({ path: '/' })
  }
})
