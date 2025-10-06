import { useBrandApi } from '~/entities/brand'

interface initState {
  selectedBrands: string[]
}

export const useSettingsBrands = (initState: initState) => {
  const currentLetter = ref('A')
  const selectedBrands = ref<string[] | null>(initState.selectedBrands)

  const {
    data: brands,
    status,
    error,
    refresh
  } = useAsyncData(
    'client-projects-settings-brands',
    () =>
      useBrandApi().getBrands({
        letter: currentLetter.value,
        search: '',
        status: '',
        statusDescr: '',
        statusImg: ''
      }),
    {
      lazy: true,
      transform: (data) => {
        return {
          letters: data.letters.filter((l) => 'lng' in l) as {
            letter: string
            qty: number
            lng: string
          }[],
          brends: data.brends.map((b) => ({
            id: b.id,
            name: b.name,
            isChecked: selectedBrands.value?.includes(b.name) || false
          }))
        }
      },
      // getCachedData: (key, nuxtApp) => {
      //   return nuxtApp.payload.data[key] || nuxtApp.static.data[key]
      // },
      watch: [currentLetter]
    }
  )

  const lettersRus = computed(() => {
    return brands.value?.letters.filter((l) => l.lng === 'rus') || []
  })

  const lettersEng = computed(() => {
    return brands.value?.letters.filter((l) => l.lng === 'eng') || []
  })

  function setLetter(letter: string) {
    currentLetter.value = letter
  }

  function toggleBrands(brand: string) {
    if (selectedBrands.value?.includes(brand)) {
      selectedBrands.value = selectedBrands.value.filter((b) => b !== brand)
    } else {
      selectedBrands.value = [...(selectedBrands.value || []), brand]
    }
  }

  function removeBrand(brand: string) {
    const found = brands.value?.brends.find((b) => b.name === brand)

    if (found) {
      found.isChecked = false
    }

    toggleBrands(brand)
  }

  return {
    currentLetter: readonly(currentLetter),
    brands,
    status,
    error,
    lettersRus,
    lettersEng,
    selectedBrands,
    removeBrand,
    setLetter,
    toggleBrands,
    refresh
  }
}
