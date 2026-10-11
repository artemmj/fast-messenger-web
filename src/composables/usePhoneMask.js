// src/composables/usePhoneMask.js
import { ref } from 'vue'

export function usePhoneMask(initial = '') {
    const phone = ref(initial)

    function onInput(e) {
        let digits = (e.target.value || '').replace(/\D/g, '')
        if (!digits) { phone.value = ''; return }
        if (digits.startsWith('8')) digits = '7' + digits.slice(1)
        if (!digits.startsWith('7')) digits = '7' + digits
        digits = digits.slice(0, 11)

        const p = digits.slice(1)
        let out = '+7'
        if (p.length > 0) out += '(' + p.slice(0, 3)
        if (p.length >= 3) out += ')'
        if (p.length > 3) out += p.slice(3, 6)
        if (p.length > 6) out += '-' + p.slice(6, 8)
        if (p.length > 8) out += '-' + p.slice(8, 10)
        phone.value = out
    }

    return { phone, onInput }
}
