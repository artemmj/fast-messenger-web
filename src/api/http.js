// src/api/http.js
import axios from 'axios'

export const TOKEN_KEY = 'access_token'
export const SESSION_KEY = 'session_id'
export const USER_KEY = 'user'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
})

// Каждому запросу цепляем токен
http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    // Если понадобится стандарт — заменить на: `Bearer ${token}`
    config.headers.Authorization = token
  }
  return config
})

// Токен протух / сессия умерла -> разлогин
http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(SESSION_KEY)
      if (location.pathname !== '/login') location.assign('/login')
    }
    return Promise.reject(err)
  }
)

export default http
