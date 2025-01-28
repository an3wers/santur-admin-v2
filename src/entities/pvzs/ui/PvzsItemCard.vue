<script setup lang="ts">
import {
  NCard,
  NForm,
  type FormInst,
  NFormItem,
  NInput,
  NGrid,
  NFormItemGi,
  NSpace,
  NText,
  NCheckbox,
  NButton,
  useMessage,
  NSwitch
} from 'naive-ui'
import { usePvzsItemStore } from '../model/pvzs-item.store'
import { validationRules } from '../config/validation-rules'

const pvzsItemStore = usePvzsItemStore()
const {
  pvzsItem,
  pvzsItemSecondaryFields,
  saveStatus,
  removeStatus,
  removeError,
  saveError,
  listKey
} = storeToRefs(pvzsItemStore)

const formRef = ref<FormInst | null>(null)

const message = useMessage()

async function submitHandler() {
  try {
    const validateResult = await formRef.value?.validate()

    if (validateResult?.warnings) {
      throw new Error('Проверьте корректность заполнения полей')
    }

    await pvzsItemStore.savePvzsItem()

    if (saveStatus.value === 'error') {
      throw new Error(saveError.value)
    }

    if (saveStatus.value === 'success') {
      message.success('Данные успешно сохранены')
    }

    if (!pvzsItem.value.id) {
      clearNuxtData(listKey.value)
      return await navigateTo({ path: `/pvzs/${pvzsItemSecondaryFields.value.ownerid}` })

      // return await navigateTo({
      //   path: `/pvzs/${pvzsItemSecondaryFields.value.ownerid}/${savedPvz.id}`
      // })
    }

    await pvzsItemStore.updateCurrent(pvzsItem.value.id)
  } catch (error) {
    console.error(error)
    if (error instanceof Error) {
      message.error(error.message)
    } else if (typeof error === 'object') {
      message.error('Проверьте корректность заполнения полей')
    }
  }
}

async function deleteHandler() {
  await pvzsItemStore.deletePvzsItem(pvzsItem.value.id)

  if (removeStatus.value === 'success') {
    message.success('Данные успешно удалены')
    return await navigateTo({ path: `/pvzs/${pvzsItemSecondaryFields.value.ownerid}` })
  }

  if (removeStatus.value === 'error') {
    message.error(removeError.value)
  }
}

async function cancelHandler() {
  // navigate to parent route
  await navigateTo({ path: `/pvzs/${pvzsItemSecondaryFields.value.ownerid}` })
}
</script>

<template>
  <n-card>
    <n-form
      ref="formRef"
      :rules="validationRules"
      :model="pvzsItem"
      :disabled="saveStatus === 'pending'"
    >
      <n-form-item label="Наименование" path="name" :label-props="{ for: 'pvz-name' }">
        <n-input
          v-model:value="pvzsItem.name"
          placeholder="Наименование"
          :input-props="{ name: 'pvz-name', id: 'pvz-name' }"
        />
      </n-form-item>
      <n-form-item label="Описание" path="descr" :label-props="{ for: 'pvz-descr' }">
        <n-input
          v-model:value="pvzsItem.descr"
          placeholder="Описание"
          :input-props="{ name: 'pvz-descr', id: 'pvz-descr' }"
        />
      </n-form-item>
      <n-grid x-gap="24" y-gap="4" cols="2">
        <n-form-item-gi label="Код 1С" path="code" :label-props="{ for: 'pvz-code' }">
          <n-input
            v-model:value="pvzsItem.code"
            readonly
            placeholder="Код 1С"
            :input-props="{ name: 'pvz-code', id: 'pvz-code' }"
          />
        </n-form-item-gi>
        <n-form-item-gi label="ЦФО" path="cfo" :label-props="{ for: 'pvz-cfo' }">
          <n-input
            v-model:value="pvzsItem.cfo"
            readonly
            placeholder="ЦФО"
            :input-props="{ name: 'pvz-cfo', id: 'pvz-cfo' }"
          />
        </n-form-item-gi>
      </n-grid>
      <n-form-item label="Город" path="city" :label-props="{ for: 'city' }">
        <n-input
          v-model:value="pvzsItem.city"
          placeholder="Город"
          :input-props="{ name: 'city', id: 'city' }"
        />
      </n-form-item>
      <n-form-item label="Адрес" path="address" :label-props="{ for: 'pvz-address' }">
        <n-input
          v-model:value="pvzsItem.address"
          placeholder="Адрес"
          :input-props="{ name: 'pvz-address', id: 'pvz-address', autocomplete: 'off' }"
        />
      </n-form-item>
      <n-form-item label="Время работы" path="times" :label-props="{ for: 'pvz-times' }">
        <n-input
          v-model:value="pvzsItem.times"
          placeholder="Время работы"
          :input-props="{ name: 'pvz-times', id: 'pvz-times' }"
        />
      </n-form-item>

      <n-form-item label="Телефон" path="phones" :label-props="{ for: 'pvz-phones' }">
        <n-input
          v-model:value="pvzsItem.phones"
          placeholder="Телефон"
          :input-props="{ name: 'pvz-phones', id: 'pvz-phones' }"
        />
      </n-form-item>
      <n-form-item
        label="Способы оплаты"
        path="payvariants"
        :label-props="{ for: 'pvz-payvariants' }"
      >
        <n-input
          v-model:value="pvzsItem.payVariants"
          placeholder="Способы оплаты"
          :input-props="{ name: 'pvz-payvariants', id: 'pvz-payvariants' }"
        />
      </n-form-item>
      <n-text class="group-lable">GPS-координаты</n-text>
      <n-space>
        <n-form-item label="Lat" path="gpsLat" :label-props="{ for: 'pvz-lat' }">
          <n-input
            v-model:value="pvzsItem.gpsLat"
            placeholder="Широта"
            :input-props="{ name: 'pvz-lat', id: 'pvz-lat' }"
          />
        </n-form-item>
        <n-form-item label="Lng" path="gpsLng" :label-props="{ for: 'pvz-lng' }">
          <n-input
            v-model:value="pvzsItem.gpsLng"
            placeholder="Долгота"
            :input-props="{ name: 'pvz-lng', id: 'pvz-lng' }"
          />
        </n-form-item>
      </n-space>
      <n-form-item label="Пункт самовывоза">
        <n-space>
          <n-checkbox v-model:checked="pvzsItem.forU"> Для юр. лиц </n-checkbox>
          <n-checkbox v-model:checked="pvzsItem.forP"> Для физ. лиц </n-checkbox>
        </n-space>
      </n-form-item>

      <n-space>
        <n-switch v-model:value="pvzsItem.isActive" :disabled="saveStatus === 'pending'" />
        <span>Опубликовано</span>
      </n-space>
    </n-form>

    <template #action>
      <n-space justify="space-between">
        <n-button
          @click="deleteHandler"
          attr-type="button"
          type="error"
          v-show="pvzsItem.id"
          :disabled="saveStatus === 'pending'"
          >Удалить</n-button
        >
        <n-space>
          <n-button
            @click="cancelHandler"
            secondary
            attr-type="button"
            type="primary"
            :disabled="saveStatus === 'pending'"
            >Отменить</n-button
          >
          <n-button
            @click="submitHandler"
            type="primary"
            attr-type="button"
            :disabled="saveStatus === 'pending'"
            :loading="saveStatus === 'pending'"
            >Сохранить</n-button
          >
        </n-space>
      </n-space>
    </template>
  </n-card>
</template>

<style scoped>
.group-lable {
  display: block;
  margin-bottom: 0.5rem;
}
</style>
