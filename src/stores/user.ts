import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, getProfile as getProfileApi } from '../api/auth'

interface UserInfo {
  user_id: number
  username: string
  real_name: string
  role: number
  role_text: string
  department: string
}

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)

  async function login(username: string, password: string) {
    const res: any = await loginApi({ username, password })
    token.value = res.token
    userInfo.value = res.user_info
    localStorage.setItem('token', res.token)
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  async function fetchProfile() {
    const res: any = await getProfileApi()
    userInfo.value = res
  }

  return { token, userInfo, login, logout, fetchProfile }
})
