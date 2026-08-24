import { describe, expect, it } from 'vitest'
import type { PresetItem } from '../api/catalog-schemas'
import type { CatalogItem, CatalogVidsItem } from '../model/catalog-types'
import { filterCatalogItems, normalizeSearchValue } from './filter-catalog-items'

function makeVid(overrides: Partial<CatalogVidsItem> = {}): CatalogVidsItem {
  return {
    id: 1,
    parent_id: 10,
    parent_name: 'Категория',
    vid: 'vid',
    name: 'Вид',
    num: 0,
    seotitle: '',
    keywords: '',
    alias: 'vid-alias',
    descr: '',
    shortDescr: '',
    imgExist: false,
    image: null,
    gimg: '',
    vids: [],
    isNl: null,
    isAcc: null,
    isMC: null,
    isForOwner: null,
    ...overrides
  }
}

function makePreset(overrides: Partial<PresetItem> = {}): PresetItem {
  return {
    id: 1,
    catalogItemId: 10,
    title: 'Подфильтровая страница',
    descr: '',
    shortDescr: '',
    presets: [],
    alias: 'preset-alias',
    location: 'top',
    image: null,
    variantVisible: '',
    ...overrides
  }
}

function makeCategory(
  overrides: Partial<Omit<CatalogItem, 'child'>> = {}
): Omit<CatalogItem, 'child'> {
  return {
    id: 10,
    parent_id: 1,
    parent_name: 'Направление',
    vid: 'tk',
    name: 'Категория',
    num: 0,
    seotitle: '',
    keywords: '',
    alias: 'category',
    descr: '',
    shortDescr: '',
    imgExist: false,
    image: null,
    gimg: null,
    vids: [],
    ...overrides
  }
}

function makeItem(overrides: Partial<CatalogItem> = {}): CatalogItem {
  return {
    ...makeCategory({ id: 1, parent_id: 0, name: 'Направление', alias: 'napravlenie' }),
    child: [],
    ...overrides
  }
}

describe('filterCatalogItems', () => {
  it('возвращает исходный список, если запрос пустой', () => {
    const items = [makeItem()]

    expect(filterCatalogItems(items, '   ')).toBe(items)
  })

  it('находит направление по подстроке названия без учёта регистра', () => {
    const items = [makeItem({ id: 1, name: 'Сантехника' }), makeItem({ id: 2, name: 'Электрика' })]

    expect(filterCatalogItems(items, 'ТЕХ').map((item) => item.id)).toEqual([1])
  })

  it('оставляет все категории направления, если совпало само направление', () => {
    const items = [
      makeItem({
        name: 'Сантехника',
        child: [
          makeCategory({ id: 10, name: 'Смесители' }),
          makeCategory({ id: 11, name: 'Ванны' })
        ]
      })
    ]

    expect(filterCatalogItems(items, 'сантехника')[0]?.child.map((child) => child.id)).toEqual([
      10, 11
    ])
  })

  it('оставляет только совпавшие категории', () => {
    const items = [
      makeItem({
        name: 'Сантехника',
        child: [
          makeCategory({ id: 10, name: 'Смесители' }),
          makeCategory({ id: 11, name: 'Ванны' })
        ]
      })
    ]

    const [item] = filterCatalogItems(items, 'ванн')

    expect(item?.child.map((child) => child.id)).toEqual([11])
  })

  it('находит виды и подфильтровые страницы, оставляя внутри категории только совпавшие', () => {
    const items = [
      makeItem({
        child: [
          makeCategory({
            id: 10,
            name: 'Смесители',
            categoryVids: [
              makeVid({ id: 100, name: 'Для кухни' }),
              makeVid({ id: 101, name: 'Для ванной' })
            ],
            presets: [
              makePreset({ id: 200, title: 'Хромированные' }),
              makePreset({ id: 201, title: 'Для кухни, чёрные' })
            ]
          })
        ]
      })
    ]

    const [category] = filterCatalogItems(items, 'для кухни')[0]?.child ?? []

    expect(category?.categoryVids?.map((vid) => vid.id)).toEqual([100])
    expect(category?.presets?.map((preset) => preset.id)).toEqual([201])
  })

  it('оставляет все виды и фильтры категории, если совпала сама категория', () => {
    const category = makeCategory({
      id: 10,
      name: 'Смесители',
      categoryVids: [makeVid({ id: 100, name: 'Для кухни' })],
      presets: [makePreset({ id: 200, title: 'Хромированные' })]
    })

    const [item] = filterCatalogItems([makeItem({ child: [category] })], 'смесит')

    expect(item?.child[0]).toBe(category)
  })

  it('исключает направление, в котором ничего не совпало', () => {
    const items = [
      makeItem({
        name: 'Сантехника',
        child: [makeCategory({ id: 10, name: 'Смесители', categoryVids: [makeVid({ id: 100 })] })]
      })
    ]

    expect(filterCatalogItems(items, 'светильник')).toEqual([])
  })

  it('ищет по алиасу и id', () => {
    const items = [
      makeItem({
        child: [
          makeCategory({ id: 10, name: 'Смесители', alias: 'smesiteli' }),
          makeCategory({ id: 4212, name: 'Ванны', alias: 'vanny' })
        ]
      })
    ]

    expect(filterCatalogItems(items, 'smesit')[0]?.child.map((child) => child.id)).toEqual([10])
    expect(filterCatalogItems(items, '4212')[0]?.child.map((child) => child.id)).toEqual([4212])
  })

  it('не различает ё и е', () => {
    const items = [makeItem({ child: [makeCategory({ id: 10, name: 'Чёрные смесители' })] })]

    expect(filterCatalogItems(items, 'черные')[0]?.child.map((child) => child.id)).toEqual([10])
  })
})

describe('normalizeSearchValue', () => {
  it('убирает пробелы по краям, регистр и ё', () => {
    expect(normalizeSearchValue('  Ёлка ')).toBe('елка')
  })
})
