export default defineEventHandler(async (event) => {
  const { apiGateway } = useRuntimeConfig().public

  const cookieToken = getCookie(event, '_user_token')
  const { id } = getQuery(event)

  let _id: string = id === '0' ? '' : (id as string)

  if (!cookieToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  // Если не передан id, то берем из токена
  if (!_id) {
    const [_, payloadEncoded] = cookieToken.split('.')
    const payload = Buffer.from(payloadEncoded, 'base64').toString('utf-8')
    _id = JSON.parse(payload).sub
  }

  const res = await $fetch.raw(`${apiGateway}Auth/GetUser?id=${_id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${cookieToken}`
    },
    ignoreResponseError: true
  })

  if (!res.ok) {
    throw createError({
      statusCode: res.status,
      statusMessage: res.statusText
    })
  }

  return res._data
})
