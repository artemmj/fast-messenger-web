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
        </span>
        <span>{{ chatsStore.chatSubtitle(chat) }}</span>
      </router-link>
    </li>
  </ul>
</template>
