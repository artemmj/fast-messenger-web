<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useChatsStore } from '@/stores/chats'
import { useMessagesStore } from '@/stores/messages'
import ChatList from '@/components/chat/ChatList.vue'

const auth = useAuthStore()
const chatsStore = useChatsStore()
const messagesStore = useMessagesStore()
const router = useRouter()
const route = useRoute()

let socket

function buildUrl(token) {
    const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')
    const wsBase = base.replace(/^http/, 'ws')
    const url = new URL(`${wsBase}/ws/chats?token=${encodeURIComponent(token)}`, window.location.href)
    if (url.protocol === 'http:') url.protocol = 'ws:'
    if (url.protocol === 'https:') url.protocol = 'wss:'
    return url.toString()
}

function handleSocketMessage(event) {
    const { chat_id: chatId, data } = event
    if (typeof chatId !== 'string' || !data) return

    if (event.event === 'new_message') {
        if (data.id == null || data.user_id == null || data.text == null || data.created_at == null) {
            console.warn('Ignoring malformed new_message event', event)
            return
        }
        messagesStore.addMessage(chatId, data)
    } else if (event.event === 'chat_signal') {
        chatsStore.applySignal(chatId, data)
    }
}

function connectSocket() {
    if (!auth.accessToken) return

    socket = new WebSocket(buildUrl(auth.accessToken))
    socket.addEventListener('message', (messageEvent) => {
        let event
        try {
            event = JSON.parse(messageEvent.data)
        } catch (error) {
            console.error('Failed to parse WebSocket message', error)
            return
        }
        handleSocketMessage(event)
    })
    socket.addEventListener('error', (error) => {
        console.error('WebSocket connection error', error)
    })
}

function logout() {
    auth.logout()
    router.push({ name: 'login' })
}

onMounted(connectSocket)
onBeforeUnmount(() => socket?.close())
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
