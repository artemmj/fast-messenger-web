export function formatPhone(input) {
    const d = String(input ?? '').replace(/\D/g, '')
    if (d.length === 11 && (d[0] === '7' || d[0] === '8')) {
        return `+7(${d.slice(1, 4)})${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}`
    }
    return input
}
