import { generateAlias } from '~/shared/libs/generate-alias'
import { useCatalogApi } from '../api/catalog-api'
import type { CharFilter, PresetItem, SavePresetFilterItem } from '../api/catalog-schemas'

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
  const removeStatus = ref<ProcessStatus>('idle')
  const removeImageStatus = ref<ProcessStatus>('idle')

  // Изображение: imageUrl — уже сохранённое на сервере, imageFile — выбранный
  // файл, который уйдёт вместе с формой при сохранении.
  const imageUrl = ref('')
  const imageFile = ref<File | null>(null)
  const imgExist = computed(() => Boolean(imageUrl.value))

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

  // Заголовок и alias: по умолчанию генерируются автоматически, но пользователь
  // может отредактировать их вручную. После ручного правки автогенерация для
  // этого поля больше не применяется.
  const title = ref('')
  const alias = ref('')
  const isTitleManuallyEdited = ref(false)
  const isAliasManuallyEdited = ref(false)

  function buildTitle() {
    const checked = charFilters.value.flatMap((cf) => selections.value[cf.name] ?? [])
    const prefix = includeCategoryInTitle.value ? categoryName.value : ''
    return [prefix, ...checked].filter(Boolean).join(' ')
  }

  function buildAlias() {
    const checked = charFilters.value.flatMap((cf) => selections.value[cf.name] ?? [])
    return generateAlias([categoryName.value, ...checked].filter(Boolean).join(' '))
  }

  // Пока пользователь не редактировал поле вручную — держим его в актуальном
  // сгенерированном состоянии при изменении фильтров/переключателя категории.
  watch(
    [selections, charFilters, includeCategoryInTitle, categoryName],
    () => {
      if (!isTitleManuallyEdited.value) {
        title.value = buildTitle()
      }
      if (!isAliasManuallyEdited.value) {
        alias.value = buildAlias()
      }
    },
    {
      deep: true,
      immediate: true
    }
  )

  function onTitleInput(value: string) {
    isTitleManuallyEdited.value = true
    title.value = value
  }

  function formatAliasInput(value: string) {
    const slug = generateAlias(value)
    // generateAlias обрезает завершающий пробел, из-за чего при вводе нельзя
    // поставить разделитель между словами. Сохраняем его как дефис, чтобы
    // пользователь мог продолжать ввод.
    if (/\s$/.test(value) && slug && !slug.endsWith('-')) {
      return `${slug}-`
    }
    return slug
  }

  function onAliasInput(value: string) {
    isAliasManuallyEdited.value = true
    alias.value = formatAliasInput(value)
  }

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

  // Режим редактирования существующей подфильтровой страницы (её можно удалить)
  const isEditing = computed(() => editingId.value != null)

  function reset() {
    charFilters.value = []
    existingPresets.value = []
    selections.value = {}
    shortDescr.value = ''
    descr.value = ''
    catalogItemId.value = 0
    categoryName.value = ''
    editingId.value = null
    location.value = 'top'
    title.value = ''
    alias.value = ''
    isTitleManuallyEdited.value = false
    isAliasManuallyEdited.value = false
    imageUrl.value = ''
    imageFile.value = null
    loadStatus.value = 'idle'
    saveStatus.value = 'idle'
    removeStatus.value = 'idle'
    removeImageStatus.value = 'idle'
  }

  async function open(params: OpenPresetFormParams) {
    reset()
    catalogItemId.value = params.catalogItemId
    categoryName.value = params.categoryName
    editingId.value = params.presetId ?? null

    try {
      loadStatus.value = 'pending'
      const data = await api.getPresetFiltersByCatalogItem(params.catalogItemId)

      const [brands, names, ...others] = data.charFilters

      let filters: CharFilter[] = []

      if (names) {
        filters = filters.concat(names)
      }

      if (others && others.length) {
        filters = filters.concat(others)
      }

      if (brands) {
        filters = filters.concat(brands)
      }

      charFilters.value = filters

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
          location.value = preset.location ?? 'top'
          imageUrl.value = preset.image?.path ?? ''
          preset.presets.forEach((pf) => {
            nextSelections[pf.name] = pf.selected.split(';').filter(Boolean)
          })
          // Сохранённые заголовок и alias считаем результатом ручного
          // редактирования, чтобы не перезатирать их автогенерацией.
          title.value = preset.title
          alias.value = preset.alias
          isTitleManuallyEdited.value = true
          isAliasManuallyEdited.value = true
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

      const payload: SavePresetFilterItem = {
        id: editingId.value ?? undefined,
        catalogItemId: catalogItemId.value,
        title: title.value,
        alias: alias.value,
        location: location.value,
        descr: descr.value,
        shortDescr: shortDescr.value,
        image: imageFile.value ?? undefined,
        presets: charFilters.value
          .filter((cf) => selections.value[cf.name]?.length)
          .map((cf) => ({
            name: cf.name,
            selected:
              selections.value && selections.value[cf.name]
                ? selections.value[cf.name]!.join(';')
                : '',
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

  // Удаление уже сохранённого изображения. Для ещё не сохранённой страницы
  // изображения на сервере нет — достаточно сбросить выбранный файл.
  async function removeImage() {
    if (editingId.value == null || removeImageStatus.value === 'pending') {
      return
    }

    try {
      removeImageStatus.value = 'pending'
      await api.removeImagePresetItem({ id: editingId.value })
      imageUrl.value = ''
      imageFile.value = null
      removeImageStatus.value = 'success'
    } catch (error) {
      console.error(error)
      removeImageStatus.value = 'error'
    }
  }

  async function remove() {
    if (editingId.value == null || removeStatus.value === 'pending') {
      return
    }

    try {
      removeStatus.value = 'pending'
      await api.deletePresetFilter(editingId.value)
      removeStatus.value = 'success'
    } catch (error) {
      console.error(error)
      removeStatus.value = 'error'
    }
  }

  return {
    charFilters,
    selections,
    shortDescr,
    descr,
    editingId,
    isEditing,
    loadStatus,
    saveStatus,
    removeStatus,
    removeImageStatus,
    imageUrl,
    imageFile,
    imgExist,
    removeImage,
    title,
    alias,
    onTitleInput,
    onAliasInput,
    location,
    locations,
    includeCategoryInTitle,
    isDuplicate,
    duplicatePreset,
    open,
    save,
    remove,
    reset,
    isTitleManuallyEdited,
    isAliasManuallyEdited
  }
}
