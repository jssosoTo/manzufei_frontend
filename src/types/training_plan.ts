export interface TrainingPlan {
  id: string
  patient_id: string
  name: string
  age_range: string
  training_cycle: string
  training_type: string
  training_intensity: string
  reason: string
  start_date: string
  end_date: string
  status: 'active' | 'completed' | 'archived' | 'pending' | 'stopped'
  weekly_plans: WeeklyPlan[]
  created_at: string
  updated_at: string
  preferences: PlanPreferences
}

export interface PlanPreferences {
  use_equipment: boolean
  has_ball_games: boolean
  exercise_type: string
  location: string
}

export interface WeeklyPlan {
  week_number: number
  goal: string
  daily_plans: DailyPlan[]
}

export interface DailyPlan {
  day_of_week: string // e.g., "Monday", "Tuesday" or "周一", "周二"
  intensity: string // e.g., "Low", "Medium", "High"
  duration_minutes: number
  exercises: Exercise[]
  notes: string
}

export interface Exercise {
  name: string
  equipment: string
  sets: number
  reps: string // string because it might be "10-12" or "to failure"
  rest_seconds: number
  description?: string
  notes?: string
}
