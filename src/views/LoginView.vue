<!-- src/views/LoginView.vue (полностью, замени весь файл) -->
<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePhoneMask } from '@/composables/usePhoneMask'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const { phone, onInput } = usePhoneMask()
const password = ref('')

const phoneComplete = computed(() => phone.value.length === 16)

async function submit() {
  const ok = await auth.login({ phone: phone.value, password: password.value })
  if (ok) router.push(route.query.redirect || { name: 'chats' })
}
</script>

<template>
    <div class="login-page">
        <form class="login-card" @submit.prevent="submit">
        <h1>Мессенджер</h1>

        <label>
            Телефон
            <input
            :value="phone"
            type="tel"
            placeholder="+7(999)999-99-90"
            autocomplete="tel"
            @input="onInput"
            />
        </label>

        <label>
            Пароль
            <input v-model="password" type="password" autocomplete="current-password" />
        </label>

        <p v-if="auth.error" class="error">{{ auth.error }}</p>

        <button
            type="submit"
            :disabled="auth.loading || !phoneComplete || !password"
        >
            {{ auth.loading ? 'Входим…' : 'Войти' }}
        </button>

        <p class="switch">
            Нет аккаунта? <router-link :to="{ name: 'register' }">Зарегистрироваться</router-link>
        </p>
        </form>
    </div>
</template>