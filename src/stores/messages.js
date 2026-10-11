import { ref } from 'vue'
import { defineStore } from 'pinia'
import { chatsApi } from '@/api/chats'

export const useMessagesStore = defineStore('messages', () => {
    // chatId -> { messages, loading, error, loaded }
    const state = ref({})

    function ensure(chatId) {
        if (!state.value[chatId]) {
            state.value[chatId] = { messages: [], loading: false, error: null, loaded: false }
        }
        return state.value[chatId]
    }

    async function fetchMessages(chatId, force = false) {
        const s = ensure(chatId)
        if (s.loaded && !force) return
        s.loading = true
        s.error = null
        try {
            const { data } = await chatsApi.getMessages(chatId)
            const list = Array.isArray(data) ? data : []
            for (const message of s.messages) {
                if (
                    (String(message.id).startsWith('signal:') || message.status === 'pending' || message.status === 'failed') &&
                    !list.some((loaded) =>
                        loaded.id === message.id ||
                        (
                            loaded.user_id === message.user_id &&
                            loaded.text === message.text &&
                            Date.parse(loaded.created_at) === Date.parse(message.created_at)
                        )
                    )
                ) {
                    list.push(message)
                }
            }
            list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
            s.messages = list
            s.loaded = true
        } catch {
            s.error = 'Не удалось загрузить сообщения'
        } finally {
            s.loading = false
        }
    }

    // Дедупликация по id — задел под WebSocket: пришедшее по сокету
    // не продублирует то, что уже добавлено оптимистично
    function addMessage(chatId, message) {
        const s = ensure(chatId)
        if (s.messages.some((m) => m.id === message.id)) return
        s.messages.push(message)
        s.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    }

    // Оптимистичная отправка: временный пузырь -> подтверждение с бэка
    async function sendMessage(chatId, text, authorId) {
        const s = ensure(chatId)
        const temp = {
            id: `local-${Date.now()}`,
            user_id: authorId,
            text,
            created_at: new Date().toISOString(),
            status: 'pending',   // отправляется
        }
        s.messages.push(temp)

        try {
            const { data } = await chatsApi.sendMessage(chatId, { text })
            const tempIdx = s.messages.findIndex((m) => m.id === temp.id)
            const serverIdx = s.messages.findIndex((m) => m.id === data.id)
            if (serverIdx !== -1) {
                s.messages[serverIdx] = { ...s.messages[serverIdx], ...data, status: 'sent' }
                if (tempIdx !== -1) s.messages.splice(tempIdx, 1)
            } else if (tempIdx !== -1) {
                s.messages[tempIdx] = { ...data, status: 'sent' }
            }
            s.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
            return { ok: true }
        } catch {
            const m = s.messages.find((x) => x.id === temp.id)
            if (m) m.status = 'failed'  // не отправлено
            return { ok: false }
        }
    }

    // Повтор неудачной: убираем failed-пузырь и отправляем заново
    async function retryMessage(chatId, msg, authorId) {
        const s = ensure(chatId)
        const idx = s.messages.findIndex((m) => m.id === msg.id)
        if (idx !== -1) s.messages.splice(idx, 1)
        return sendMessage(chatId, msg.text, authorId)
    }

    return { state, fetchMessages, addMessage, sendMessage, retryMessage }
})