<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

onMounted(() => {
  // после перезагрузки: юзер либо из localStorage, либо подтянем по user_id из JWT
  if (auth.isAuthenticated) auth.loadUser()
})
</script>

<template>
  <router-view />
</template>
