import { useUserApi } from '../api/user-api'
import type { LoginRequest } from '../api/user-schemas'
import type { User } from './user-types'
import { nanoid } from 'nanoid'

export const useUserStore = defineStore('user', () => {
  const api = useUserApi()

  const user = ref<User | null>(null)
  const userId = ref<number | null>(null)

  // TODO: Заменить на статус: idle | pending | success | error
  const isLoaded = ref(false)

  const isAuthenticated = computed(() => !!user.value?.id)

  async function loadUser() {
    try {
      isLoaded.value = false
      const userData = await api.getUser(userId.value)
      // console.log('userData', userData)
      if (!userData) {
        throw Error('Пользователь не найден')
      }

      user.value = userData
      isLoaded.value = true
      return userData
    } catch (error) {
      console.error('[loadUser]', error)
      throw error
    } finally {
      isLoaded.value = true
    }
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

  function checkRole(payload?: User) {
    if (!payload) {
      payload = user.value ?? undefined
    }

    if (!payload) {
      return false
    }

    if (
      payload.rights !== 'guest' &&
      !(payload.rights.includes('ADM') || payload.rights.includes('MRKT'))
    ) {
      return false
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

  return { $reset, isAuthenticated, checkAuth, login, logout, user, checkRole }
})
