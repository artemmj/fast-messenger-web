<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Toasts from '@/components/ui/Toasts.vue'

const auth = useAuthStore()

onMounted(() => {
  if (auth.isAuthenticated) auth.loadUser()
})
</script>

<template>
  <router-view />
  <Toasts />
</template>
