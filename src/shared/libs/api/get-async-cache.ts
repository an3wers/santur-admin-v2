import type { NuxtApp } from '#app'

export const getCacheWithTTL = (key: string, nuxtApp: NuxtApp, ttl = 5) => {
  const data = nuxtApp.payload.data[key] || nuxtApp.static.data[key]
  if (!data) {
    return
  }

  const expirationDate = new Date(data.fetchedAt)
  expirationDate.setTime(expirationDate.getTime() + ttl * 60 * 1000)
  const isExpired = expirationDate.getTime() < Date.now()
  if (isExpired) {
    return
  }

  return data
}

export const getCache = (key: string, nuxtApp: NuxtApp) => {
  return nuxtApp.payload.data[key] || nuxtApp.static.data[key]
}
