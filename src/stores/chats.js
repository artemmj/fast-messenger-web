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

  const activeChatId = ref(null)  // какой чат сейчас открыт (для WS)
  const unread = ref({})          // chatId -> количество непрочитанных
  const wsConnected = ref(false)

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

  function unreadCount(id) {
    return unread.value[id] || 0
  }

  function setActiveChat(id) {
    activeChatId.value = id
    if (id) unread.value[id] = 0 // открыл чат — прочитал
  }

  function clearActiveChat() {
    activeChatId.value = null
  }

  // Обработка chat_signal: превью, наверх списка, непрочитанные
  function applySignal(chatId, data) {
    const idx = chats.value.findIndex((c) => c.id === chatId)
    if (idx === -1) {
      // сигнал о чате, которого нет в списке (новый чат) — перегружаем список
      fetchChats(true)
      return
    }
    const chat = chats.value[idx]
    if (data?.last_message_text != null) chat.last_message_text = data.last_message_text

    if (idx > 0) {
      chats.value.splice(idx, 1)
      chats.value.unshift(chat) // поднимаем наверх
    }

    const isOwnMessage =
      data?.sender_id != null &&
      auth.myUserId != null &&
      String(data.sender_id) === String(auth.myUserId)
    if (activeChatId.value !== chatId && !isOwnMessage) {
      unread.value[chatId] = (unread.value[chatId] || 0) + 1
    }
  }

  function chatTitle(chat) {
    if (chat.type === 'group') return chat.name || 'Групповой чат'
    const other = chat.members?.find((m) => m.user_id !== auth.myUserId)
    return other?.user?.phone ? formatPhone(other.user.phone) : 'Личный чат'
  }

  function chatSubtitle(chat) {
    if (chat.type === 'group') {
      const n = chat.members?.length ?? 0
      const me = chat.members?.find((m) => m.user_id === auth.myUserId)
      const base = `${n} ${plural(n, ['участник', 'участника', 'участников'])}`
      return me?.is_admin ? `${base} · вы админ` : base
    }
    return 'Личный чат'
  }

  return {
    chats, loading, error, loaded,
    activeChatId, unread, wsConnected,
    fetchChats, chatById, unreadCount, setActiveChat, clearActiveChat, applySignal,
    chatTitle, chatSubtitle,
  }
})