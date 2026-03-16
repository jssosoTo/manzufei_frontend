export interface Patient {
  patient_id: string
  name: string
  gender: number
  gender_text: string
  birth_date: string
  age: number | null
  phone: string
  address: string
  emergency_contact: string
  emergency_phone: string
  medical_history: string
  allergy_info: string
  status: number
  last_test_date: string
  created_at: string
}
