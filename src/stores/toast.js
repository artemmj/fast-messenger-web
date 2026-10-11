import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

  function push(text, type = 'error') {
    const id = `${Date.now()}-${Math.random()}`
    toasts.value.push({ id, text, type })
    setTimeout(() => dismiss(id), 4000)
  }

  function dismiss(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { toasts, push, dismiss }
})
