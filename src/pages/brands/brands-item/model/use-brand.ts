import {
  useBrandApi,
  type fileList,
  type FilesKeys,
  type BrandFile,
  type BrandSaveFilesDto
} from '@/entities/brand'
import type { UploadFileInfo } from 'naive-ui'
import { useMessage } from 'naive-ui'
import type { OptionsType } from '~/entities/media'
import { generateAlias } from '~/shared/libs/generate-alias'

export const useBrand = () => {
  const brandItem = reactive({
    id: 0,
    name: '',
    alias: '',
    descr: '',
    descrClear: '',
    published: false,
    logoSmallExist: false,
    logoBigExist: false,
    address: '',
    phones: '',
    email: '',
    site: '',
    contacts: ''
  })

  const logoUrls = reactive({
    logoSmall: '',
    logoBig: ''
  })

  const status = ref<ProcessStatus>('idle')

  const filePasportRef = ref<UploadFileInfo[]>([]) // file1
  const fileDilerSertRef = ref<UploadFileInfo[]>([]) // file2
  const fileSertRef = ref<UploadFileInfo[]>([]) // file3
  const fileCatalogRef = ref<UploadFileInfo[]>([]) // file4

  // Лого файлы
  const fileLogoSmallRef = ref<UploadFileInfo[]>([])
  const fileLogoLargeRef = ref<UploadFileInfo[]>([])

  // TODO: Переделать на map
  // TODO: Подумать нужна ли мне эта структура для хранения файлов
  let fileListToServer: BrandSaveFilesDto[] = []

  const api = useBrandApi()

  async function loadBrandItem(brandId: number | string) {
    try {
      status.value = 'pending'
      const res = await api.getBrand(Number(brandId))

      brandItem.id = res.brend.id
      brandItem.name = res.brend.name
      brandItem.alias = res.brend.alias
      brandItem.descr = res.brend.descr
      brandItem.descrClear = res.brend.descrClear
      brandItem.published = res.brend.published
      brandItem.logoSmallExist = res.brend.logoSmallExist
      brandItem.logoBigExist = res.brend.logoBigExist
      brandItem.address = res.brend.address
      brandItem.phones = res.brend.phones
      brandItem.email = res.brend.email
      brandItem.site = res.brend.site
      brandItem.contacts = res.brend.contacts

      filePasportRef.value = fillFileList('Паспорт', res.files)
      fileDilerSertRef.value = fillFileList('Сертификат дилера', res.files)
      fileSertRef.value = fillFileList('Cертификат', res.files)
      fileCatalogRef.value = fillFileList('Каталог', res.files)

      logoUrls.logoBig = res.logoBigUrl
      logoUrls.logoSmall = res.logoSmallUrl

      status.value = 'success'
    } catch (error) {
      console.error(error)
      status.value = 'error'
    }
  }

  function createAlias(value: string) {
    const result = generateAlias(value)
    brandItem.alias = result
  }

  function updatePublishStatus(value: boolean) {
    brandItem.published = value
  }

  /*
    FILES
  */

  type CategoryFiles = (typeof fileList)[FilesKeys]
  // По умолчанию храним только один объект файла в массиве
  const fillFileList = (
    category: Exclude<CategoryFiles, 'Большое лого' | 'Маленькое лого'>,
    files: BrandFile[]
  ): UploadFileInfo[] => {
    if (files.length) {
      const result = files
        .filter((file) => file.category === category)
        .map((file) => ({ id: file.id, name: file.name, status: 'finished' }))

      return result as unknown as UploadFileInfo[]
    }

    return []
  }

  function updateFileToServerFileList(file: UploadFileInfo, fileKey: FilesKeys) {
    if (file.status !== 'removed') {
      const foundIndex = fileListToServer.findIndex((el) => el.key === fileKey)
      if (foundIndex > -1) {
        fileListToServer.splice(foundIndex, 1, { file: file.file, key: fileKey })
      } else {
        fileListToServer.push({ file: file.file, key: fileKey })
      }
    } else {
      // Когда происходит удаление
      fileListToServer = fileListToServer.filter((el) => el.key !== fileKey)
    }
  }

  const MAX_SIZE_FILE = 20_000_000

  const fileChangeHandler = async (options: OptionsType, fileKey: FilesKeys) => {
    const isValidSize = () => options.file.file && options.file.file.size <= MAX_SIZE_FILE
    const isDownloadStatus = () => options.file.status !== 'removed'

    const currentFile: UploadFileInfo = {
      ...options.file,
      status: isValidSize() ? 'finished' : 'error'
    }

    updateFilesRefs(currentFile, fileKey, isDownloadStatus())

    if (isValidSize()) {
      updateFileToServerFileList(options.file, fileKey)
    }

    if (!isDownloadStatus() && !currentFile.file) {
      await removeDocument(currentFile.id)
    }
  }

  const updateFilesRefs = (file: UploadFileInfo, key: FilesKeys, isDownload: boolean) => {
    // Обновление рефов
    switch (key) {
      case 'file1': {
        if (!filePasportRef.value) {
          return
        }

        if (isDownload) {
          filePasportRef.value[0] = file
        } else {
          filePasportRef.value.pop()
        }
        break
      }
      case 'file2': {
        if (!fileDilerSertRef.value) {
          return
        }

        if (isDownload) {
          fileDilerSertRef.value[0] = file
        } else {
          fileDilerSertRef.value.pop()
        }
        break
      }
      case 'file3': {
        if (!fileSertRef.value) {
          return
        }

        if (isDownload) {
          fileSertRef.value[0] = file
        } else {
          fileSertRef.value.pop()
        }
        break
      }
      case 'file4': {
        if (!fileCatalogRef.value) {
          return
        }

        if (isDownload) {
          fileCatalogRef.value[0] = file
        } else {
          fileCatalogRef.value.pop()
        }
        break
      }

      case 'logobig': {
        if (isDownload) {
          fileLogoLargeRef.value[0] = file
        } else {
          fileLogoLargeRef.value.pop()
        }
        break
      }

      case 'logosmall': {
        if (isDownload) {
          fileLogoSmallRef.value[0] = file
        } else {
          fileLogoSmallRef.value.pop()
        }
        break
      }

      default:
        break
    }
  }

  const message = useMessage()
  const removeDocument = async (id: number | string) => {
    try {
      await api.removeDocument(id)
    } catch (error) {
      console.error(error)
      const errorText =
        error instanceof Error ? error.message : 'Произошла ошибка при удалении файла'
      message.error(errorText)
    }
  }

  const removeLogo = async (size: 'small' | 'big') => {
    try {
      await api.removeLogo(brandItem.id, size)
      if (size === 'small') {
        brandItem.logoSmallExist = false
      } else {
        brandItem.logoBigExist = false
      }
    } catch (error) {
      console.error(error)
      const errorText =
        error instanceof Error ? error.message : 'Произошла ошибка при удалении логотипа'
      message.error(errorText)
    }
  }

  return {
    brandItem,
    status,
    loadBrandItem,
    createAlias,
    updatePublishStatus,
    filePasportRef,
    fileDilerSertRef,
    fileSertRef,
    fileCatalogRef,
    fileLogoSmallRef,
    fileLogoLargeRef,
    fileListToServer,
    logoUrls,
    removeLogo,
    fileChangeHandler
  }
}
