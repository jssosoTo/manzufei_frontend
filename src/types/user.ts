export interface User {
  id: number
  username: string
  real_name: string
  role: number
  role_text?: string
  department: string
  status: number
  status_text?: string
  last_login: string
  phone?: string
  email?: string
  create_time?: string
}

export interface CreateUserRequest {
  username: string
  password?: string
  real_name: string
  role: number
  department?: string
  phone?: string
  email?: string
  status?: number
}

export interface UpdateUserRequest {
  real_name?: string
  role?: number
  department?: string
  phone?: string
  email?: string
  status?: number
  password?: string
}

export interface UserFilter {
  username?: string
  real_name?: string
  role?: number
  department?: string
  status?: number
  page?: number
  limit?: number
}
