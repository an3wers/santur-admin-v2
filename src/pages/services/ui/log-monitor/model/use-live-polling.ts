// Polling для Live tail (ТЗ 9.3: polling, не WebSocket).
// Обёртка над useIntervalFn (@vueuse/core, авто-импорт): пауза/возобновление
// и остановка, когда вкладка скрыта (visibilitychange).
export function useLivePolling(callback: () => void, intervalMs = 5000) {
  const enabled = ref(true)
  const { pause, resume } = useIntervalFn(callback, intervalMs, { immediate: false })

  function isVisible() {
    return typeof document === 'undefined' || document.visibilityState === 'visible'
  }

  function sync() {
    if (enabled.value && isVisible()) resume()
    else pause()
  }

  function toggle() {
    enabled.value = !enabled.value
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', sync)
    sync()
  })

  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', sync)
    pause()
  })

  watch(enabled, sync)

  return { enabled, toggle }
}
