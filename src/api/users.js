import http from './http'

export const usersApi = {
    get: (id) => http.get(`/users/${id}`),
    update: (id, patch) => http.patch(`/users/${id}`, patch),
}
