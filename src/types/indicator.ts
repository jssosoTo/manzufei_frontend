export interface IndicatorDef {
  indicator_id: number
  indicator_code: string
  indicator_name: string
  indicator_name_en: string
  category: string
  data_type: string
  unit: string
  precision_digits: number
  normal_range_min: number | null
  normal_range_max: number | null
  normal_range_desc: string
  display_order: number
  is_active: number
}
