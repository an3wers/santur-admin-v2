import type { CopyFilterData } from './types'

export const useCopyFilterDataStore = defineStore('copy-filter-data-store', () => {
  const copyFilterData = ref<CopyFilterData | null>(null)

  function setCopyFilterData(data: CopyFilterData | null) {
    copyFilterData.value = data
  }

  if (import.meta.client) {
    const channel = new BroadcastChannel('filter-data-channel')
    let isReceiving = false

    channel.onmessage = async (event: MessageEvent<{ type: string; data?: string }>) => {
      const { type, data } = event.data

      if (type === 'request-state') {
        channel.postMessage({ type: 'sync-state', data: JSON.stringify(copyFilterData.value) })
        return
      }

      if (type === 'sync-state' || type === 'update') {
        isReceiving = true
        copyFilterData.value = data ? JSON.parse(data) : null
        await nextTick()
        isReceiving = false
      }
    }

    watch(copyFilterData, (newValue) => {
      if (!isReceiving) {
        channel.postMessage({ type: 'update', data: JSON.stringify(newValue) })
      }
    })

    channel.postMessage({ type: 'request-state' })

    onScopeDispose(() => channel.close())
  }

  return { copyFilterData, setCopyFilterData }
})
