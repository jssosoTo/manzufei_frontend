<template>
  <div class="training-plan-list">
    <div class="header">
      <h3>训练计划列表</h3>
      <el-button type="primary" @click="handleGeneratePlan" :loading="generating">
        智能生成计划
      </el-button>
    </div>
    
    <el-empty v-if="plans.length === 0" description="暂无训练计划" />
    
    <div v-else class="plan-items">
      <el-card 
        v-for="plan in plans" 
        :key="plan.id" 
        class="plan-card" 
        shadow="hover"
      >
        <div class="plan-info" @click="selectPlan(plan)">
          <div class="plan-dates">
            <el-icon><Calendar /></el-icon>
            <span>{{ formatDate(plan.start_date) }} - {{ formatDate(plan.end_date) }}</span>
          </div>
          <el-tag :type="getStatusType(plan.status)">{{ getStatusText(plan.status) }}</el-tag>
        </div>
        <div class="plan-actions" v-if="plan.status !== 'archived'">
          <el-button type="warning" size="small" @click.stop="handleArchive(plan)">
            归档
          </el-button>
          <el-button type="primary" size="small" @click.stop="selectPlan(plan)">
            查看
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Calendar } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { TrainingPlan } from '@/types/training_plan'
import { getTrainingPlans, generateTrainingPlan, updatePlanStatus } from '@/api/training_plan'

const props = defineProps<{
  patientId: string
}>()

const emit = defineEmits<{
  (e: 'select', plan: TrainingPlan): void
}>()

const plans = ref<TrainingPlan[]>([])
const generating = ref(false)

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

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

const fetchPlans = async () => {
  try {
    const data = await getTrainingPlans(props.patientId)
    // Ensure data is an array
    plans.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Failed to fetch plans:', error)
    ElMessage.error('获取训练计划失败')
  }
}

const handleGeneratePlan = async () => {
  generating.value = true
  try {
    await generateTrainingPlan(props.patientId)
    ElMessage.success('训练计划生成成功')
    await fetchPlans()
  } catch (error) {
    console.error('Failed to generate plan:', error)
    ElMessage.error('生成训练计划失败')
  } finally {
    generating.value = false
  }
}

const handleArchive = async (plan: TrainingPlan) => {
  try {
    await updatePlanStatus(plan.id, 'archived')
    ElMessage.success('计划已归档')
    await fetchPlans()
  } catch (error) {
    console.error('Failed to archive plan:', error)
    ElMessage.error('归档失败')
  }
}

const selectPlan = (plan: TrainingPlan) => {
  emit('select', plan)
}

onMounted(() => {
  if (props.patientId) {
    fetchPlans()
  }
})
</script>

<style scoped>
.training-plan-list {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.plan-items {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.plan-card {
  cursor: pointer;
  transition: all 0.3s;
}

.plan-card:hover {
  transform: translateY(-2px);
}

.plan-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.plan-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.plan-dates {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
}
</style>
