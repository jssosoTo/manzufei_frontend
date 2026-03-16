import api from './index'

export function getDashboard() {
  return api.get('/dashboard')
}

export function getComparison(patientId: string) {
  return api.get(`/analysis/comparison/${patientId}`)
}

export function getTrend(patientId: string) {
  return api.get(`/analysis/trend/${patientId}`)
}

export function getStatistics() {
  return api.get('/analysis/statistics')
}

export function getDistribution(params: { indicator_code: string; test_round?: number }) {
  return api.get('/analysis/distribution', { params })
}
