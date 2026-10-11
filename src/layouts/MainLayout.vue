<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMessagesStore } from '@/stores/messages'
import ChatList from '@/components/chat/ChatList.vue'

const auth = useAuthStore()
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

function handleChatSignal(event) {
    if (event?.event !== 'chat_signal') return

    const { chat_id: chatId, data } = event
    const { last_message_text: text, last_message_time: createdAt, sender_id: userId } = data ?? {}
    if (
        typeof chatId !== 'string' ||
        typeof text !== 'string' ||
        typeof createdAt !== 'string' ||
        Number.isNaN(Date.parse(createdAt)) ||
        typeof userId !== 'string'
    ) {
        console.warn('Ignoring malformed chat_signal event', event)
        return
    }

    messagesStore.addMessage(chatId, {
        id: `signal:${chatId}:${userId}:${createdAt}:${text}`,
        user_id: userId,
        text,
        created_at: createdAt,
    })
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
        handleChatSignal(event)
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
