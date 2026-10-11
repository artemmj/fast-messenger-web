import { useAuthStore } from '@/stores/auth'
import { useChatsStore } from '@/stores/chats'
import { useMessagesStore } from '@/stores/messages'
import { useToastStore } from '@/stores/toast'

let ws = null
let reconnectTimer = null
let attempts = 0
let stopped = true

const MAX_DELAY = 30000

// http://host -> ws://host; если base относительный (через vite-прокси) — оставляем как есть
function buildUrl(token) {
  const base = import.meta.env.VITE_API_BASE_URL || ''
  const wsBase = base.replace(/^http/, 'ws')
  return `${wsBase}/ws/chats?token=${encodeURIComponent(token)}`
}

function scheduleReconnect() {
  if (stopped) return
  attempts += 1
  const delay = Math.min(1000 * 2 ** attempts, MAX_DELAY) // 2s, 4s, 8s… максимум 30s
  reconnectTimer = setTimeout(connect, delay)
}

export function connect() {
  const auth = useAuthStore()
  if (!auth.accessToken) return
  stopped = false

  // уже подключены или подключаемся
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return

  const chats = useChatsStore()
  try {
    ws = new WebSocket(buildUrl(auth.accessToken))
  } catch (e) {
    console.error('WS: не удалось создать соединение', e)
    scheduleReconnect()
    return
  }

  ws.onopen = () => {
    attempts = 0
    chats.wsConnected = true
  }

  ws.onmessage = (event) => {
    let msg
    try { msg = JSON.parse(event.data) } catch { return }
    handleMessage(msg)
  }

  ws.onclose = () => {
    chats.wsConnected = false
    scheduleReconnect()
  }
  // onerror не нужен: следом всегда вызывается onclose, там реконнект
}

function handleMessage(msg) {
  const chats = useChatsStore()
  const messages = useMessagesStore()
  const toast = useToastStore()

  switch (msg.event) {
    case 'new_message':
      // кладём всегда; если чат не открыт — просто лежит в сторе до открытия.
      // Дедуп по id защищает от дубля собственного сообщения (REST уже добавил его)
      messages.addMessage(msg.chat_id, msg.data)
      break

    case 'chat_signal':
      chats.applySignal(msg.chat_id, msg.data)
      break

    case 'error':
      toast.push(`Ошибка: ${msg.detail}`)
      break
  }
}

export function disconnect() {
  stopped = true
  clearTimeout(reconnectTimer)
  reconnectTimer = null
  if (ws) {
    ws.onclose = null // чтобы close не запланировал реконнект
    ws.close()
    ws = null
  }
}