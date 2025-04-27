export default defineEventHandler(async (event) => {
  const { apiGateway } = useRuntimeConfig().public

  const body = await readBody(event)
  const refreshToken = getCookie(event, '_user_refresh_token')

  if (!refreshToken) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Token is not found'
    })
  }

  const res = await $fetch.raw(`${apiGateway}Auth/Refresh`, {
    method: 'POST',
    body: {
      refreshToken,
      deviceInfo: body.deviceId
    },
    ignoreResponseError: true
  })

  if (!res.ok) {
    throw createError({
      statusCode: res.status,
      statusMessage: res.statusText
    })
  }

  const { data, success, message } = res._data as {
    [key: string]: unknown
    data: {
      accessToken: string
      refreshToken: string
    }
  }

  if (!success) {
    throw createError({
      statusCode: res.status,
      statusMessage: res.statusText,
      data: message || 'Bad request'
    })
  }

  const expresDate1 = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
  setCookie(event, '_user_token', data.accessToken, {
    httpOnly: false,
    secure: false,
    expires: expresDate1
  })

  const expresDate30 = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
  setCookie(event, '_user_refresh_token', data.refreshToken, {
    httpOnly: true,
    secure: true,
    expires: expresDate30,
    sameSite: 'lax'
  })

  return res._data
})
