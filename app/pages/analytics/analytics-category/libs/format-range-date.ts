export const formatRangeDate = (dates: [number, number]): string => {
  return dates
    .map((el) => {
      const curr = new Date(el)

      const y = curr.getFullYear()
      const m = curr.getMonth() + 1
      const d = curr.getDate()

      return `${d < 10 ? '0' + d : d}.${m < 10 ? '0' + m : m}.${y}`
    })
    .join(':')
}
