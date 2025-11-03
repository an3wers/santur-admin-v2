import { useBrandApi } from '~/entities/brand'
import type { FeedBrands } from './types'

export const useFeedsBrands = () => {
  const currentLetter = ref('A')
  const excludedBrands = ref<string[]>([])

  const brands = ref<FeedBrands | null>(null)
  const status = ref<ProcessStatus>('idle')

  async function getBrands() {
    try {
      status.value = 'pending'
      const res = await useBrandApi().getBrands({
        letter: currentLetter.value,
        search: '',
        status: '',
        statusDescr: '',
        statusImg: ''
      })

      brands.value = {
        letters: res.letters.filter((l) => 'lng' in l) as {
          letter: string
          qty: number
          lng: string
        }[],
        brends: res.brends.map((b) => ({
          id: b.id,
          name: b.name,
          published: b.published,
          isChecked: !excludedBrands.value.includes(b.name)
        }))
      }

      status.value = 'success'
    } catch (error) {
      console.error(error)
      status.value = 'error'
    }
  }

  watch(currentLetter, () => {
    if (currentLetter.value) {
      getBrands()
    }
  })

  function setLetter(letter: string) {
    currentLetter.value = letter
  }

  function toggleExcludedBrand(brand: string) {
    if (excludedBrands.value.includes(brand)) {
      excludedBrands.value = excludedBrands.value.filter((b) => b !== brand)
    } else {
      excludedBrands.value.push(brand)
    }
  }

  function initExcludedBrands(brands: string[]) {
    excludedBrands.value = brands
  }

  const lettersRus = computed(() => {
    return brands.value?.letters.filter((l) => l.lng === 'rus') || []
  })

  const lettersEng = computed(() => {
    return brands.value?.letters.filter((l) => l.lng === 'eng') || []
  })

  function resetState() {
    currentLetter.value = 'A'
    excludedBrands.value = []
    brands.value = null
    status.value = 'idle'
  }

  return {
    excludedBrands,
    lettersRus,
    lettersEng,
    brands,
    currentLetter,
    status,
    toggleExcludedBrand,
    initExcludedBrands,
    getBrands,
    setLetter,
    resetState
  }
}
