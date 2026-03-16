export function formatDate(date: string | Date): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().split('T')[0]
}

export function genderText(gender: number): string {
  return gender === 1 ? '男' : '女'
}

export function mmrcText(grade: number | null | undefined): string {
  if (grade === null || grade === undefined) return '未评估'
  const texts: Record<number, string> = {
    0: '0级(仅在费力时气短)',
    1: '1级(平地快走时气短)',
    2: '2级(平地行走需停下休息)',
    3: '3级(步行100米需停下休息)',
    4: '4级(不能离开家或穿脱衣时气短)',
  }
  return texts[grade] || '未知'
}

export function statusText(status: number): string {
  return status === 1 ? '正常' : '停用'
}
