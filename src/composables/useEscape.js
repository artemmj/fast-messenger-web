import { onMounted, onUnmounted } from 'vue'

export function useEscape(handler) {
    function onKeydown(e) {
        if (e.key === 'Escape') {
            e.preventDefault()
            handler()
        }
    }
    onMounted(() => window.addEventListener('keydown', onKeydown))
    onUnmounted(() => window.removeEventListener('keydown', onKeydown))
}
