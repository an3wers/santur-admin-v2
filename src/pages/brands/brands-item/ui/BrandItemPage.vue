<script setup lang="ts">
import {
  NSpace,
  NH1,
  useMessage,
  NSpin,
  NCard,
  NFormItem,
  NForm,
  NInput,
  NButton,
  NSwitch,
  NDivider,
  NGrid,
  NFormItemGi,
  type FormInst,
  NInputGroup,
  NIcon,
  NGi,
  NText,
  NImage,
  NUpload
} from 'naive-ui'
import { useBrand } from '../model/use-brand'
import { useSaveBrand } from '../model/use-save-brand'
import { useChangePublishBrand } from '~/entities/brand'
import { Refresh } from '@vicons/tabler'
import AppEditor from '~/shared/ui/app-editor/AppEditor.vue'
import { MediaList, type OptionsType } from '@/entities/media'

const route = useRoute()

const { itemId } = route.params
const {
  brandItem,
  status,
  loadBrandItem,
  updatePublishStatus,
  createAlias,
  logoUrls,
  fileCatalogRef,
  fileDilerSertRef,
  filePasportRef,
  fileSertRef,
  fileListToServer,
  fileLogoLargeRef,
  fileLogoSmallRef,
  fileChangeHandler,
  removeLogo
} = useBrand()

await loadBrandItem(Number(itemId))

if (status.value === 'error') {
  throw createError({ statusMessage: 'Произошла ошибка при загрузке брендов', statusCode: 400 })
}

const formRef = ref<FormInst | null>(null)
const formRules = {
  name: {
    required: true,
    message: 'Добавьте название бренда',
    trigger: ['change', 'blur']
  },
  alias: {
    required: true,
    message: 'Добавьте алиас бренда',
    trigger: ['change', 'blur']
  }
}

function cancelHandler() {
  return navigateTo('/brends')
}
const message = useMessage()
const { saveBrand, status: saveStatus } = useSaveBrand()
/* 
  На серверно стороне не работает сохранение бренд без заполненных файлов

      "title": "One or more validation errors occurred.",
    "status": 400,
    "errors": {
        "file1": [
            "The file1 field is required."
        ],
        "file2": [
            "The file2 field is required."
        ],
        "file3": [
            "The file3 field is required."
        ],
        "file4": [
            "The file4 field is required."
        ],
        "logobig": [
            "The logobig field is required."
        ],
        "logosmall": [
            "The logosmall field is required."
        ]
    },

*/
async function saveHandler() {
  try {
    const errors = await formRef.value?.validate()

    if (errors?.warnings) {
      throw new Error('Проверьте корректность заполнения полей')
    }

    await saveBrand(
      {
        address: brandItem.address,
        alias: brandItem.alias,
        descr: brandItem.descr,
        email: brandItem.email,
        id: brandItem.id,
        name: brandItem.name,
        phones: brandItem.phones,
        published: brandItem.published,
        site: brandItem.site
      },
      fileListToServer
    )

    if (saveStatus.value === 'success') {
      message.success('Бренд сохранен')
    }
  } catch (error) {
    if (Array.isArray(error)) {
      error.forEach((err) => {
        message.error(err[0].message)
      })
    } else {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)
      message.error(errorMessage)
    }
  }
}

const { changePublish, status: changePublishStatus } = useChangePublishBrand()

async function changePublishHandler(value: boolean) {
  if (!brandItem.id) {
    updatePublishStatus(value)
    return
  } else {
    const status = await changePublish(brandItem.id)

    if (changePublishStatus.value === 'success' && status) {
      updatePublishStatus(status === 'Y')

      message.success('Статус публикации изменен')
    }
  }
}

async function removeLogoHandler(size: 'small' | 'big') {
  try {
    await removeLogo(size)
    message.success('Логотип удален')
  } catch (error) {
    console.error(error)
    message.error('Произошла ошибка при удалении логотипа')
  }
}
</script>

