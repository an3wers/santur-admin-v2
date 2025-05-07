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
  NP,
  NText,
  NA
} from 'naive-ui'
import { useUserStore } from '~/entities/user'
import { APP_SUB_NAME } from '~/shared/config/constants'

// TODO: Можно вынести стэйт и логику в model
const message = useMessage()
const isLoading = ref(false)
const formRef = ref<FormInst | null>(null)
const modelValue = ref<{
  email: string
  password: string
}>({
  email: '',
  password: ''
})
const { login } = useUserStore()

const validateRules: FormRules = {
  email: {
    required: true,
    message: 'Введите email',
    trigger: 'blur',
    type: 'email'
  },
  password: {
    required: true,
    message: 'Введите пароль',
    trigger: 'blur'
  }
}

async function submitHandler() {
  try {
    isLoading.value = true
    await formRef.value?.validate()
    const { email, password } = modelValue.value

    await login({ username: email, password })

    modelValue.value.email = ''
    modelValue.value.password = ''

    return await navigateTo('/')
  } catch (error) {
    console.error('[submit login error]', error)
    let errorMessage = ''

    if ('data' in (error as any)) {
      errorMessage = (error as any).data?.message
        ? (error as any).data.message
        : (error as any).message
    } else {
      errorMessage = error instanceof Error && error.message ? error.message : JSON.stringify(error)
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
    <n-card title="Вход">
      <n-p>Для входа используйте email и пароль такой же, как для корпоративного портала.</n-p>
      <n-form
        @submit.prevent="submitHandler"
        ref="formRef"
        :rules="validateRules"
        :model="modelValue"
      >
        <n-form-item label="Email" path="email" :label-props="{ for: 'email' }">
          <n-input
            v-model:value="modelValue.email"
            type="text"
            placeholder="Введите email"
            :input-props="{
              name: 'email',
              id: 'email',
              type: 'email',
              inputmode: 'email',
              autocomplete: 'email'
            }"
          />
        </n-form-item>
        <n-form-item label="Пароль" path="password" :label-props="{ for: 'password' }">
          <n-input
            type="password"
            v-model:value="modelValue.password"
            placeholder="Введите пароль"
            show-password-on="mousedown"
            :input-props="{ name: 'password', id: 'password', autocomplete: 'current-password' }"
          />
        </n-form-item>
        <n-button :loading="isLoading" style="width: 100%" type="primary" attr-type="submit"
          >Войти</n-button
        >
      </n-form>
    </n-card>
    <div class="form-btn">
      <nuxt-link to="/profile/fogot-password" custom v-slot="{ href, navigate }">
        <n-a :href="href" @click="navigate"> Забыли пароль?</n-a>
      </nuxt-link>
    </div>
  </div>
</template>

<style scoped lang="css">
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
  justify-content: center;
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
