<!-- src/components/chat/ChatList.vue -->
<script setup>
import { ref } from 'vue'

// Заглушка. Позже заменим на GET /chats из api-слоя
const chats = ref([
  { id: 1, title: 'Общий чат', last: 'Привет всем!' },
  { id: 2, title: 'Иван', last: 'Ты на созвоне завтра?' },
  { id: 3, title: 'Проект X', last: 'Скинул макеты' },
])
</script>

<template>
  <ul class="chat-list">
    <li v-for="chat in chats" :key="chat.id">
      <router-link :to="{ name: 'chat', params: { id: chat.id } }">
        <strong>{{ chat.title }}</strong>
        <span>{{ chat.last }}</span>
      </router-link>
    </li>
  </ul>
</template>
