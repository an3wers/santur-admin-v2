<script setup lang="ts">
import {
  NForm,
  NFormItem,
  NInput,
  NButton,
  NText,
  NCheckbox,
  type FormRules,
  useMessage,
  type FormInst
} from 'naive-ui'
import { useSaveFeedKey } from '../model/use-save-feed-key'

const { ctx, mode, currentKeyValue } = defineProps<{
  ctx: string
  mode: 'add' | 'edit'
  currentKeyValue: { value: string; label: string; descr: string } | null
  canEditKey: boolean
}>()

const emits = defineEmits<{
  (e: 'onAfterSuccessSaveKey', key: string): void
}>()

const formRef = ref<FormInst | null>(null)

const keyFormValue = ref({
  name: '',
  key: '',
  descr: '',
  isLimitedCatalog: false
})

watchEffect(() => {
  if (mode === 'edit' && currentKeyValue) {
    keyFormValue.value.name = currentKeyValue.label
    keyFormValue.value.key = currentKeyValue.value
    keyFormValue.value.descr = currentKeyValue.descr
    // TODO: get isLimitedCatalog from currentKeyValue and set it to keyFormValue.value.isLimitedCatalog
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
        return Promise.reject('Введите корректный ключ')
      }

      return Promise.resolve()
    }
  },
  descr: {
    required: false
  }
}
const message = useMessage()

const { status: saveFeedKeyStatus, saveFeedKey, error: saveFeedKeyError } = useSaveFeedKey(ctx)

async function submitHandler() {
  try {
    const isValid = await formRef.value?.validate()

    if (!isValid) {
      throw new Error('Проверьте корректность заполнения полей')
    }

    // key without prefix
    const { name, key, descr } = keyFormValue.value

    await saveFeedKey({ descr, key, name })

    if (saveFeedKeyStatus.value === 'success') {
      message.success('Настройка успешно сохранена')

      emits('onAfterSuccessSaveKey', key)

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
  keyFormValue.value.isLimitedCatalog = false
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
        :disabled="mode === 'edit' || !canEditKey"
      />
    </n-form-item>
    <div class="hint-message">
      <n-text tag="p" :depth="3"
        >Ключ может содержать только латинские буквы, цифры, дефис ("-") и двоеточие (":") без
        пробелов</n-text
      >
    </div>
    <template v-if="ctx == '3'">
      <n-form-item style="margin-left: 6rem; margin-bottom: -1rem" path="isLimitedCatalog">
        <n-checkbox v-model:checked="keyFormValue.isLimitedCatalog">
          Ограничить каталог клиента
        </n-checkbox>
      </n-form-item>
      <div class="hint-message">
        <n-text tag="p" :depth="3"
          >При включении этой опции, каталог клиента будет ограничен только теми категориями,
          которые выбраны в настройке и общий каталог будет недоступен.</n-text
        >
      </div>
    </template>

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

.hint-message {
  margin-bottom: 2rem;
  margin-left: 6rem;
}
</style>
