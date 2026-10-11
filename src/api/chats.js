import http from './http'

export const chatsApi = {
    list: () => http.get('/chats'),
    getMessages: (chatId) => http.get(`/chats/${chatId}/get_messages`),
    sendMessage: (chatId, payload) => http.post(`/chats/${chatId}/send_message`, payload),
}
