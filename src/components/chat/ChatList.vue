<script setup>
import { onMounted } from 'vue'
import { useChatsStore } from '@/stores/chats'

const chatsStore = useChatsStore()

onMounted(() => chatsStore.fetchChats())
</script>

<template>
  <div v-if="chatsStore.loading && !chatsStore.chats.length" class="chat-list-hint">
    Загрузка чатов…
  </div>

  <div v-else-if="chatsStore.error" class="chat-list-hint">
    {{ chatsStore.error }}
    <button class="retry" @click="chatsStore.fetchChats(true)">Повторить</button>
  </div>

  <div v-else-if="!chatsStore.chats.length" class="chat-list-hint">
    Чатов пока нет
  </div>

  <ul v-else class="chat-list">
    <li v-for="chat in chatsStore.chats" :key="chat.id">
      <router-link :to="{ name: 'chat', params: { id: chat.id } }">
        <span class="chat-row-top">
          <span class="chat-icon">{{ chat.type === 'group' ? '👥' : '👤' }}</span>
          <strong>{{ chatsStore.chatTitle(chat) }}</strong>
          <span v-if="chatsStore.unreadCount(chat.id)" class="unread-badge">
            {{ chatsStore.unreadCount(chat.id) > 99 ? '99+' : chatsStore.unreadCount(chat.id) }}
          </span>
        </span>
        <span class="chat-last">
          {{ chat.last_message_text || chatsStore.chatSubtitle(chat) }}
        </span>
      </router-link>
    </li>
  </ul>
</template>
