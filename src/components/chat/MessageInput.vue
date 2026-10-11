<!-- src/components/chat/MessageInput.vue -->
<script setup>
import { ref } from 'vue'

const emit = defineEmits(['send'])
const text = ref('')

function submit() {
  const t = text.value.trim()
  if (!t) return
  emit('send', t)
  text.value = ''
}
</script>

<template>
  <form class="message-input" @submit.prevent="submit">
    <input v-model="text" placeholder="Написать сообщение…" />
    <button type="submit">➤</button>
  </form>
</template>
