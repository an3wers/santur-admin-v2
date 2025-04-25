export default defineEventHandler((event) => {
  setCookie(event, 'test', 'test123', {
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    expires: new Date(Date.now() + 1000 * 60 * 60)
  })
  return { data: '', success: true, message: 'Set cookie' }
})
