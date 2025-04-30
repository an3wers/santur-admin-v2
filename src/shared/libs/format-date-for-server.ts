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
