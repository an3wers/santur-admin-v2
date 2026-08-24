import { describe, expect, it } from 'vitest'
import { buildPresetCombinations } from './build-preset-combinations'
import type { CharFilter, PresetItem } from '../api/catalog-schemas'

function makeCharFilter(name: string, items: string[], nn = 0): CharFilter {
  return {
    nn,
    name,
    typeValue: 'string',
    isNumeric: false,
    minLimit: '',
    maxLimit: '',
    minSelect: '',
    maxSelect: '',
    selected: '',
    isSelected: false,
    items: items.map((item, index) => ({ nn: index, name: item, qtyRecords: 10 }))
  }
}

function makePreset(id: number, title: string, groups: Record<string, string>): PresetItem {
  return {
    id,
    catalogItemId: 1,
    title,
    descr: '',
    shortDescr: '',
    alias: '',
    location: 'top',
    image: null,
    variantVisible: '',
    presets: Object.entries(groups).map(([name, selected]) => ({
      name,
      selected,
      minLimit: '',
      maxLimit: '',
      minSelect: '',
      maxSelect: ''
    }))
  }
}

// Порядок групп — как их выстраивает orderCharFilters: наименование, характеристики, бренд
const charFilters = [
  makeCharFilter('Наименование', ['Смеситель', 'Душ'], 1),
  makeCharFilter('Диаметр', ['15', '20', '25'], 2),
  makeCharFilter('Бренд', ['Grohe', 'Hansgrohe'], 3)
]

const baseParams = {
  charFilters,
  categoryName: 'Смесители',
  includeCategoryInTitle: true,
  existingPresets: [] as PresetItem[]
}

describe('buildPresetCombinations', () => {
  it('возвращает пустой список, пока ось не выбрана', () => {
    const rows = buildPresetCombinations({
      ...baseParams,
      selections: { Наименование: ['Смеситель'], Диаметр: ['15', '20'], Бренд: [] },
      axisName: null
    })

    expect(rows).toEqual([])
  })

  it('создаёт по строке на каждое значение оси, общие фильтры повторяются', () => {
    const rows = buildPresetCombinations({
      ...baseParams,
      selections: { Наименование: ['Смеситель'], Диаметр: ['15', '20', '25'], Бренд: ['Grohe'] },
      axisName: 'Диаметр'
    })

    expect(rows).toHaveLength(3)
    expect(rows.map((row) => row.axisValue)).toEqual(['15', '20', '25'])
    expect(rows.map((row) => row.title)).toEqual([
      'Смесители Смеситель 15 Grohe',
      'Смесители Смеситель 20 Grohe',
      'Смесители Смеситель 25 Grohe'
    ])
    expect(rows[0]?.alias).toBe('smesiteli-smesitel-15-grohe')
    expect(rows[0]?.groups).toEqual({
      Наименование: ['Смеситель'],
      Бренд: ['Grohe'],
      Диаметр: ['15']
    })
    expect(rows[0]?.filtersLabel).toBe('Наименование: Смеситель; Диаметр: 15; Бренд: Grohe')
  })

  it('упорядочивает значения оси по справочнику фильтра, а не по порядку отметок', () => {
    const rows = buildPresetCombinations({
      ...baseParams,
      selections: { Наименование: [], Диаметр: ['25', '15'], Бренд: [] },
      axisName: 'Диаметр'
    })

    expect(rows.map((row) => row.axisValue)).toEqual(['15', '25'])
  })

  it('не добавляет категорию в заголовок при выключенном переключателе, но оставляет её в alias', () => {
    const rows = buildPresetCombinations({
      ...baseParams,
      includeCategoryInTitle: false,
      selections: { Наименование: ['Смеситель'], Диаметр: ['15', '20'], Бренд: [] },
      axisName: 'Диаметр'
    })

    expect(rows[0]?.title).toBe('Смеситель 15')
    expect(rows[0]?.alias).toBe('smesiteli-smesitel-15')
  })

  it('помечает комбинацию, совпадающую с существующей подфильтровой страницей', () => {
    const existing = makePreset(412, 'Смесители Смеситель 20 Grohe', {
      Наименование: 'Смеситель',
      Диаметр: '20',
      Бренд: 'Grohe'
    })

    const rows = buildPresetCombinations({
      ...baseParams,
      existingPresets: [existing],
      selections: { Наименование: ['Смеситель'], Диаметр: ['15', '20'], Бренд: ['Grohe'] },
      axisName: 'Диаметр'
    })

    expect(rows[0]?.duplicateOf).toBeNull()
    expect(rows[1]?.duplicateOf?.id).toBe(412)
  })

  it('помечает вторую строку с таким же alias', () => {
    const filters = [makeCharFilter('Резьба', ['1/2', '1.2'], 1)]

    const rows = buildPresetCombinations({
      ...baseParams,
      charFilters: filters,
      selections: { Резьба: ['1/2', '1.2'] },
      axisName: 'Резьба'
    })

    expect(rows[0]?.alias).toBe(rows[1]?.alias)
    expect(rows[0]?.aliasCollision).toBe(false)
    expect(rows[1]?.aliasCollision).toBe(true)
  })

  it('использует каноничный набор фильтров как ключ строки', () => {
    const rows = buildPresetCombinations({
      ...baseParams,
      selections: { Наименование: ['Смеситель'], Диаметр: ['15', '20'], Бренд: [] },
      axisName: 'Диаметр'
    })

    expect(rows[0]?.key).toBe('Диаметр=15;Наименование=Смеситель')
    expect(new Set(rows.map((row) => row.key)).size).toBe(rows.length)
  })
})
