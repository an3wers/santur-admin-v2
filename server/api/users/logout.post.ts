export default defineEventHandler(async (event) => {
  const { gatewayUrl } = useRuntimeConfig().public

  const refreshToken = getCookie(event, '_user_refresh_token')
  const accessToken = getCookie(event, '_user_token')

  if (!refreshToken) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Token is not found'
    })
  }

  if (!accessToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const res = await $fetch.raw(`${gatewayUrl}Auth/SignOut`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: {
      refreshToken
    },
    ignoreResponseError: true
  })

  return res._data
})
