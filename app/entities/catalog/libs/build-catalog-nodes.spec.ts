import { describe, expect, it } from 'vitest'
import type { PresetItem } from '../api/catalog-schemas'
import type { CatalogItem, CatalogVidsItem } from '../model/catalog-types'
import { buildCatalogNodes } from './build-catalog-nodes'

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
    vid: '',
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

describe('buildCatalogNodes', () => {
  it('отдаёт пустой список, если категория не выбрана', () => {
    expect(buildCatalogNodes(null)).toEqual([])
  })

  it('ставит виды перед подфильтровыми страницами', () => {
    const nodes = buildCatalogNodes(
      makeCategory({
        categoryVids: [makeVid({ id: 1, name: 'Вид 1' })],
        presets: [makePreset({ id: 2, title: 'Фильтр 1' })]
      })
    )

    expect(nodes.map((node) => [node.kind, node.name])).toEqual([
      ['vid', 'Вид 1'],
      ['preset', 'Фильтр 1']
    ])
  })

  it('разводит одинаковые id вида и подфильтровой страницы разными ключами', () => {
    const nodes = buildCatalogNodes(
      makeCategory({ categoryVids: [makeVid({ id: 5 })], presets: [makePreset({ id: 5 })] })
    )

    expect(nodes.map((node) => node.key)).toEqual(['vid-5', 'preset-5'])
  })

  it('переносит фильтры подфильтровой страницы в узел', () => {
    const filters = [
      { name: 'Тип', minLimit: '', maxLimit: '', minSelect: '', maxSelect: '', selected: 'белый' }
    ]
    const [node] = buildCatalogNodes(makeCategory({ presets: [makePreset({ presets: filters })] }))

    expect(node?.kind === 'preset' && node.filters).toEqual(filters)
  })
})
