<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MessageInput from '@/components/chat/MessageInput.vue'
import { useEscape } from '@/composables/useEscape'

const route = useRoute()
const router = useRouter()
const chatId = route.params.id

const messages = ref([
  { id: 1, mine: false, text: 'Привет!' },
  { id: 2, mine: true, text: 'Привет-привет 👋' },
])

function send(text) {
  messages.value.push({ id: Date.now(), mine: true, text })
  // TODO: POST /chats/{chatId}/messages
}

useEscape(() => router.push({ name: 'chats' }))
</script>

<template>
  <div class="chat">
    <div class="messages">
      <div
        v-for="m in messages"
        :key="m.id"
        class="bubble"
        :class="{ mine: m.mine }"
      >
        {{ m.text }}
      </div>
    </div>
    <MessageInput @send="send" />
  </div>
</template>