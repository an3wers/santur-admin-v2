import { generateAlias } from '~/shared/libs/generate-alias'
import { useCatalogApi } from '../api/catalog-api'
import type { CharFilter, PresetItem, SaveNewPresetFilterItem } from '../api/catalog-schemas'

interface OpenPresetFormParams {
  catalogItemId: number
  categoryName: string
  presetId?: number | null
}

export const usePresetFilterForm = () => {
  const api = useCatalogApi()

  const charFilters = ref<CharFilter[]>([])
  const existingPresets = ref<PresetItem[]>([])
  const selections = ref<Record<string, string[]>>({})
  const shortDescr = ref('')
  const descr = ref('')

  const catalogItemId = ref(0)
  const categoryName = ref('')
  const editingId = ref<number | null>(null)

  const loadStatus = ref<ProcessStatus>('idle')
  const saveStatus = ref<ProcessStatus>('idle')

  const includeCategoryInTitle = ref(true)

  const generatedTitle = computed(() => {
    const checked = charFilters.value.flatMap((cf) => selections.value[cf.name] ?? [])
    const prefix = includeCategoryInTitle.value ? categoryName.value : ''
    return [prefix, ...checked].filter(Boolean).join(' ')
  })

  const generatedAlias = computed(() => {
    const checked = charFilters.value.flatMap((cf) => selections.value[cf.name] ?? [])
    return generateAlias([categoryName.value, ...checked].filter(Boolean).join(' '))
  })

  // Каноничное представление набора отмеченных фильтров (для сравнения на дубликат)
  function canonicalize(groups: Record<string, string[]>): string {
    return Object.entries(groups)
      .map(([name, values]) => [name, [...values].sort()] as const)
      .filter(([, values]) => values.length > 0)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, values]) => `${name}=${values.join(',')}`)
      .join(';')
  }

  function presetToGroups(preset: PresetItem): Record<string, string[]> {
    const groups: Record<string, string[]> = {}
    preset.presets.forEach((pf) => {
      groups[pf.name] = pf.selected.split(';').filter(Boolean)
    })
    return groups
  }

  // Подфильтровая страница в этой категории с тем же набором фильтров (исключая редактируемую)
  const duplicatePreset = computed(() => {
    const current = canonicalize(selections.value)
    if (!current) {
      return null
    }
    return (
      existingPresets.value.find(
        (p) => p.id !== editingId.value && canonicalize(presetToGroups(p)) === current
      ) ?? null
    )
  })

  const isDuplicate = computed(() => duplicatePreset.value != null)

  function reset() {
    charFilters.value = []
    existingPresets.value = []
    selections.value = {}
    shortDescr.value = ''
    descr.value = ''
    catalogItemId.value = 0
    categoryName.value = ''
    editingId.value = null
    loadStatus.value = 'idle'
    saveStatus.value = 'idle'
  }

  async function open(params: OpenPresetFormParams) {
    reset()
    catalogItemId.value = params.catalogItemId
    categoryName.value = params.categoryName
    editingId.value = params.presetId ?? null

    try {
      loadStatus.value = 'pending'
      const data = await api.getPresetFiltersByCatalogItem(params.catalogItemId)

      charFilters.value = data.charFilters
      existingPresets.value = data.presets
      const nextSelections: Record<string, string[]> = {}
      data.charFilters.forEach((cf) => {
        nextSelections[cf.name] = []
      })

      if (params.presetId != null) {
        const preset = data.presets.find((p) => p.id === params.presetId)
        if (preset) {
          shortDescr.value = preset.shortDescr
          descr.value = preset.descr
          preset.presets.forEach((pf) => {
            nextSelections[pf.name] = pf.selected.split(';').filter(Boolean)
          })
        }
      }

      selections.value = nextSelections

      loadStatus.value = 'success'
    } catch (error) {
      console.error(error)
      loadStatus.value = 'error'
    }
  }

  async function save() {
    try {
      saveStatus.value = 'pending'

      const payload: SaveNewPresetFilterItem = {
        id: editingId.value ?? undefined,
        catalogItemId: catalogItemId.value,
        title: generatedTitle.value,
        alias: generatedAlias.value,
        descr: descr.value,
        shortDescr: shortDescr.value,
        presets: charFilters.value
          .filter((cf) => selections.value[cf.name]?.length)
          .map((cf) => ({
            name: cf.name,
            selected: selections.value[cf.name].join(';'),
            minSelect: '',
            maxSelect: ''
          }))
      }

      await api.savePresetFilterForCatalogItem(payload)
      saveStatus.value = 'success'
    } catch (error) {
      console.error(error)
      saveStatus.value = 'error'
    }
  }

  return {
    charFilters,
    selections,
    shortDescr,
    descr,
    editingId,
    loadStatus,
    saveStatus,
    generatedTitle,
    generatedAlias,
    includeCategoryInTitle,
    isDuplicate,
    duplicatePreset,
    open,
    save,
    reset
  }
}
