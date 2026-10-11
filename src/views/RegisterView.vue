<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePhoneMask } from '@/composables/usePhoneMask'

const auth = useAuthStore()
const router = useRouter()

const { phone, onInput } = usePhoneMask()
const password = ref('')
const password2 = ref('')

const phoneComplete = computed(() => phone.value.length === 16)
const match = computed(() => password.value === password2.value)

async function submit() {
    if (!match.value) return
    const ok = await auth.register({ phone: phone.value, password: password.value })
    if (ok) router.push({ name: 'chats' }) // токен уже получен — сразу в чаты
}
</script>

<template>
    <div class="login-page">
        <form class="login-card" @submit.prevent="submit">
        <h1>Регистрация</h1>

        <label>
            Телефон
            <input :value="phone" type="tel" placeholder="+7(999)999-99-90" autocomplete="tel" @input="onInput" />
        </label>

        <label>
            Пароль
            <input v-model="password" type="password" autocomplete="new-password" />
        </label>

        <label>
            Повторите пароль
            <input v-model="password2" type="password" autocomplete="new-password" />
        </label>

        <p v-if="password2 && !match" class="error">Пароли не совпадают</p>
        <p v-if="auth.error" class="error">{{ auth.error }}</p>

        <button type="submit" :disabled="auth.loading || !phoneComplete || !password || !match">
            {{ auth.loading ? 'Создаём аккаунт…' : 'Зарегистрироваться' }}
        </button>

        <p class="switch">
            Уже есть аккаунт? <router-link :to="{ name: 'login' }">Войти</router-link>
        </p>
        </form>
    </div>
</template>
