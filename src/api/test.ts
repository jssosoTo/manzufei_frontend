import api from './index'

export function getTestRecords(patientId: string) {
  return api.get(`/patients/${patientId}/records`)
}

export function getTestRecord(patientId: string, recordId: number) {
  return api.get(`/patients/${patientId}/records/${recordId}`)
}

export function createTestRecord(patientId: string, data: any) {
  return api.post(`/patients/${patientId}/records`, data)
}

export function updateTestRecord(patientId: string, recordId: number, data: any) {
  return api.put(`/patients/${patientId}/records/${recordId}`, data)
}

export function deleteTestRecord(patientId: string, recordId: number) {
  return api.delete(`/patients/${patientId}/records/${recordId}`)
}
