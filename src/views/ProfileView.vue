<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { formatPhone } from '@/utils/format'

const auth = useAuthStore()

const email = ref('')
const newPassword = ref('')
const newPassword2 = ref('')
const saving = ref(false)
const saveError = ref(null)
const saved = ref(false)

const createdAt = computed(() =>
    auth.user ? new Date(auth.user.created_at).toLocaleString('ru-RU') : ''
)
const updatedAt = computed(() =>
    auth.user ? new Date(auth.user.updated_at).toLocaleString('ru-RU') : ''
)

onMounted(async () => {
    if (!auth.user) await auth.loadUser()
    email.value = auth.user?.email ?? ''
})

async function save() {
    saveError.value = null
    saved.value = false

    if (newPassword.value && newPassword.value !== newPassword2.value) {
        saveError.value = 'Пароли не совпадают'
        return
    }

    // Отправляем ТОЛЬКО изменённые непустые поля — PATCH-семантика
    const patch = {}
    if (email.value.trim() && email.value.trim() !== (auth.user?.email ?? '')) {
        patch.email = email.value.trim()
    }
    if (newPassword.value) patch.password = newPassword.value

    if (!Object.keys(patch).length) {
        saved.value = true
        return
    }

    saving.value = true
    try {
        await auth.updateProfile(patch)
        saved.value = true
        newPassword.value = ''
        newPassword2.value = ''
    } catch (e) {
        const d = e.response?.data?.detail
        saveError.value = typeof d === 'string'
        ? d
        : Array.isArray(d) ? d.map((x) => x.msg).join('; ') : 'Не удалось сохранить изменения'
    } finally {
        saving.value = false
    }
}
</script>

<template>
    <div class="profile">
        <div v-if="auth.user" class="profile-card">
        <h2>Профиль</h2>

        <dl class="info">
            <div><dt>Телефон</dt><dd>{{ formatPhone(auth.user.phone) }}</dd></div>
            <div><dt>Email</dt><dd>{{ auth.user.email || '—' }}</dd></div>
            <div><dt>ID</dt><dd class="mono">{{ auth.user.id }}</dd></div>
            <div>
                <dt>Статус</dt>
                <dd>
                    <span class="badge" :class="auth.user.is_active ? 'ok' : 'bad'">
                    {{ auth.user.is_active ? 'активен' : 'неактивен' }}
                    </span>
                    <span v-if="auth.user.is_banned" class="badge bad">заблокирован</span>
                    <span v-if="auth.user.is_verified" class="badge ok">верифицирован</span>
                </dd>
            </div>
            <div><dt>Создан</dt><dd>{{ createdAt }}</dd></div>
            <div><dt>Обновлён</dt><dd>{{ updatedAt }}</dd></div>
        </dl>

        <form class="edit" @submit.prevent="save">
            <h3>Редактирование</h3>

            <label>
                Email
                <input v-model="email" type="email" placeholder="user@example.com" />
            </label>

            <label>
                Новый пароль
                <input v-model="newPassword" type="password" placeholder="Оставьте пустым, чтобы не менять" autocomplete="new-password" />
            </label>

            <label>
                Повторите пароль
                <input v-model="newPassword2" type="password" :disabled="!newPassword" autocomplete="new-password" />
            </label>

            <p v-if="saveError" class="error">{{ saveError }}</p>
            <p v-if="saved" class="success">Сохранено ✓</p>

            <button type="submit" :disabled="saving">
            {{ saving ? 'Сохраняем…' : 'Сохранить' }}
            </button>
        </form>
        </div>

        <div v-else class="placeholder">Загрузка профиля…</div>
    </div>
</template>