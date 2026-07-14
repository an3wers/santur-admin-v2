// Единый диапазон дат для вкладок лог-монитора («Обзор» и «Журнал»).
// Состояние на уровне модуля — общий singleton: правка контрола на одной
// вкладке сразу отражается на другой.

const DAY_MS = 24 * 60 * 60 * 1000

function defaultRange(): [number, number] {
  const now = Date.now()
  return [now - DAY_MS, now]
}

const range = ref<[number, number]>(defaultRange())

export function useLogRange() {
  // Сброс к диапазону по умолчанию (последние 24 ч).
  function resetRange() {
    range.value = defaultRange()
  }

  return { range, resetRange }
}
