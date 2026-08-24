import { useSessionStorage } from '@vueuse/core'
import type { CatalogItem, CatalogNode } from './catalog-types'
import { buildCatalogNodes } from '../libs/build-catalog-nodes'

const SELECTION_STORAGE_KEY = 'catalog-tree-selection'

interface CatalogTreeSelection {
  tnId: number | null
  tkId: number | null
  nodeKey: string | null
}

const emptySelection: CatalogTreeSelection = { tnId: null, tkId: null, nodeKey: null }

/**
 * Состояние выбранной ветки структуры каталога:
 * товарное направление -> категория -> вид или подфильтровая страница.
 *
 * Живёт в сторе, чтобы после перехода на отдельную страницу редактирования
 * (направления, категории, вида) и возврата к структуре выбор сохранялся.
 * Дополнительно пишем выбор в sessionStorage — ветка переживает перезагрузку вкладки.
 */
export const useCatalogTreeStore = defineStore('catalog-tree', () => {
  const items = shallowRef<CatalogItem[]>([])

  const selection = useSessionStorage<CatalogTreeSelection>(SELECTION_STORAGE_KEY, {
    ...emptySelection
  })

  const selectedTnId = computed(() => selection.value.tnId)
  const selectedTkId = computed(() => selection.value.tkId)
  const selectedNodeKey = computed(() => selection.value.nodeKey)

  const selectedTn = computed(
    () => items.value.find((item) => item.id === selection.value.tnId) ?? null
  )

  const categories = computed(() => selectedTn.value?.child ?? [])

  const selectedTk = computed(
    () => categories.value.find((child) => child.id === selection.value.tkId) ?? null
  )

  const nodes = computed<CatalogNode[]>(() => buildCatalogNodes(selectedTk.value))

  const selectedNode = computed(
    () => nodes.value.find((node) => node.key === selection.value.nodeKey) ?? null
  )

  /**
   * Данные каталога приезжают с сервера и могут обновиться (например, после
   * сохранения подфильтровой страницы), поэтому после каждой загрузки
   * проверяем, что сохранённая ветка всё ещё существует.
   */
  function setItems(nextItems: CatalogItem[]) {
    items.value = nextItems
    revalidateSelection()
  }

  function revalidateSelection() {
    // Первое направление выбираем сразу, чтобы страница не открывалась пустой
    if (!items.value.some((item) => item.id === selection.value.tnId)) {
      selection.value.tnId = items.value[0]?.id ?? null
    }

    // Вложенный уровень сбрасываем, если он больше не принадлежит выбранному родителю
    if (!categories.value.some((child) => child.id === selection.value.tkId)) {
      selection.value.tkId = null
    }

    if (!nodes.value.some((node) => node.key === selection.value.nodeKey)) {
      selection.value.nodeKey = null
    }
  }

  function selectTn(id: number) {
    if (selection.value.tnId === id) {
      return
    }

    selection.value.tnId = id
    selection.value.tkId = null
    selection.value.nodeKey = null
  }

  function selectTk(id: number) {
    if (selection.value.tkId === id) {
      return
    }

    selection.value.tkId = id
    selection.value.nodeKey = null
  }

  function selectNode(key: string) {
    selection.value.nodeKey = key
  }

  function clearNodeSelection() {
    selection.value.nodeKey = null
  }

  function resetSelection() {
    selection.value = { ...emptySelection }
  }

  function $reset() {
    items.value = []
    resetSelection()
  }

  return {
    items,
    selectedTnId,
    selectedTkId,
    selectedNodeKey,
    selectedTn,
    categories,
    selectedTk,
    nodes,
    selectedNode,
    setItems,
    selectTn,
    selectTk,
    selectNode,
    clearNodeSelection,
    resetSelection,
    $reset
  }
})
