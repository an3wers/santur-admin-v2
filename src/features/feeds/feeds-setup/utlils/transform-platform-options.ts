import type { FeedKeyRes } from '~/entities/feeds'

export const transformPlatformOptions = (
  ctx: string,
  options: FeedKeyRes[]
): { label: string; value: string; descr: string }[] => {
  if (ctx === '1' || ctx === '3') {
    return options
      .filter((el) => !el.key.includes('santur'))
      .map((el) => ({ label: el.title, value: el.key, descr: el.descr }))
  } else if (ctx === '2') {
    return options
      .filter((el) => el.key.includes('santur'))
      .map((el) => ({ label: el.title, value: el.key, descr: el.descr }))
  } else {
    return options.map((el) => ({ label: el.title, value: el.key, descr: el.descr }))
  }
}
