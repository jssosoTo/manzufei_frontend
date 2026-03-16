import api from './index'
import type { User, UserFilter, CreateUserRequest, UpdateUserRequest } from '../types/user'

export function getUsers(params: UserFilter) {
  return api.get('/users', { params })
}

export function getUser(id: number) {
  return api.get(`/users/${id}`)
}

export function createUser(data: CreateUserRequest) {
  return api.post('/users', data)
}

export function updateUser(id: number, data: UpdateUserRequest) {
  return api.put(`/users/${id}`, data)
}

export function deleteUser(id: number) {
  return api.delete(`/users/${id}`)
}

export function resetPassword(id: number) {
  return api.post(`/users/${id}/reset_password`)
}
