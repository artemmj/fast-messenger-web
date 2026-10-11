<script setup>
import { watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useChatsStore } from '@/stores/chats'
import { connect as connectSocket, disconnect as disconnectSocket } from '@/services/chat-socket'
import ChatList from '@/components/chat/ChatList.vue'

const auth = useAuthStore()
const chatsStore = useChatsStore()
const router = useRouter()
const route = useRoute()

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}

// Единая точка правды: какой чат сейчас открыт (нужно WS-обработчикам)
watch(
  () => route.name,
  () => {
    if (route.name === 'chat') chatsStore.setActiveChat(route.params.id)
    else chatsStore.clearActiveChat()
  },
  { immediate: true }
)

onMounted(connectSocket)
onUnmounted(disconnectSocket)
</script>

<template>
  <div class="messenger">
    <aside class="sidebar">
      <div class="sidebar-header">
        <router-link class="logo" :to="{ name: 'chats' }">Мессенджер</router-link>
        <div class="header-actions">
          <span
            class="ws-dot"
            :class="{ on: chatsStore.wsConnected }"
            :title="chatsStore.wsConnected ? 'Соединение активно' : 'Переподключение…'"
          ></span>
          <router-link class="icon-btn" :to="{ name: 'profile' }" title="Профиль">👤</router-link>
          <button class="icon-btn" title="Выйти" @click="logout">⎋</button>
        </div>
      </div>
      <ChatList />
    </aside>
    <main class="chat-area">
      <router-view :key="route.path" />
    </main>
  </div>
</template>