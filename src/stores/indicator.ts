import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getIndicators } from '../api/indicator'

interface IndicatorDef {
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
}

export const useIndicatorStore = defineStore('indicator', () => {
  const indicators = ref<IndicatorDef[]>([])
  const loaded = ref(false)

  async function fetchIndicators() {
    if (loaded.value) return
    const res: any = await getIndicators()
    indicators.value = res || []
    loaded.value = true
  }

  const getByCategory = computed(() => {
    return (category: string) => indicators.value.filter(i => i.category === category)
  })

  const getByCode = computed(() => {
    return (code: string) => indicators.value.find(i => i.indicator_code === code)
  })

  const getById = computed(() => {
    return (id: number) => indicators.value.find(i => i.indicator_id === id)
  })

  const bodyShape = computed(() => indicators.value.filter(i => i.category === 'BODY_SHAPE'))
  const bodyFunction = computed(() => indicators.value.filter(i => i.category === 'BODY_FUNCTION'))
  const bodyQuality = computed(() => indicators.value.filter(i => i.category === 'BODY_QUALITY'))

  return { indicators, loaded, fetchIndicators, getByCategory, getByCode, getById, bodyShape, bodyFunction, bodyQuality }
})
