import api from './index'

export interface TemplateParams {
  is_template?: boolean
  [key: string]: any
}

export const listTemplates = (params: TemplateParams) => {
  return api.get<any, any>('/training/templates', { params })
}

export const createTemplate = (data: any) => {
  return api.post<any, any>('/training/templates', data)
}

export const updateTemplate = (id: string, data: any) => {
  return api.put<any, any>(`/training/templates/${id}`, data)
}

export const deleteTemplate = (id: string) => {
  return api.delete<any, any>(`/training/templates/${id}`)
}

export const batchDeleteTemplates = (ids: number[]) => {
  return api.post<any, any>('/training/templates/batch-delete', { ids })
}

export const archivePlan = (planId: string) => {
  return api.post<any, any>(`/training/plans/${planId}/archive`)
}

export const importPlans = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post<any, any>('/training/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const downloadTemplate = () => {
  return api.get<any, any>('/training/import/template', {
    responseType: 'blob'
  })
}
