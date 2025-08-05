<script setup lang="ts">
import { NForm, NFormItem, NInput, NButton, type FormRules, useMessage } from 'naive-ui'
import { useSaveFeedKey } from '../model/use-save-feed-key'

const { mode, currentKeyValue } = defineProps<{
  mode: 'add' | 'edit'
  currentKeyValue: { value: string; label: string; descr: string } | null
  canEditKey: boolean
}>()

const emits = defineEmits<{
  (e: 'onAfterSuccessSaveKey'): void
}>()

const formRef = ref()

const keyFormValue = ref({
  name: '',
  key: '',
  descr: ''
})

watchEffect(() => {
  if (mode === 'edit' && currentKeyValue) {
    keyFormValue.value.name = currentKeyValue.label
    keyFormValue.value.key = currentKeyValue.value
    keyFormValue.value.descr = currentKeyValue.descr
  } else {
    resetForm()
  }
})

const formRules: FormRules = {
  name: {
    required: true,
    message: 'Введите название',
    trigger: 'blur'
  },
  key: {
    required: true,
    trigger: 'blur',
    validator(_, value) {
      if (!value) return Promise.reject('Введите ключ')

      // Проверка на наличие только латинских символов, цифр, дефиса и двоеточия без пробелов
      if (!/^[a-zA-Z0-9\-:]+$/.test(value)) {
        return Promise.reject(
          'Ключ должен содержать только латинские буквы, цифры, дефис ("-") и двоеточие (":") без пробелов'
        )
      }

      return Promise.resolve()
    }
  },
  descr: {
    required: false
  }
}
const message = useMessage()

const { status: saveFeedKeyStatus, saveFeedKey, error: saveFeedKeyError } = useSaveFeedKey()

async function submitHandler() {
  try {
    const isValid = await formRef.value?.validate()

    if (!isValid) {
      throw new Error('Проверьте корректность заполнения полей')
    }

    const { name, key, descr } = keyFormValue.value

    await saveFeedKey({ descr, key, name })

    if (saveFeedKeyStatus.value === 'success') {
      message.success('Фид успешно сохранен')

      emits('onAfterSuccessSaveKey')

      resetForm()
    } else if (saveFeedKeyStatus.value === 'error') {
      throw new Error(saveFeedKeyError.value)
    }
  } catch (error) {
    console.error(error)
    message.error(error instanceof Error ? error.message : 'Что-то пошло не так')
  }
}

function resetForm() {
  keyFormValue.value.name = ''
  keyFormValue.value.key = ''
  keyFormValue.value.descr = ''
}
</script>

<template>
  <n-form
    ref="formRef"
    label-placement="left"
    label-width="auto"
    :model="keyFormValue"
    :rules="formRules"
    :disabled="saveFeedKeyStatus === 'pending'"
    @submit.prevent="submitHandler"
  >
    <n-form-item path="name" label="Название">
      <n-input v-model:value="keyFormValue.name" placeholder="Введите название" />
    </n-form-item>
    <n-form-item path="key" label="Ключ">
      <n-input
        v-model:value="keyFormValue.key"
        placeholder="Введите ключ"
        :readonly="mode === 'edit' || !canEditKey"
      />
    </n-form-item>
    <n-form-item path="descr" label="Описание">
      <n-input v-model:value="keyFormValue.descr" type="textarea" placeholder="" />
    </n-form-item>
    <div class="form-btn">
      <n-button :attr-type="'submit'" type="primary" :loading="saveFeedKeyStatus === 'pending'">{{
        mode === 'add' ? 'Добавить' : 'Сохранить'
      }}</n-button>
    </div>
  </n-form>
</template>

<style scoped>
.form-btn {
  display: flex;
  justify-content: flex-end;
}
</style>
