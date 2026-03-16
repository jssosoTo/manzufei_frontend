<template>
  <div class="training-plan-detail" v-if="plan || isCreate">
    <div class="header">
      <div>
        <h2>{{ isCreate ? '新建处方模板' : (plan?.name || '训练计划详情') }}</h2>
        <p v-if="plan?.reason" class="reason-text">{{ plan.reason }}</p>
      </div>
      <div class="header-actions" v-if="!readonly">
        <el-button 
          v-if="isCreate"
          type="primary"
          @click="handleCreate"
        >
          创建
        </el-button>
        <el-button 
          v-else-if="!readonly" 
          type="success" 
          size="small" 
          @click="handleSave"
          style="margin-right: 12px;"
        >
          保存修改
        </el-button>
        <el-button 
          v-if="!isCreate && plan?.status === 'pending'" 
          type="primary" 
          size="small" 
          @click="handleUpdateStatus('active')"
        >
          确认计划
        </el-button>
        <el-button 
          v-if="!isCreate && plan?.status === 'active'" 
          type="danger" 
          size="small" 
          @click="handleUpdateStatus('stopped')"
        >
          终止计划
        </el-button>
      </div>
      <div class="header-actions" v-else>
         <el-tag v-if="plan" :type="getStatusType(plan.status)">{{ getStatusText(plan.status) }}</el-tag>
      </div>
    </div>

    <!-- Basic Info Section for Create Mode -->
    <div v-if="isCreate" class="basic-info-section">
      <h3>基本信息</h3>
      <el-form :model="createForm" label-width="100px" inline>
        <el-form-item label="名称">
          <el-input v-model="createForm.name" placeholder="请输入计划名称" />
        </el-form-item>
        <el-form-item label="年龄范围">
          <el-input v-model="createForm.age_range" placeholder="例如: 20-30" />
        </el-form-item>
        <el-form-item label="周期">
          <el-input v-model="createForm.cycle" placeholder="例如: 4周" />
        </el-form-item>
        <el-form-item label="类型">
          <el-input v-model="createForm.type" placeholder="例如: 减脂" />
        </el-form-item>
        <el-form-item label="强度">
          <el-input v-model="createForm.intensity" placeholder="例如: 中等" />
        </el-form-item>
      </el-form>
    </div>

    <div class="preferences-section">
      <h3>训练偏好</h3>
      <div v-if="!readonly || isCreate" class="preferences-form">
        <el-form :model="isCreate ? createForm.preferences : plan.preferences" label-width="100px" inline>
          <el-form-item label="使用器械">
            <el-switch v-model="(isCreate ? createForm.preferences : plan.preferences).use_equipment" />
          </el-form-item>
          <el-form-item label="球类运动">
            <el-switch v-model="(isCreate ? createForm.preferences : plan.preferences).has_ball_games" />
          </el-form-item>
          <el-form-item label="运动类型">
            <el-select v-model="(isCreate ? createForm.preferences : plan.preferences).exercise_type" placeholder="选择运动类型" style="width: 150px">
              <el-option label="有氧运动" value="aerobic" />
              <el-option label="力量训练" value="strength" />
              <el-option label="混合训练" value="mixed" />
            </el-select>
          </el-form-item>
          <el-form-item label="运动场所">
            <el-select v-model="(isCreate ? createForm.preferences : plan.preferences).location" placeholder="选择运动场所" style="width: 150px">
              <el-option label="室内" value="indoor" />
              <el-option label="室外" value="outdoor" />
              <el-option label="任意" value="any" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div v-else-if="plan" class="preferences-display">
        <el-tag class="pref-tag" :type="plan.preferences.use_equipment ? 'success' : 'info'">
          {{ plan.preferences.use_equipment ? '使用器械' : '不使用器械' }}
        </el-tag>
        <el-tag class="pref-tag" :type="plan.preferences.has_ball_games ? 'success' : 'info'">
          {{ plan.preferences.has_ball_games ? '包含球类' : '不含球类' }}
        </el-tag>
        <el-tag class="pref-tag" type="warning">
          类型: {{ getExerciseTypeText(plan.preferences.exercise_type) }}
        </el-tag>
        <el-tag class="pref-tag" type="primary">
          场所: {{ getLocationText(plan.preferences.location) }}
        </el-tag>
      </div>
    </div>

    <el-tabs v-model="activeWeek" type="card">
      <el-tab-pane 
        v-for="(week, index) in (isCreate ? createForm.weekly_plans : plan.weekly_plans)" 
        :key="week.week_number" 
        :label="`第 ${week.week_number} 周`" 
        :name="String(week.week_number)"
      >
        <div class="week-content">
          <div class="week-goal">
            <h3>第 {{ week.week_number }} 周训练目标</h3>
            <el-input 
              v-if="isCreate || !readonly" 
              v-model="week.goal" 
              placeholder="输入本周训练目标"
              style="margin-bottom: 10px;"
            />
            <p v-else>{{ week.goal }}</p>
          </div>

          <div class="daily-schedule">
            <h4>每日训练安排</h4>
            <el-collapse v-model="activeDays">
              <el-collapse-item 
                v-for="day in week.daily_plans" 
                :key="day.day_of_week" 
                :title="day.day_of_week" 
                :name="day.day_of_week"
              >
                <div class="day-summary">
                  <template v-if="!readonly || isCreate">
                    <el-select v-model="day.intensity" placeholder="强度" size="small" style="width: 100px; margin-right: 8px;">
                      <el-option label="低" value="低" />
                      <el-option label="中" value="中" />
                      <el-option label="高" value="高" />
                    </el-select>
                    <el-input-number v-model="day.duration_minutes" :min="1" :step="5" size="small" style="width: 120px;" placeholder="时长" />
                    <span style="margin-left: 4px; font-size: 12px; color: #606266;">分钟</span>
                  </template>
                  <template v-else>
                    <el-tag size="small" type="info">强度: {{ day.intensity }}</el-tag>
                    <el-tag size="small" type="warning" style="margin-left: 8px;">时长: {{ day.duration_minutes }} 分钟</el-tag>
                  </template>
                </div>
                
                <el-table :data="day.exercises" style="width: 100%; margin-top: 10px;" border stripe>
                  <el-table-column prop="name" label="动作名称" min-width="120">
                    <template #default="scope">
                      <el-input v-if="!readonly || isCreate" v-model="scope.row.name" size="small" />
                      <span v-else>{{ scope.row.name }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="description" label="具体动作" min-width="150">
                    <template #default="scope">
                      <el-input v-if="!readonly || isCreate" v-model="scope.row.description" size="small" placeholder="描述动作细节" />
                      <span v-else>{{ scope.row.description }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="equipment" label="器械" width="100">
                    <template #default="scope">
                      <el-input v-if="!readonly || isCreate" v-model="scope.row.equipment" size="small" />
                      <span v-else>{{ scope.row.equipment }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="sets" label="组数" width="80" align="center">
                    <template #default="scope">
                      <el-input-number v-if="!readonly || isCreate" v-model="scope.row.sets" :min="1" size="small" controls-position="right" style="width: 100%" />
                      <span v-else>{{ scope.row.sets }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="reps" label="次数/组" width="100" align="center">
                    <template #default="scope">
                      <el-input v-if="!readonly || isCreate" v-model="scope.row.reps" size="small" />
                      <span v-else>{{ scope.row.reps }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="rest_seconds" label="组间休息(s)" width="100" align="center">
                    <template #default="scope">
                      <el-input-number v-if="!readonly || isCreate" v-model="scope.row.rest_seconds" :min="0" :step="10" size="small" controls-position="right" style="width: 100%" />
                      <span v-else>{{ scope.row.rest_seconds }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="notes" label="备注" min-width="150">
                    <template #default="scope">
                      <el-input v-if="!readonly || isCreate" v-model="scope.row.notes" size="small" />
                      <span v-else>{{ scope.row.notes }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column v-if="!readonly || isCreate" label="操作" width="60" align="center">
                    <template #default="scope">
                      <el-button type="danger" link size="small" @click="day.exercises.splice(scope.$index, 1)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <div v-if="!readonly || isCreate" style="margin-top: 10px; text-align: center;">
                  <el-button size="small" @click="day.exercises.push({ name: '', description: '', equipment: '', sets: 3, reps: '10', rest_seconds: 60, notes: '' })">+ 添加动作</el-button>
                </div>

                <div class="day-notes">
                  <strong>备注:</strong>
                  <el-input 
                    v-if="!readonly || isCreate" 
                    v-model="day.notes" 
                    type="textarea" 
                    :rows="2" 
                    placeholder="输入备注" 
                    style="margin-top: 5px;"
                  />
                  <span v-else> {{ day.notes }}</span>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane v-if="isCreate || !readonly" label="+ 添加周" name="add">
         <div style="padding: 20px; text-align: center;">
           <el-button type="primary" @click="handleAddWeek">添加第 {{ (isCreate ? createForm.weekly_plans.length : plan.weekly_plans.length) + 1 }} 周计划</el-button>
         </div>
      </el-tab-pane>
    </el-tabs>
  </div>
  <el-empty v-else description="加载中..." />
</template>

<script setup lang="ts">
import { ref, watch, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { TrainingPlan } from '@/types/training_plan'
import { getTrainingPlanDetail, updatePlanStatus, updatePlan, archivePlan, activatePlan } from '@/api/training_plan'
import { createTemplate } from '@/api/training_template'

const props = defineProps<{
  planId?: string,
  readonly?: boolean,
  isCreate?: boolean
}>()

const emit = defineEmits(['saved'])

const plan = ref<TrainingPlan | null>(null)
const activeWeek = ref('1')
const activeDays = ref<string[]>([])

// Create form state
const createForm = reactive({
  name: '',
  age_range: '',
  cycle: '',
  type: '',
  intensity: '',
  is_template: true,
  preferences: {
    use_equipment: false,
    has_ball_games: false,
    exercise_type: 'mixed',
    location: 'any'
  },
  weekly_plans: [
    {
      week_number: 1,
      goal: '',
      daily_plans: Array.from({ length: 7 }, (_, i) => ({
        day_number: i + 1,
        day_of_week: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i],
        intensity: '中',
        duration_minutes: 30,
        exercises: [],
        notes: ''
      }))
    }
  ]
})

const getStatusType = (status: string) => {
  switch (status) {
    case 'active': return 'success'
    case 'completed': return 'info'
    case 'archived': return 'info'
    case 'pending': return 'warning'
    case 'stopped': return 'danger'
    default: return ''
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return '进行中'
    case 'completed': return '已完成'
    case 'archived': return '已归档'
    case 'pending': return '待确认'
    case 'stopped': return '已终止'
    default: return status
  }
}

const getExerciseTypeText = (type: string) => {
  const map: Record<string, string> = {
    aerobic: '有氧运动',
    strength: '力量训练',
    mixed: '混合训练'
  }
  return map[type] || type
}

const getLocationText = (location: string) => {
  const map: Record<string, string> = {
    indoor: '室内',
    outdoor: '室外',
    any: '任意'
  }
  return map[location] || location
}

const handleUpdateStatus = async (status: string) => {
  if (!plan.value) return
  try {
    if (status === 'active') {
      await activatePlan(plan.value.id)
      ElMessage.success('计划已启动，其他进行中的计划已停用')
    } else {
      await updatePlanStatus(plan.value.id, status)
      ElMessage.success('状态更新成功')
    }
    await fetchPlanDetail()
  } catch (error) {
    console.error('Failed to update status:', error)
    ElMessage.error('状态更新失败')
  }
}

const handleArchive = async () => {
  if (!plan.value) return
  try {
    await archivePlan(plan.value.id)
    ElMessage.success('已归档到处方库')
    await fetchPlanDetail()
  } catch (error) {
    console.error('Failed to archive plan:', error)
    ElMessage.error('归档失败')
  }
}

const handleSave = async () => {
  if (!plan.value) return
  
  try {
    const dailyPlansPayload: any[] = []
    
    // Transform nested weekly plans back to flat daily plans
    plan.value.weekly_plans.forEach(week => {
      week.daily_plans.forEach(day => {
        // We need to use the stored day_number if available
        const dayNum = (day as any).day_number
        
        if (dayNum) {
          dailyPlansPayload.push({
            week_number: week.week_number,
            day_of_week: dayNum,
            content: {
              intensity: day.intensity,
              duration: `${day.duration_minutes}分钟`,
              exercises: day.exercises,
              notes: day.notes
            }
          })
        }
      })
    })

    await updatePlan(plan.value.id, { 
      daily_plans: dailyPlansPayload,
      preferences: plan.value.preferences
    })
    ElMessage.success('计划已更新')
    emit('saved')
  } catch (error) {
    console.error('Failed to update plan:', error)
    ElMessage.error('更新计划失败')
  }
}

const handleCreate = async () => {
  if (!createForm.name) {
    ElMessage.warning('请输入计划名称')
    return
  }

  try {
    const dailyPlansPayload: any[] = []
    
    createForm.weekly_plans.forEach(week => {
      week.daily_plans.forEach(day => {
        dailyPlansPayload.push({
          week_number: week.week_number,
          day_of_week: day.day_number,
          content: {
            intensity: day.intensity,
            duration: `${day.duration_minutes}分钟`,
            exercises: day.exercises,
            notes: day.notes
          }
        })
      })
    })

    const payload = {
      name: createForm.name,
      age_range: createForm.age_range,
      cycle: createForm.cycle,
      type: createForm.type,
      intensity: createForm.intensity,
      is_template: true,
      preferences: createForm.preferences,
      daily_plans: dailyPlansPayload
    }

    await createTemplate(payload)
    ElMessage.success('创建成功')
    emit('saved')
  } catch (error) {
    console.error('Failed to create plan:', error)
    ElMessage.error('创建失败')
  }
}

const handleAddWeek = () => {
  const target = props.isCreate ? createForm.weekly_plans : plan.value?.weekly_plans
  if (!target) return

  const nextWeekNum = target.length + 1
  target.push({
    week_number: nextWeekNum,
    goal: '',
    daily_plans: Array.from({ length: 7 }, (_, i) => ({
      day_number: i + 1,
      day_of_week: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i],
      intensity: '中',
      duration_minutes: 30,
      exercises: [],
      notes: ''
    }))
  })
  activeWeek.value = String(nextWeekNum)
}

const fetchPlanDetail = async () => {
  if (props.isCreate) return
  if (!props.planId) return
  try {
    const data: any = await getTrainingPlanDetail(props.planId)
    
    // Transform backend data to frontend model
    const weeklyPlansMap = new Map<number, any>()
    
    // Initialize each week with 7 days
    const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    const createEmptyDay = (dayIndex: number) => ({
      day_number: dayIndex + 1,
      day_of_week: dayNames[dayIndex],
      intensity: '中',
      duration_minutes: 30,
      exercises: [] as any[],
      notes: ''
    })
    
    if (data.daily_plans) {
      data.daily_plans.forEach((dp: any) => {
        if (!weeklyPlansMap.has(dp.week_number)) {
          // Create week with 7 empty days
          weeklyPlansMap.set(dp.week_number, {
            week_number: dp.week_number,
            goal: `第 ${dp.week_number} 周训练目标`,
            daily_plans: Array.from({ length: 7 }, (_, i) => createEmptyDay(i))
          })
        }
        
        const week = weeklyPlansMap.get(dp.week_number)
        const dayIndex = dp.day_of_week - 1
        if (dayIndex >= 0 && dayIndex < 7) {
          week.daily_plans[dayIndex] = {
            day_number: dp.day_of_week,
            day_of_week: dayNames[dayIndex],
            intensity: dp.content.intensity || '中',
            duration_minutes: parseInt(dp.content.duration) || 30,
            exercises: dp.content.exercises || [],
            notes: dp.content.notes || ''
          }
        }
      })
    }
    
    // Ensure at least one week exists with 7 days
    if (weeklyPlansMap.size === 0) {
      weeklyPlansMap.set(1, {
        week_number: 1,
        goal: '第 1 周训练目标',
        daily_plans: Array.from({ length: 7 }, (_, i) => createEmptyDay(i))
      })
    }
    
    // Sort weeks
    const weeklyPlans = Array.from(weeklyPlansMap.values()).sort((a, b) => a.week_number - b.week_number)

    plan.value = {
      ...data,
      weekly_plans: weeklyPlans,
      preferences: data.preferences || {
        use_equipment: false,
        has_ball_games: false,
        exercise_type: 'mixed',
        location: 'any'
      }
    }
    
    if (weeklyPlans.length > 0) {
      activeWeek.value = String(weeklyPlans[0].week_number)
    }
  } catch (error) {
    console.error('Failed to fetch plan detail:', error)
    ElMessage.error('获取训练计划详情失败')
  }
}

watch(() => props.planId, () => {
  fetchPlanDetail()
})

onMounted(() => {
  fetchPlanDetail()
})
</script>

<style scoped>
.training-plan-detail {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.header > div:first-child {
  flex: 1;
}

.reason-text {
  color: #909399;
  font-size: 14px;
  margin-top: 4px;
}

.header-actions {
  display: flex;
  align-items: center;
}

.preferences-section {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.preferences-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #303133;
  font-size: 16px;
}

.preferences-display {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.pref-tag {
  font-size: 14px;
}

.week-goal {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.week-goal h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #303133;
}

.week-goal p {
  margin: 0;
  color: #606266;
}

.daily-schedule h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #303133;
}

.day-summary {
  margin-bottom: 10px;
}

.day-notes {
  margin-top: 10px;
  padding: 10px;
  background-color: #ecf5ff;
  border-radius: 4px;
  color: #409eff;
}
</style>
