import api from './index'

export function login(data: { username: string; password: string }) {
  return api.post('/auth/login', data)
}

export function logout() {
  return api.post('/auth/logout')
}

export function getProfile() {
  return api.get('/auth/profile')
}
