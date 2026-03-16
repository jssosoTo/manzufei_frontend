export function calcBMI(heightCM: number, weightKG: number): number {
  if (heightCM <= 0 || weightKG <= 0) return 0
  const heightM = heightCM / 100
  return Math.round((weightKG / (heightM * heightM)) * 100) / 100
}

export function checkAbnormal(
  value: number,
  min: number | null,
  max: number | null
): { isAbnormal: boolean; direction: number | null } {
  if (min === null && max === null) {
    return { isAbnormal: false, direction: null }
  }
  if (min !== null && value < min) {
    return { isAbnormal: true, direction: -1 }
  }
  if (max !== null && value > max) {
    return { isAbnormal: true, direction: 1 }
  }
  return { isAbnormal: false, direction: null }
}
