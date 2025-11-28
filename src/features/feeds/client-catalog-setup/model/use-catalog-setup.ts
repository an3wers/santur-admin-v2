import { groupCatalogItems, useCatalogApi } from '~/entities/catalog'
import type { BrandItem, BrandsFilter, CategoryId, CategoryItem, SubjectItem } from './types'
import { useClientCatalogApi } from '~/entities/feeds'
import type { AsyncDataRequestStatus } from '#app'

export const useCatalogSetup = (subject: MaybeRefOrGetter<SubjectItem>) => {
  const brandsFilter = ref(new Map<CategoryId, BrandItem[]>())

  function setupBrandsFilter() {
    brandsFilter.value.clear()

    filterData.value?.data.categories.forEach((el) => {
      if (el.brends.length) {
        brandsFilter.value.set(el.id, el.brends)
      }
    })
  }

  function updateBrandsFilter(categoryId: CategoryId, brands: BrandItem[]) {
    if (!brands.length) {
      brandsFilter.value.delete(categoryId)
    } else {
      brandsFilter.value.set(categoryId, brands)
    }
  }

  const subjectId = computed(() => {
    return toValue(subject)?.id ?? 0
  })

  const { getFilterSubject, saveFilterSubject: saveFilterSubjectApi } = useClientCatalogApi()

  const {
    data: filterData,
    status: filterStatus,
    execute: filterExecute
  } = useAsyncData(
    `client-catalog-filter-${subjectId.value}`,
    () => getFilterSubject(subjectId.value),
    {
      transform: (data) => {
        return { data, fetchedAt: new Date() }
      },
      immediate: false,
      watch: [subjectId]
    }
  )

  const { getCatalog } = useCatalogApi()

  const {
    data: categoriesData,
    status: categoriesStatus,
    execute: categoriesExecute
  } = useAsyncData(
    `client-catalog-categories-${subjectId.value}`,
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

  watchEffect(() => {
    if (toValue(subject)) {
      filterExecute()
    }
  })

  watchEffect(() => {
    if (filterData.value) {
      categoriesExecute()
      setupBrandsFilter()
    }
  })

  const loading = computed(() => {
    return filterStatus.value === 'pending' || categoriesStatus.value === 'pending'
  })

  const saveFilterSubjectStatus = ref<AsyncDataRequestStatus>('idle')

  async function saveFilterSubject() {
    if (!toValue(subject)) {
      return
    }

    try {
      saveFilterSubjectStatus.value = 'pending'

      await saveFilterSubjectApi({
        subjectId: toValue(subject).id,
        title: toValue(subject).name,
        descr: '',
        startData: '',
        finishData: '',
        categories: getCheckedCategories(categoriesData.value?.data || [])
      })

      saveFilterSubjectStatus.value = 'success'

      // refetch
      filterExecute()
    } catch (error) {
      console.error(error)
      saveFilterSubjectStatus.value = 'error'
    }
  }

  function getCheckedCategories(categories: CategoryItem[]) {
    if (!categories.length) {
      return []
    }

    const result: {
      id: number
      title: string
      brends: BrandItem[]
    }[] = []

    categories.forEach((parent) => {
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
    brandsFilter,
    loading,
    categoriesData,
    filterData,
    saveFilterSubject,
    saveFilterSubjectStatus,
    updateBrandsFilter
  }
}
