import type { MediaListItem } from './media-types'
import { useMediaApi } from '../api/media-api'
import type { FormRules } from 'naive-ui'
type InitialState = Pick<MediaListItem, 'fileName' | 'imgPath'>

export const useMediaView = (initialState: InitialState) => {
  const mediaViewModel = reactive({
    fileName: initialState.fileName,
    filePath: initialState.imgPath
  })

  const validateRules: FormRules = {
    fileName: {
      required: true,
      message: 'Введите название',
      trigger: 'blur'
    },
    // Readonly input
    filePath: {
      required: true
    }
  }

  const status = ref<ProcessStatus>('idle')

  const api = useMediaApi()

  async function updateFileName(mediaId: string) {
    try {
      status.value = 'pending'
      const res = await api.updateFileName(mediaId, mediaViewModel.fileName)
      status.value = 'success'
      return res
    } catch (error) {
      console.error(error)
      status.value = 'error'
    }
  }

  return { mediaViewModel, status, updateFileName, validateRules }
}
