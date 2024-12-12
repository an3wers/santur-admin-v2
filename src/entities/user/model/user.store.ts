import { useUserApi } from '../api/user.api'
import type { LoginRequest } from '../api/user.schemas'
import type { User } from './user.types'
import { nanoid } from 'nanoid'

export const useUserStore = defineStore('user', () => {
  const api = useUserApi()
  const user = ref<User | null>(null)
  const userId = ref<number | null>(null)
  const isLoaded = ref(false)

  const isAuthenticated = computed(() => !!user.value?.id)

  async function loadUser() {
    isLoaded.value = false
    const userData = await api.getUser(userId.value)

    if (!userData) {
      throw Error('Пользователь не найден')
    }

    _checkRole(userData)
    user.value = userData
    isLoaded.value = true
    return userData
  }

  async function checkAuth() {
    if (!isLoaded.value) {
      try {
        await loadUser()
      } catch (error) {
        console.error('[checkAuth]: ', error)
        api.removeToken()
        _removeDeviceId()
        user.value = null
      }
    }
    return isAuthenticated.value
  }

  async function login(data: Omit<LoginRequest, 'deviceInfo'>) {
    try {
      const deviceInfo = _getDiviceId()
      const { id } = await api.loginAndGetToken({ ...data, deviceInfo })
      userId.value = id
      await loadUser()
    } catch (error) {
      console.error('[login]: ', error)
      throw error
    }
  }

  async function logout() {
    try {
      const res = await api.logout()
      await api.removeToken()

      userId.value = null
      user.value = null
      _removeDeviceId()

      return res
    } catch (error) {
      console.error('[logout]: ', error)
      throw error
    }
  }

  function _checkRole(user: User) {
    if (user.rights !== 'guest' && !(user.rights.includes('ADM') || user.rights.includes('MRKT'))) {
      throw new Error('У вас не хватает прав')
    }
    return true
  }

  function _removeDeviceId() {
    localStorage.removeItem('deviceId')
  }

  function _getDiviceId() {
    const deviceId = localStorage.getItem('deviceId')

    if (deviceId) {
      return deviceId
    }

    const newDevieId = nanoid()
    localStorage.setItem('deviceId', newDevieId)
    return newDevieId
  }

  function $reset() {
    user.value = null
    userId.value = null
    isLoaded.value = false
  }

  return { $reset, isAuthenticated, checkAuth, login, logout, user }
})
