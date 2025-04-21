export const useBannersCategory = () => {
  const page = ref(1)
  const search = ref('')
  const sort = ref('nn')

  function setPage(newPage: number) {
    page.value = newPage

    scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return { setPage, search, sort, page }
}
