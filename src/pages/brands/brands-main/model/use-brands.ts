import { getBrandsKey, useBrandApi } from '~/entities/brand'

export const useBrands = async () => {
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
  const { data, status, execute } = await useAsyncData(
    getBrandsKey(),
    () => api.getBrands(brandsOptions),
    {
      watch: [brandsOptions]
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
    return data.value ? data.value.letters.filter((el) => el.lng === 'rus') : []
  })

  const lettersEng = computed(() => {
    return data.value ? data.value.letters.filter((el) => el.lng === 'eng') : []
  })

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
    execute,
    setBrandsOptions,
    updatePublishForBrandsItem,
    clearAllFilters
  }
}