<template>
  <div class="container">
    <n-space vertical size="large">
      <page-title back-label="Бренды" has-back :back-path="`/brends`">
        <template #title>
          <n-h1>{{ brandItem.name }}</n-h1>
        </template>
      </page-title>

      <n-spin :show="status === 'pending'">
        <div class="layout">
          <div>
            <n-form ref="formRef" :model="brandItem" :rules="formRules">
              <n-card title="Каточка бренда">
                <n-form-item label="Наименование" path="name">
                  <n-input v-model:value="brandItem.name" placeholder="Наименование" />
                </n-form-item>
                <n-form-item label="Алиас" path="alias">
                  <n-input-group>
                    <n-input v-model:value="brandItem.alias" placeholder="Алиас" />
                    <n-button ghost @click.stop="createAlias(brandItem.name)">
                      <n-icon size="20px" :component="Refresh" />
                    </n-button>
                  </n-input-group>
                </n-form-item>
                <n-space>
                  <n-switch
                    :value="brandItem.published"
                    :loading="changePublishStatus === 'pending'"
                    @update:value="changePublishHandler"
                  />
                  <span>Опубликовано</span>
                </n-space>
                <n-divider />
                <n-grid x-gap="24" y-gap="16" cols="2">
                  <n-form-item-gi label="Адрес">
                    <n-input v-model:value="brandItem.address" placeholder="Адрес" />
                  </n-form-item-gi>
                  <n-form-item-gi label="Телефон">
                    <n-input v-model:value="brandItem.phones" placeholder="Телефон" />
                  </n-form-item-gi>
                  <n-form-item-gi label="Email">
                    <n-input v-model:value="brandItem.email" placeholder="Email" />
                  </n-form-item-gi>
                  <n-form-item-gi label="Сайт">
                    <n-input v-model:value="brandItem.site" placeholder="Сайт" />
                  </n-form-item-gi>
                </n-grid>
                <n-form-item label="Описание">
                  <AppEditor v-model="brandItem.descr">
                    <template #media-manager="{ onMediaSelect }">
                      <media-list
                        media-view-mode="select"
                        @on-media-select="onMediaSelect"
                      ></media-list>
                    </template>
                  </AppEditor>
                </n-form-item>
                <template #action>
                  <n-space justify="end">
                    <n-button
                      attr-type="button"
                      @click="cancelHandler"
                      :dashed="saveStatus === 'pending'"
                      secondary
                      type="primary"
                      >Отменить</n-button
                    >
                    <n-button
                      attr-type="button"
                      @click="saveHandler"
                      :loading="saveStatus === 'pending'"
                      type="primary"
                      >Сохранить</n-button
                    >
                  </n-space>
                </template>
              </n-card>
            </n-form>
          </div>

          <n-space vertical size="large">
            <n-card title="Логотипы">
              <n-grid x-gap="24" y-gap="24" :cols="1">
                <n-gi>
                  <n-space vertical size="large">
                    <n-text tag="p" strong>Маленькое лого (~250px)</n-text>
                    <n-space align="center">
                      <template v-if="brandItem.logoSmallExist">
                        <n-image
                          width="100"
                          height="40"
                          object-fit="contain"
                          :src="logoUrls.logoSmall"
                        />
                        <n-button
                          tertiary
                          type="error"
                          @click="removeLogoHandler('small')"
                          size="small"
                          >Удалить</n-button
                        >
                      </template>

                      <n-upload
                        v-else
                        :file-list="fileLogoSmallRef"
                        :default-upload="false"
                        @change="(options: OptionsType) => fileChangeHandler(options, 'logosmall')"
                      >
                        <n-button>Выбрать изображение</n-button>
                      </n-upload>
                    </n-space>
                  </n-space>
                </n-gi>
                <n-gi>
                  <n-space vertical size="large">
                    <n-text tag="p" strong>Большое лого (~600px)</n-text>
                    <n-space align="center">
                      <template v-if="brandItem.logoBigExist">
                        <n-image
                          width="100"
                          height="40"
                          object-fit="contain"
                          :src="logoUrls.logoBig"
                        />
                        <n-button
                          tertiary
                          type="error"
                          @click="removeLogoHandler('big')"
                          size="small"
                          >Удалить</n-button
                        >
                      </template>

                      <n-upload
                        v-else
                        :file-list="fileLogoLargeRef"
                        :default-upload="false"
                        @change="(options: OptionsType) => fileChangeHandler(options, 'logobig')"
                      >
                        <n-button>Выбрать изображение</n-button>
                      </n-upload>
                    </n-space>
                  </n-space>
                </n-gi>
              </n-grid>
            </n-card>
            <n-card title="Сертификаты и паспорта">
              <n-text tag="p" :depth="3" style="margin-bottom: 0.5rem"
                >Максимальный размер загружаемого файла&nbsp;20&nbsp;мб.</n-text
              >
              <n-grid x-gap="24" y-gap="4" cols="1">
                <n-form-item-gi label="Паспорт">
                  <n-upload
                    :file-list="filePasportRef"
                    :default-upload="false"
                    @change="(options: OptionsType) => fileChangeHandler(options, 'file1')"
                  >
                    <n-button>Загрузить файл</n-button>
                  </n-upload>
                </n-form-item-gi>
                <n-form-item-gi label="Сертификат дилера">
                  <n-upload
                    :file-list="fileDilerSertRef"
                    :default-upload="false"
                    @change="(options: OptionsType) => fileChangeHandler(options, 'file2')"
                  >
                    <n-button>Загрузить файл</n-button>
                  </n-upload>
                </n-form-item-gi>
                <n-form-item-gi label="Сертификат">
                  <n-upload
                    :file-list="fileSertRef"
                    :default-upload="false"
                    @change="(options: OptionsType) => fileChangeHandler(options, 'file3')"
                  >
                    <n-button>Загрузить файл</n-button>
                  </n-upload>
                </n-form-item-gi>
                <n-form-item-gi label="Каталог">
                  <n-upload
                    :file-list="fileCatalogRef"
                    :default-upload="false"
                    @change="(options: OptionsType) => fileChangeHandler(options, 'file4')"
                  >
                    <n-button>Загрузить файл</n-button>
                  </n-upload>
                </n-form-item-gi>
              </n-grid>
            </n-card>
          </n-space>
        </div>
      </n-spin>
    </n-space>
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 1fr minmax(320px, 400px);
  gap: 1rem;
}
</style>
