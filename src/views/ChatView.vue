<!-- src/views/ChatView.vue (полностью, замени весь файл) -->
<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChatsStore } from '@/stores/chats'
import { useMessagesStore } from '@/stores/messages'
import { useAuthStore } from '@/stores/auth'
import { formatPhone } from '@/utils/format'
import MessageInput from '@/components/chat/MessageInput.vue'
import { useEscape } from '@/composables/useEscape'

const route = useRoute()
const router = useRouter()

// Обычная строка. Перемонтирование гарантирует :key="route.path" в MainLayout,
// так что при смене чата этот файл создается заново с новым id.
const chatId = route.params.id

const chatsStore = useChatsStore()
const messagesStore = useMessagesStore()
const auth = useAuthStore()

chatsStore.fetchChats()

const chat = computed(() => chatsStore.chatById(chatId))
const notFound = computed(() => chatsStore.loaded && !chat.value)

const chatState = computed(() => messagesStore.state[chatId])
const messages = computed(() => chatState.value?.messages ?? [])
const loadingMessages = computed(() => chatState.value?.loading ?? false)
const messagesError = computed(() => chatState.value?.error ?? null)

const messagesEl = ref(null)

function isMine(m) {
  return m.user_id === auth.myUserId
}

function senderName(m) {
  if (chat.value?.type !== 'group' || isMine(m)) return null
  const member = chat.value.members?.find((x) => x.user_id === m.user_id)
  return member?.user?.phone ? formatPhone(member.user.phone) : 'Участник'
}

function showAuthor(m, idx) {
  if (!senderName(m)) return false
  const prev = messages.value[idx - 1]
  return !prev || prev.user_id !== m.user_id
}

function fmtTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

async function scrollToBottom() {
  await nextTick()
  if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
}

async function retry(m) {
  if (m.status !== 'failed') return
  const promise = messagesStore.retryMessage(chatId, m, auth.myUserId)
  scrollToBottom()
  await promise
}

onMounted(async () => {
  await messagesStore.fetchMessages(chatId, true)
  scrollToBottom()
})

async function send(text) {
  // temp-пузырь добавляется синхронно — скроллим сразу, не ждём сервер
  const promise = messagesStore.sendMessage(chatId, text, auth.myUserId)
  scrollToBottom()
  await promise
}

function close() {
  router.push({ name: 'chats' })
}

useEscape(close)
</script>

<template>
  <div class="chat">
    <div v-if="!chat && chatsStore.loading" class="placeholder">
      <p>Загрузка чата…</p>
    </div>

    <div v-else-if="notFound" class="placeholder">
      <div class="placeholder-icon">🤷</div>
      <p>Чат не найден</p>
    </div>

    <template v-else>
      <header v-if="chat" class="chat-header">
        <span class="chat-icon">{{ chat.type === 'group' ? '👥' : '👤' }}</span>
        <div class="titles">
          <h2>{{ chatsStore.chatTitle(chat) }}</h2>
          <span class="sub">{{ chatsStore.chatSubtitle(chat) }}</span>
        </div>
        <button class="icon-btn" title="Закрыть (Esc)" aria-label="Закрыть" @click="close">✕</button>
      </header>

      <div v-if="loadingMessages && !messages.length" class="placeholder">
        <p>Загрузка сообщений…</p>
      </div>

      <div v-else-if="messagesError" class="placeholder">
        <p>{{ messagesError }}</p>
        <button class="retry" @click="retry">Повторить</button>
      </div>

      <div v-else-if="!messages.length" class="placeholder">
        <div class="placeholder-icon">💬</div>
        <p>Сообщений пока нет. Напишите первым!</p>
      </div>

      <div v-else ref="messagesEl" class="messages">
        <div
          v-for="(m, idx) in messages"
          :key="m.id"
          class="message"
          :class="{ mine: isMine(m) }"
        >
          <span v-if="showAuthor(m, idx)" class="msg-author">{{ senderName(m) }}</span>
          <div class="bubble">
            <span class="msg-text">{{ m.text }}</span>
            <span class="msg-time">{{ fmtTime(m.created_at) }}</span>
          </div>
        </div>
      </div>

      <MessageInput @send="send" />
    </template>
  </div>
</template>