export const transformPlatformOptions = (
  ctx: string,
  options: string[]
): { label: string; value: string }[] => {
  if (ctx === '1') {
    return options
      .filter((el) => !el.includes('santur'))
      .map((el) => {
        if (el === 'YAND') {
          return {
            label: 'Яндекс',
            value: 'YAND'
          }
        } else if (el === 'default') {
          return {
            label: 'По умолчанию',
            value: 'default'
          }
        } else {
          return {
            label: el,
            value: el
          }
        }
      })
  } else if (ctx === '2') {
    return options
      .filter((el) => el.includes('santur'))
      .map((el) => {
        if (el === 'santur:ur') {
          return {
            label: 'Юр.лица',
            value: 'santur:ur'
          }
        } else if (el === 'santur:phis') {
          return {
            label: 'Физ.лица',
            value: 'santur:phis'
          }
        } else if (el === 'santur:guest') {
          return {
            label: 'Без авторизации',
            value: 'santur:guest'
          }
        } else {
          return {
            label: el,
            value: el
          }
        }
      })
  } else {
    return options.map((el) => ({ label: el, value: el }))
  }
}
