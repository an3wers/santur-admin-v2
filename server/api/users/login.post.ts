interface LoginResponse {
  id: number
  accessToken: string
  refreshToken: string
}

export default defineEventHandler(async (event) => {
  const { apiGateway } = useRuntimeConfig().public
  const body = await readBody(event)

  const res = await $fetch.raw(`${apiGateway}Auth/SignIn`, {
    method: 'POST',
    body,
    ignoreResponseError: true
  })

  if (!res.ok) {
    const { message } = res._data as Record<string, unknown>

    throw createError({
      statusCode: res.status,
      statusMessage: res.statusText,
      data: res._data,
      message: JSON.stringify(message)
    })
  }
  // TODO: Типизировать
  const data = res._data as {
    [key: string]: unknown
    data: LoginResponse
  }
  if (!data?.success) {
    throw createError({
      statusCode: 400,
      statusText: 'Что-то пошло не так'
    })
  }

  const expresDate1 = new Date(Date.now() + 1000 * 60 * 60 * 24 * 1)
  setCookie(event, '_user_token', data.data.accessToken, {
    httpOnly: false,
    secure: false,
    expires: expresDate1
  })

  // TODO: Заменить на exp date из запроса
  const expresDate30 = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
  setCookie(event, '_user_refresh_token', data.data.refreshToken, {
    httpOnly: true,
    secure: true,
    expires: expresDate30,
    sameSite: 'lax'
  })

  return data
})
