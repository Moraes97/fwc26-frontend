import axios from 'axios'
import Cookies from 'js-cookie'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = Cookies.get('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      Cookies.remove('token')
      Cookies.remove('refreshToken')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

export const auth = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  me: () => api.get('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
}

export const album = {
  get: () => api.get('/api/album'),
  update: (updates) => api.patch('/api/album/stickers', { updates }),
}

export const trades = {
  list: () => api.get('/api/trades'),
  matches: () => api.get('/api/matches'),
  accept: (id) => api.patch(`/api/trades/${id}/accept`),
  cancel: (id) => api.patch(`/api/trades/${id}/cancel`),
}

export const users = {
  ranking: () => api.get('/api/users/ranking'),
}
