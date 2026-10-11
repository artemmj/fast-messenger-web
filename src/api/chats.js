import http from './http'

export const chatsApi = {
    list: () => http.get('/chats'),
    getMessages: (chatId, { limit = 50, offset = 0 } = {}) =>
        http.get(`/chats/${chatId}/get_messages`, { params: { limit, offset } }),
    sendMessage: (chatId, payload) => http.post(`/chats/${chatId}/send_message`, payload),
}
