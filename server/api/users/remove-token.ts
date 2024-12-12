export default defineEventHandler((event) => {
  setCookie(event, '_user_token', '', { expires: new Date(-1) })
  setCookie(event, '_user_refresh_token', '', { expires: new Date(-1) })
  return { data: '', success: true, message: 'Removed rokens' }
})
