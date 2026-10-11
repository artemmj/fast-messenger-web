<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ChatList from '@/components/chat/ChatList.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

function logout() {
    auth.logout()
    router.push({ name: 'login' })
}
</script>

<template>
    <div class="messenger">
        <aside class="sidebar">
            <div class="sidebar-header">
                <router-link class="logo" :to="{ name: 'chats' }">Быстромессенджер (БЕТА)</router-link>
                <div class="header-actions">
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
