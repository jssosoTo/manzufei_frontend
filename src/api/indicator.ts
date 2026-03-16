import api from './index'

export function getIndicators(category?: string) {
  const params = category ? { category } : {}
  return api.get('/indicators', { params })
}
