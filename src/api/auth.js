import http from './http'

export const authApi = {
    login: (payload) => http.post('/auth/login', payload),
    register: (payload) => http.post('/users/register', payload),
    // logout: () => http.post('/auth/logout'), // когда появится на бэке
}
