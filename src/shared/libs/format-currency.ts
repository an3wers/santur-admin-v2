export const fromatCurrency = (n: number, curr = 'RUB', LanguageFormat = 'Ru-ru') => {
  if (typeof n === 'number' && n > -1) {
    return Intl.NumberFormat(LanguageFormat, {
      style: 'currency',
      currency: curr
    }).format(n)
  }

  return ''
}

export const stringToNumber = (str: string) => {
  // Удаляем все пробелы из строки и преобразуем в число
  return Number(str.replace(/\s/g, ''))
}
