import api from './index'

export function getPatientList(params: {
  name?: string
  gender?: number
  status?: number
  page?: number
  page_size?: number
}) {
  return api.get('/patients', { params })
}

export function getPatient(patientId: string) {
  return api.get(`/patients/${patientId}`)
}

export function createPatient(data: any) {
  return api.post('/patients', data)
}

export function updatePatient(patientId: string, data: any) {
  return api.put(`/patients/${patientId}`, data)
}

export function deletePatient(patientId: string) {
  return api.delete(`/patients/${patientId}`)
}

export function batchDeletePatients(patientIds: string[]) {
  return api.delete('/patients/batch', { data: { patient_ids: patientIds } })
}

export function getPatientOverview() {
  return api.get('/patients/overview')
}
