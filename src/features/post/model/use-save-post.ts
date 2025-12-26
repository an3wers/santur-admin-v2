import { usePostApi } from '../../../entities/post/api/post-api'
import type { SavePostReq } from '../../../entities/post/api/post-schemas'

export const useSavePost = () => {
  const status = ref<ProcessStatus>('idle')

  const api = usePostApi()
  async function savePost(data: SavePostReq) {
    const formdata = new FormData()
    formdata.append('id', data.id.toString())
    formdata.append('title', data.title)
    formdata.append('alias', data.alias)
    formdata.append('descr', data.descr)
    formdata.append('content', data.content)
    formdata.append('categoryId', data.categoryId.toString())
    formdata.append('published', data.published)
    formdata.append('date', data.date)
    formdata.append('extFields', JSON.stringify(data.extFields))
    formdata.append('previewImgUrl', data.previewImgUrl)
    if (data.previewImage) {
      const file = data.previewImage

      // Если это Proxy, пытаемся получить исходный объект
      // if (file && typeof file === 'object' && '__v_raw' in file) {
      //   file = toRaw(file)
      // }

      // Проверяем, что это File/Blob
      if (file instanceof File || file instanceof Blob) {
        formdata.append('previewImage', file)
      } else if (file && file.file) {
        // Если это объект с file свойством (структура naive-ui upload)
        formdata.append('previewImage', file.file)
      }
    }

    try {
      status.value = 'pending'
      console.log('formdata', formdata)
      await api.savePost(formdata)
      status.value = 'success'
    } catch (error) {
      console.error(error)
      status.value = 'error'
    }
  }

  return { savePost, status }
}
