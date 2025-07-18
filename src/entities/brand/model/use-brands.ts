import { getBrandsKey, useBrandApi, type BrandLetter } from '~/entities/brand'

export const useBrands = async (
  queryKey = getBrandsKey(),
  options: {
    immediate?: boolean
    lazy?: boolean
    transformFn?: <T extends U, U = T>(data: T) => U
  }
) => {
  const { immediate = true, lazy = false, transformFn = (data) => data } = options

  const brandsOptions = reactive({
    letter: 'A', // default "A"
    search: '',
    status: '', // publish status 'Y' | 'N' | ''
    statusDescr: '', // 'Y' | 'N' | ''
    statusImg: '' // logo status // 'Y' | 'N' | ''
  })

  type OptionsType = typeof brandsOptions

  const isFiltered = computed(() => {
    return Boolean(brandsOptions.status || brandsOptions.statusDescr || brandsOptions.statusImg)
  })

  function setBrandsOptions(options: Partial<OptionsType>) {
    Object.keys(options).forEach((key) => {
      const val = options[key as keyof OptionsType]
      if (val !== undefined) {
        brandsOptions[key as keyof OptionsType] = val
      }
    })
  }

  const api = useBrandApi()

  const { data, status, execute, error } = await useAsyncData(
    queryKey,
    () => api.getBrands(brandsOptions),
    {
      watch: [brandsOptions],
      transform: transformFn,
      immediate,
      lazy
    }
  )

  const filtersDisabled = computed(() => {
    if (data.value?.brends) {
      return (
        data.value?.brends.length <= 0 && brandsOptions.letter === '' && brandsOptions.search === ''
      )
    }
    return true
  })

  const lettersRus = computed(() => {
    if (data.value && data.value.letters.length !== 0) {
      return data.value.letters.filter((el) => {
        if (isBrandLetter(el)) {
          return el.lng === 'rus'
        }
        return false
      }) as BrandLetter[]
    }
    return []
  })

  const lettersEng = computed(() => {
    if (data.value && data.value.letters.length !== 0) {
      return data.value.letters.filter((el) => {
        if (isBrandLetter(el)) {
          return el.lng === 'eng'
        }
        return false
      }) as BrandLetter[]
    }
    return []
  })

  function isBrandLetter(letter: BrandLetter | {}): letter is BrandLetter {
    return 'letter' in letter
  }

  function updatePublishForBrandsItem(brandId: number, status: 'Y' | 'N') {
    if (!data.value) {
      return
    }

    const foundBrand = data.value.brends.find((brand) => brand.id === brandId)
    if (foundBrand) {
      foundBrand.published = status === 'Y'
    }
  }

  function clearAllFilters() {
    setBrandsOptions({
      status: '',
      statusDescr: '',
      statusImg: ''
    })
  }

  return {
    brandsOptions,
    data,
    status,
    lettersRus,
    lettersEng,
    isFiltered,
    filtersDisabled,
    error,
    execute,
    setBrandsOptions,
    updatePublishForBrandsItem,
    clearAllFilters
  }
}
