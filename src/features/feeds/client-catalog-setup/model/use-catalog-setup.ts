import { groupCatalogItems, useCatalogApi } from '~/entities/catalog'
import type { BrandItem, BrandsFilter, CategoryId, SubjectItem } from './types'
import { useClientCatalogApi } from '~/entities/feeds'
import type { AsyncDataRequestStatus } from '#app'

export const useCatalogSetup = () => {
  const currentSubject = ref<SubjectItem | null>()

  const brandsFilter = ref(new Map<CategoryId, BrandItem[]>())

  function setCurrentSubject(subject: SubjectItem) {
    currentSubject.value = subject
  }

  function clearSubject() {
    currentSubject.value = null
  }

  const subjectId = computed(() => {
    return currentSubject.value?.id ?? 0
  })

  const clientCatalogFilterKey = computed(() => {
    return `client-catalog-filter-${subjectId.value}`
  })

  const { getFilterSubject, saveFilterSubject: saveFilterSubjectApi } = useClientCatalogApi()

  const {
    data: filterData,
    status: filterStatus,
    execute: filterExecute
  } = useAsyncData(clientCatalogFilterKey, () => getFilterSubject(subjectId.value), {
    transform: (data) => {
      return { data, fetchedAt: new Date() }
    },
    immediate: false
  })

  const { getCatalog } = useCatalogApi()

  const clientCatalogCategoriesKey = computed(() => {
    return `client-catalog-categories-${subjectId.value}`
  })

  const {
    data: categoriesData,
    status: categoriesStatus,
    execute: categoriesExecute
  } = useAsyncData(
    clientCatalogCategoriesKey,
    () => {
      if (!filterData.value) {
        return Promise.resolve(null)
      }
      return getCatalog()
    },
    {
      transform: (data) => {
        if (!data) {
          return null
        }

        const mapped = data.map((item) => ({
          id: item.id,
          name: item.name,
          parent_id: item.parent_id,
          vid: item.vid,
          isChecked: !!filterData.value?.data.categories.some((category) => category.id === item.id)
        }))

        return { data: groupCatalogItems(mapped), fetchedAt: new Date() }
      },
      immediate: false
    }
  )

  watch(currentSubject, (newVal, oldValue) => {
    if (oldValue !== null || newVal == null) {
      // TODO: reset brandsFilter
    }
  })

  watchEffect(() => {
    if (currentSubject.value) {
      filterExecute()
    }
  })

  watchEffect(() => {
    if (filterData.value) {
      categoriesExecute()
      // TODO: обновить brandsFilter
    }
  })

  const loading = computed(() => {
    return filterStatus.value === 'pending' || categoriesStatus.value === 'pending'
  })

  const saveFilterSubjectStatus = ref<AsyncDataRequestStatus>('idle')

  async function saveFilterSubject() {
    if (!currentSubject.value) {
      return
    }

    try {
      saveFilterSubjectStatus.value = 'pending'
      console.log('@', {
        subjectId: currentSubject.value.id,
        title: currentSubject.value.name,
        descr: '',
        startData: '',
        finishData: '',
        categories: getCheckedCategories()
      })

      // await saveFilterSubjectApi({
      //   subjectId: currentSubject.value.id,
      //   title: currentSubject.value.name,
      //   descr: '',
      //   startData: '',
      //   finishData: '',
      //   categories: getCheckedCategories()
      // })
      saveFilterSubjectStatus.value = 'success'
    } catch (error) {
      console.error(error)
      saveFilterSubjectStatus.value = 'error'
    }
  }

  function getCheckedCategories() {
    if (!categoriesData.value) {
      return []
    }

    const result: {
      id: number
      title: string
      brends: BrandItem[]
    }[] = []

    categoriesData.value.data.forEach((parent) => {
      parent.child.forEach((item) => {
        if (item.isChecked) {
          result.push({
            id: item.id,
            title: item.name,
            brends: brandsFilter.value.get(item.id) || []
          })
        }
      })
    })

    return result
  }

  return {
    currentSubject,
    setCurrentSubject,
    clearSubject,
    loading,
    categoriesData,
    filterData,
    saveFilterSubject,
    saveFilterSubjectStatus
  }
}
