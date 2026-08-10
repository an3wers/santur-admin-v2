/**
 * Formats a given date into a string with the format `dd.mm.yyyy`.
 *
 * @param date - The date to format. Defaults to the current date if not provided.
 * @returns A string representing the formatted date in `dd.mm.yyyy` format.
 * @example Return "01.02.2010"
 */
export const formatDateForServer = (date = new Date()) => {
  let dd: string | number = date.getDate()
  let mm: string | number = date.getMonth() + 1
  const yy = date.getFullYear()

  if (dd < 10) {
    dd = '0' + dd
  }
  if (mm < 10) {
    mm = '0' + mm
  }

  return `${dd}.${mm}.${yy}`
}

/**
 * Formats a given date into a string with the format `yyyy-mm-dd`.
 *
 * @param date - The date to format, example: "02.12.2025"
 * @returns A string representing the formatted date in `yyyy-mm-dd` format.
 * @example Return "2025-12-02"
 */
export const formatDateForInput = (date: string) => {
  if (!date || date === '') {
    return ''
  }

  const [dd, mm, yy] = date.split('.')
  return `${yy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
}
