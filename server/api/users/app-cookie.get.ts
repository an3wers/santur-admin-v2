export default defineEventHandler((event) => {
  const cookieToken = getCookie(event, 'ASP.NET_SessionId')
  return { cookieToken }
})
