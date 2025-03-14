<script setup lang="ts">
import {
  NCard,
  NInput,
  NForm,
  NFormItem,
  NButton,
  type FormInst,
  type FormRules,
  useMessage,
  NA,
  NText
} from 'naive-ui'
import { useUserApi } from '~/entities/user'
import { APP_SUB_NAME } from '~/shared/config/constants'

const message = useMessage()
const { loginFogot } = useUserApi()
interface ModelValue {
  email: string
}

const formRef = ref<FormInst | null>(null)
const isLoading = ref(false)
const modelValue = ref<ModelValue>({
  email: ''
})

const validateRules: FormRules = {
  email: {
    required: true,
    message: 'Введите email',
    trigger: 'blur',
    type: 'email'
  }
}

async function submitHandler() {
  try {
    isLoading.value = true

    await formRef.value?.validate()

    const { email } = modelValue.value
    const data = await loginFogot(email)

    message.success(data)

    const timerId = setTimeout(() => {
      navigateTo('/profile/sign-in')
      clearTimeout(timerId)
    }, 800)
  } catch (error) {
    console.error(error)

    let errorMessage = ''

    if (Array.isArray(error)) {
      const errors: string[] = []
      error.forEach((err) => {
        errors.push(err[0].message)
      })
      errorMessage = errors.join(', ')
    } else {
      errorMessage = error instanceof Error ? error.message : JSON.stringify(error)
    }

    message.error(errorMessage)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="page-container">
    <div class="logo-container">
      <div class="logo-container__img">
        <img src="/logo/logo.svg" alt="logo" />
      </div>
      <n-text depth="3" class="logo-container__descr">{{ APP_SUB_NAME }}</n-text>
    </div>
    <n-card title="Восстановить пароль">
      <n-form
        @submit.prevent="submitHandler"
        ref="formRef"
        :rules="validateRules"
        :model="modelValue"
      >
        <n-form-item label="Email" path="email">
          <n-input v-model:value="modelValue.email" placeholder="Введите email" />
        </n-form-item>
        <n-button :loading="isLoading" style="width: 100%" type="primary" attr-type="submit"
          >Восстановить пароль</n-button
        >
      </n-form>
    </n-card>
    <div class="form-btn">
      Вспомнили пароль?&nbsp;<nuxt-link to="/profile/sign-in" custom v-slot="{ href, navigate }">
        <n-a :href="href" @click="navigate">Войти</n-a>
      </nuxt-link>
    </div>
  </div>
</template>

<style scoped>
.sub-header {
  margin-bottom: 1rem;
}
.page-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1rem;
  max-width: 1024px;
  width: 100%;
  margin: auto auto;
  height: auto;
  align-self: center;
}

.logo-container {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.logo-container__img {
  width: 300px;
  height: auto;
}

.logo-container__img img {
  width: 100%;
  height: auto;
  object-fit: contain;
}

.logo-container__descr {
  font-size: var(--font-size-md);
}

.n-card {
  max-width: 498px;
}

.form-btn {
  display: flex;
}
</style>
