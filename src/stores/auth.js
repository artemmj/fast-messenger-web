import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '@/api/auth'
import { usersApi } from '@/api/users'
import { TOKEN_KEY, SESSION_KEY, USER_KEY } from '@/api/http'
import { decodeJwtPayload } from '@/utils/jwt'

function readStoredUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null') }
    catch { return null }
}

// FastAPI отдаёт ошибки как { detail: "..." } или { detail: [{msg}, ...] }
function extractError(e, fallback) {
    const d = e.response?.data?.detail
    if (typeof d === 'string') return d
    if (Array.isArray(d)) return d.map((x) => x.msg).join('; ')
    return fallback
}

export const useAuthStore = defineStore('auth', () => {
    const accessToken = ref(localStorage.getItem(TOKEN_KEY))
    const sessionId = ref(localStorage.getItem(SESSION_KEY))
    const user = ref(readStoredUser())
    const loading = ref(false)
    const error = ref(null)

    const isAuthenticated = computed(() => Boolean(accessToken.value))
    const myUserId = computed(
        () => user.value?.id ?? decodeJwtPayload(accessToken.value)?.user_id ?? null
    )

    function setSession({ access_token, session_id }) {
        accessToken.value = access_token
        sessionId.value = session_id
        localStorage.setItem(TOKEN_KEY, access_token)
        localStorage.setItem(SESSION_KEY, session_id)
    }

    function setUser(u) {
        user.value = u
        localStorage.setItem(USER_KEY, JSON.stringify(u))
    }

    function clearAll() {
        accessToken.value = null
        sessionId.value = null
        user.value = null
        ;[TOKEN_KEY, SESSION_KEY, USER_KEY].forEach((k) => localStorage.removeItem(k))
    }

    async function login(credentials) {
        loading.value = true
        error.value = null
        try {
            const { data } = await authApi.login(credentials)
            setSession(data)
            await loadUser() // логин не возвращает юзера — подтягиваем сами
            return true
        } catch (e) {
            error.value = extractError(e, 'Не удалось войти. Проверьте телефон и пароль.')
            return false
        } finally {
            loading.value = false
        }
    }

    async function register(payload) {
        loading.value = true
        error.value = null
        try {
            const { data } = await authApi.register(payload)
            setSession(data)     // бэк сразу отдал токены — авто-логин
            setUser(data.user)   // и юзера — отдельный запрос не нужен
            return true
        } catch (e) {
            error.value = extractError(e, 'Не удалось зарегистрироваться.')
            return false
        } finally {
            loading.value = false
        }
    }

    async function loadUser() {
        if (!accessToken.value) return
        const id = user.value?.id ?? decodeJwtPayload(accessToken.value)?.user_id
        if (!id) return
        try {
            const { data } = await usersApi.get(id)
            setUser(data)
        } catch (e) {
            if (e.response?.status === 404) clearAll() // юзер удалён — разлогиниваем
        }
    }

    async function updateProfile(patch) {
        if (!user.value?.id) throw new Error('Нет данных о пользователе')
        const { data } = await usersApi.update(user.value.id, patch)
        setUser(data?.user ?? data) // если бэк вернёт { user: {...} } вместо юзера напрямую
        return user.value
    }

    function logout() {
        clearAll()
    }

    return {
        accessToken, sessionId, user, loading, error, isAuthenticated, myUserId,
        login, register, loadUser, updateProfile, logout,
    }
})
