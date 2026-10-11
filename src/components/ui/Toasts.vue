<script setup>
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
</script>

<template>
  <div class="toasts">
    <TransitionGroup name="toast">
      <div
        v-for="t in toast.toasts"
        :key="t.id"
        class="toast"
        :class="t.type"
        @click="toast.dismiss(t.id)"
      >
        {{ t.text }}
      </div>
    </TransitionGroup>
  </div>
</template>
