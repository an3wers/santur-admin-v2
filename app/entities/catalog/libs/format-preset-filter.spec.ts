import { describe, expect, it } from 'vitest'
import type { PresetFilter } from '../api/catalog-schemas'
import { EMPTY_FILTER_VALUE, formatPresetFilterValue } from './format-preset-filter'

function makeFilter(overrides: Partial<PresetFilter> = {}): PresetFilter {
  return {
    name: 'Тип монтажа',
    minLimit: '',
    maxLimit: '',
    minSelect: '',
    maxSelect: '',
    selected: '',
    ...overrides
  }
}

describe('formatPresetFilterValue', () => {
  it('склеивает отмеченные значения через запятую', () => {
    expect(formatPresetFilterValue(makeFilter({ selected: 'настенный;кассетный' }))).toBe(
      'настенный, кассетный'
    )
  })

  it('отбрасывает пустые значения и пробелы', () => {
    expect(formatPresetFilterValue(makeFilter({ selected: ' настенный ;; ' }))).toBe('настенный')
  })

  it('показывает диапазон для числового фильтра', () => {
    expect(formatPresetFilterValue(makeFilter({ minSelect: '1.5', maxSelect: '5' }))).toBe(
      '1.5 – 5'
    )
  })

  it('показывает открытые границы диапазона', () => {
    expect(formatPresetFilterValue(makeFilter({ minSelect: '5' }))).toBe('от 5')
    expect(formatPresetFilterValue(makeFilter({ maxSelect: '5' }))).toBe('до 5')
  })

  it('отдаёт заглушку, когда значение не задано', () => {
    expect(formatPresetFilterValue(makeFilter())).toBe(EMPTY_FILTER_VALUE)
  })

  it('предпочитает отмеченные значения диапазону', () => {
    expect(
      formatPresetFilterValue(makeFilter({ selected: 'настенный', minSelect: '1', maxSelect: '2' }))
    ).toBe('настенный')
  })
})
