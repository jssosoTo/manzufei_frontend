import api from './index'
import type { TrainingPlan } from '../types/training_plan'

export const getTrainingPlans = (patientId: string) => {
  return api.get<any, TrainingPlan[]>(`/patients/${patientId}/training-plans`)
}

export const getTrainingPlanDetail = (planId: string) => {
  return api.get<any, TrainingPlan>(`/training-plans/${planId}`)
}

export const generateTrainingPlan = (patientId: string) => {
  return api.post<any, TrainingPlan>(`/training-plans/generate`, { patient_id: patientId })
}

export const updatePlan = (planId: string, data: any) => {
  return api.put<any, TrainingPlan>(`/training-plans/${planId}`, data)
}

export const updatePlanStatus = (planId: string, status: string) => {
  return api.put<any, TrainingPlan>(`/training-plans/${planId}/status`, { status })
}

export const archivePlan = (planId: string) => {
  return api.post<any, void>(`/training/plans/${planId}/archive`)
}

export const getStandardPrescriptions = (name?: string) => {
  return api.get<any, TrainingPlan[]>(`/training-plans/prescriptions`, { params: { name } })
}

export const copyTemplateToPatient = (templateId: number, patientId: string) => {
  return api.post<any, TrainingPlan>(`/training-plans/copy-template`, { template_id: templateId, patient_id: patientId })
}

export const activatePlan = (planId: number) => {
  return api.post<any, void>(`/training-plans/${planId}/activate`)
}
