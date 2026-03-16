export interface TestRecord {
  record_id: number
  patient_id: string
  patient_name: string
  test_date: string
  test_type: number
  test_round: number
  mmrc_grade: number | null
  mmrc_grade_text: string
  is_taking_bp_meds: number | null
  tester_name: string
  device_id: string
  notes: string
  created_at: string
  indicators?: IndicatorValue[]
}

export interface IndicatorValue {
  test_id: number
  indicator_id: number
  indicator_code: string
  indicator_name: string
  category: string
  value_numeric: number | null
  value_text: string
  unit: string
  is_abnormal: number | null
  abnormal_direction: number | null
  normal_range_desc: string
}
