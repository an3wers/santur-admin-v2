import { getBrandsKey, useBrandApi, type BrandLetter } from '~/entities/brand'

interface Options {
  immediate?: boolean
  lazy?: boolean
  transform?: <T extends { brends: any[]; letters: any[] }, U = T>(data: T) => U
}

export const useBrands = async (queryKey = getBrandsKey(), options?: Options) => {
  const brandsOptions = reactive({
    letter: 'A',
    search: '',
    status: '', // publish status 'Y' | 'N' | ''
    statusDescr: '', // 'Y' | 'N' | ''
    statusImg: '' // logo status // 'Y' | 'N' | ''
  })

  type OptionsType = typeof brandsOptions
  type OptionsTypeKeys = keyof OptionsType

  const isFiltered = computed(() => {
    return Boolean(brandsOptions.status || brandsOptions.statusDescr || brandsOptions.statusImg)
  })

  function setBrandsOptions(options: Partial<OptionsType>) {
    Object.keys(options).forEach((key) => {
      const val = options[key as OptionsTypeKeys]
      if (val !== undefined) {
        if (key === 'letter' && val === brandsOptions[key]) {
          return
        }

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
      transform: options?.transform || ((data) => data),
      immediate: options && 'immediate' in options ? options.immediate : true,
      lazy: options && 'lazy' in options ? options.lazy : false
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
