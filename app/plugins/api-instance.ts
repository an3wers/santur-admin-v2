export default defineNuxtPlugin({
  setup() {
    const { apiBase: baseUrl } = useRuntimeConfig().public

    const apiBase = $fetch.create({
      baseURL: typeof baseUrl === 'string' ? baseUrl : '',
      credentials: 'include',
      onRequest({ request }) {
        console.log('[fetch request]', request)
      },
      onResponse({ request }) {
        console.log('[fetch response]', request)
      },
      onRequestError({ request, error }) {
        console.log('[fetch request error]', request, error)
      },
      onResponseError({ request, response }) {
        console.log('[fetch response error]', request, response)
      }
    })

    return {
      provide: {
        apiBase
      }
    }
  }
})
