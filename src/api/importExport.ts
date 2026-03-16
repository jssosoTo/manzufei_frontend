import api from './index'

export function downloadTemplate() {
  return api.get('/import/template', { responseType: 'blob' })
}

export function previewImport(file: File, type_: string) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type_)
  return api.post('/import/preview', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function importPatients(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/import/patients', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function importTestData(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/import/test-data', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function importComprehensiveData(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/import/comprehensive', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function exportPatients() {
  return api.get('/export/patients', { responseType: 'blob' })
}

export function exportTestData(params?: { patient_id?: string; test_round?: number }) {
  return api.get('/export/test-data', { params, responseType: 'blob' })
}

export function exportReport() {
  return api.get('/export/report', { responseType: 'blob' })
}
