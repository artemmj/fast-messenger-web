import { ref } from 'vue'
import { defineStore } from 'pinia'
import { chatsApi } from '@/api/chats'
import { useAuthStore } from './auth'
import { formatPhone } from '@/utils/format'

function plural(n, forms) {
    const n10 = n % 10, n100 = n % 100
    if (n10 === 1 && n100 !== 11) return forms[0]
    if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return forms[1]
    return forms[2]
}

export const useChatsStore = defineStore('chats', () => {
    const auth = useAuthStore()

    const chats = ref([])
    const loading = ref(false)
    const error = ref(null)
    const loaded = ref(false)

    // force — игнорировать "уже загружено" (пригодится для обновления)
    async function fetchChats(force = false) {
        if (loaded.value && !force) return
            loading.value = true
            error.value = null
        try {
            const { data } = await chatsApi.list()
            chats.value = Array.isArray(data) ? data : []
            loaded.value = true
        } catch {
            error.value = 'Не удалось загрузить чаты'
        } finally {
            loading.value = false
        }
    }

    function chatById(id) {
        return chats.value.find((c) => c.id === id)
    }

    // Заголовок: группа — name, личный — телефон собеседника
    function chatTitle(chat) {
        if (chat.type === 'group') return chat.name || 'Групповой чат'
        const other = chat.members?.find((m) => m.user_id !== auth.myUserId)
        return other?.user?.phone ? formatPhone(other.user.phone) : 'Личный чат'
    }

    // Подзаголовок: группа — сколько участников + админ ли я, личный — просто тип
    function chatSubtitle(chat) {
        if (chat.type === 'group') {
            const n = chat.members?.length ?? 0
            const me = chat.members?.find((m) => m.user_id === auth.myUserId)
            const base = `${n} ${plural(n, ['участник', 'участника', 'участников'])}`
            return me?.is_admin ? `${base} · вы админ` : base
        }
        return 'Личный чат'
    }

    return { chats, loading, error, loaded, fetchChats, chatById, chatTitle, chatSubtitle }
})
