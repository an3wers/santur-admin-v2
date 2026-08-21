import { useCatalogApi } from '../api/catalog-api'
import type { CharFilter, PresetItem } from '../api/catalog-schemas'
import { buildPresetCombinations, type BulkPresetRow } from '../libs/build-preset-combinations'
import { buildPresetsPayload, orderCharFilters } from '../libs/preset-filter-utils'

interface OpenBulkFormParams {
  catalogItemId: number
  categoryName: string
}

export interface BulkRowResult {
  status: 'success' | 'error'
  message?: string
}

export const usePresetFilterBulkForm = () => {
  const api = useCatalogApi()

  const charFilters = ref<CharFilter[]>([])
  const existingPresets = ref<PresetItem[]>([])
  const selections = ref<Record<string, string[]>>({})

  const catalogItemId = ref(0)
  const categoryName = ref('')

  // Группа фильтра, по значениям которой разворачивается серия страниц.
  // Ось всегда одна: включение оси у другой группы гасит предыдущую.
  const axisName = ref<string | null>(null)
  const axisTouched = ref(false)

  const includeCategoryInTitle = ref(true)
  const location = ref<'top' | 'bottom' | 'top-bottom' | 'hidden'>('top')

  const locations = [
    {
      label: 'Над товарами',
      value: 'top'
    },
    {
      label: 'Под товарами',
      value: 'bottom'
    },
    {
      label: 'Над и под товарами',
      value: 'top-bottom'
    },
    {
      label: 'Не показывать',
      value: 'hidden'
    }
  ]

  const loadStatus = ref<ProcessStatus>('idle')
  const saveStatus = ref<ProcessStatus>('idle')

  const progress = ref({ done: 0, total: 0 })
  const results = ref<Record<string, BulkRowResult>>({})

  const rows = computed(() =>
    buildPresetCombinations({
      charFilters: charFilters.value,
      selections: selections.value,
      axisName: axisName.value,
      categoryName: categoryName.value,
      includeCategoryInTitle: includeCategoryInTitle.value,
      existingPresets: existingPresets.value
    })
  )

  // Осью может стать только группа, в которой отмечено минимум два значения —
  // иначе разворачивать нечего.
  const axisCandidates = computed(() =>
    charFilters.value
      .filter((cf) => (selections.value[cf.name]?.length ?? 0) > 1)
      .map((cf) => cf.name)
  )

  watch(
    axisCandidates,
    (candidates) => {
      if (axisName.value && !candidates.includes(axisName.value)) {
        axisName.value = null
      }
      // Пока пользователь сам не трогал переключатель — подставляем первую
      // подходящую группу, чтобы превью появлялось сразу.
      if (!axisTouched.value && !axisName.value && candidates.length) {
        axisName.value = candidates[0] ?? null
      }
    },
    { immediate: true }
  )

  function setAxis(name: string, value: boolean) {
    axisTouched.value = true
    axisName.value = value ? name : null
  }

  /*
    ВЫБОР СТРОК ПРЕВЬЮ
    По умолчанию исключаем дубли и строки с уже занятым в этой пачке alias.
    Ручные правки храним отдельно по ключу строки, чтобы они переживали
    перестроение превью при изменении фильтров.
  */
  const rowSelectionOverrides = ref<Record<string, boolean>>({})
  const checkedRowKeys = ref<string[]>([])

  function isRowCheckedByDefault(row: BulkPresetRow) {
    return !row.duplicateOf && !row.aliasCollision
  }

  function syncCheckedRowKeys() {
    checkedRowKeys.value = rows.value
      .filter((row) => rowSelectionOverrides.value[row.key] ?? isRowCheckedByDefault(row))
      .map((row) => row.key)
  }

  watch(rows, syncCheckedRowKeys, { immediate: true })

  function setCheckedRowKeys(keys: Array<string | number>) {
    const next = new Set(keys.map(String))
    rows.value.forEach((row) => {
      rowSelectionOverrides.value[row.key] = next.has(row.key)
    })
    syncCheckedRowKeys()
  }

  const selectedRows = computed(() => {
    const checked = new Set(checkedRowKeys.value)
    return rows.value.filter((row) => checked.has(row.key))
  })

  const selectedCount = computed(() => selectedRows.value.length)

  const successCount = computed(
    () => Object.values(results.value).filter((result) => result.status === 'success').length
  )

  const failedKeys = computed(() =>
    Object.entries(results.value)
      .filter(([, result]) => result.status === 'error')
      .map(([key]) => key)
  )

  function reset() {
    charFilters.value = []
    existingPresets.value = []
    selections.value = {}
    catalogItemId.value = 0
    categoryName.value = ''
    axisName.value = null
    axisTouched.value = false
    includeCategoryInTitle.value = true
    location.value = 'top'
    rowSelectionOverrides.value = {}
    checkedRowKeys.value = []
    results.value = {}
    progress.value = { done: 0, total: 0 }
    loadStatus.value = 'idle'
    saveStatus.value = 'idle'
  }

  async function open(params: OpenBulkFormParams) {
    reset()
    catalogItemId.value = params.catalogItemId
    categoryName.value = params.categoryName

    try {
      loadStatus.value = 'pending'
      const data = await api.getPresetFiltersByCatalogItem(params.catalogItemId)

      charFilters.value = orderCharFilters(data.charFilters)
      existingPresets.value = data.presets

      const nextSelections: Record<string, string[]> = {}
      data.charFilters.forEach((cf) => {
        nextSelections[cf.name] = []
      })
      selections.value = nextSelections

      loadStatus.value = 'success'
    } catch (error) {
      console.error(error)
      loadStatus.value = 'error'
    }
  }

  // Bulk-эндпоинта нет — сохраняем страницы по одной, последовательно, чтобы не
  // забивать бэк параллельными запросами и получить читаемый отчёт по строкам.
  // Ошибка одной страницы не останавливает остальные.
  async function saveRows(targetRows: BulkPresetRow[]) {
    if (!targetRows.length || saveStatus.value === 'pending') {
      return
    }

    saveStatus.value = 'pending'
    progress.value = { done: 0, total: targetRows.length }

    let hasError = false

    for (const row of targetRows) {
      try {
        await api.savePresetFilterForCatalogItem({
          catalogItemId: catalogItemId.value,
          title: row.title,
          alias: row.alias,
          location: location.value,
          descr: '',
          shortDescr: '',
          presets: buildPresetsPayload(charFilters.value, row.groups)
        })
        results.value[row.key] = { status: 'success' }
      } catch (error) {
        console.error(error)
        hasError = true
        results.value[row.key] = {
          status: 'error',
          message: error instanceof Error ? error.message : 'Произошла ошибка'
        }
      }

      progress.value = { ...progress.value, done: progress.value.done + 1 }
    }

    saveStatus.value = hasError ? 'error' : 'success'
  }

  // Уже созданные строки повторно не отправляем — иначе после частичной неудачи
  // повторное нажатие «Создать» наплодит дубли.
  function save() {
    return saveRows(
      selectedRows.value.filter((row) => results.value[row.key]?.status !== 'success')
    )
  }

  function retryFailed() {
    const keys = new Set(failedKeys.value)
    const targetRows = rows.value.filter((row) => keys.has(row.key))

    results.value = Object.fromEntries(
      Object.entries(results.value).filter(([key]) => !keys.has(key))
    )

    return saveRows(targetRows)
  }

  return {
    charFilters,
    selections,
    axisName,
    axisCandidates,
    setAxis,
    includeCategoryInTitle,
    location,
    locations,
    rows,
    checkedRowKeys,
    setCheckedRowKeys,
    selectedRows,
    selectedCount,
    results,
    progress,
    successCount,
    failedKeys,
    loadStatus,
    saveStatus,
    open,
    save,
    retryFailed,
    reset
  }
}
