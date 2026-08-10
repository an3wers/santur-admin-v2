import type { DownloadTemplateOption } from '../api/catalog-schemas'
import { useCatalogApi } from '../api/catalog-api'
import { generateAlias } from '~/shared/libs/generate-alias'

export const useDownloadTemplate = () => {
  const status = ref<ProcessStatus>('idle')

  type DowloadFile = {
    name: string
    url: string
  }

  const downloadFile = ref<DowloadFile | null>(null)

  const { downloadDescriptionTemplate } = useCatalogApi()

  async function downloadTemplate(tnName: string, options: DownloadTemplateOption) {
    try {
      status.value = 'pending'
      const res = await downloadDescriptionTemplate(tnName, options)

      const url = URL.createObjectURL(res)

      downloadFile.value = {
        name: `${generateAlias(tnName)}_tmpl.xlsx`,
        url: url
      }

      status.value = 'success'
    } catch (error) {
      console.error(error)
      status.value = 'error'
    }
  }

  function reset() {
    downloadFile.value = null
    status.value = 'idle'
  }

  return { downloadTemplate, status, downloadFile, reset }
}
