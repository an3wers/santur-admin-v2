import type { FilterKeyDto } from '~/entities/uploading/api/types'

export const transformPlatformOptions = (
  ctx: string,
  options: FilterKeyDto[]
): { label: string; value: string; descr: string }[] => {
  if (ctx === '1') {
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
