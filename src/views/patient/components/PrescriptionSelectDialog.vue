<template>
  <el-dialog
    v-model="dialogVisible"
    title="引用运动处方"
    width="700px"
    :close-on-click-modal="false"
  >
    <div class="search-bar">
      <el-input
        v-model="searchName"
        placeholder="搜索处方名称"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <el-table
      v-loading="loading"
      :data="prescriptions"
      style="width: 100%"
      height="400"
      @row-click="handleRowClick"
      highlight-current-row
    >
      <el-table-column prop="name" label="处方名称" min-width="120" />
      <el-table-column prop="trainingType" label="运动类型" width="100" />
      <el-table-column prop="trainingIntensity" label="强度" width="80" />
      <el-table-column prop="ageRange" label="适用年龄" width="100" />
      <el-table-column prop="trainingCycle" label="周期" width="80" />
    </el-table>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :disabled="!selectedPrescription"
          :loading="submitting"
          @click="handleSubmit"
        >
          生成计划
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getStandardPrescriptions, copyTemplateToPatient } from '@/api/training_plan'
import type { TrainingPlan } from '@/types/training_plan'

const props = defineProps<{
  modelValue: boolean
  patientId: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const submitting = ref(false)
const searchName = ref('')
const prescriptions = ref<TrainingPlan[]>([])
const selectedPrescription = ref<TrainingPlan | null>(null)

let searchTimer: ReturnType<typeof setTimeout> | null = null

const loadPrescriptions = async () => {
  loading.value = true
  try {
    const res = await getStandardPrescriptions(searchName.value || undefined)
    prescriptions.value = res || []
  } catch (error) {
    console.error('Failed to load prescriptions:', error)
    ElMessage.error('加载处方列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    loadPrescriptions()
  }, 300)
}

const handleRowClick = (row: TrainingPlan) => {
  selectedPrescription.value = row
}

const handleSubmit = async () => {
  if (!selectedPrescription.value) return

  submitting.value = true
  try {
    await copyTemplateToPatient(selectedPrescription.value.id, props.patientId)
    ElMessage.success('生成训练计划成功')
    emit('success')
    handleClose()
  } catch (error) {
    console.error('Failed to copy template:', error)
    ElMessage.error('生成训练计划失败')
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  dialogVisible.value = false
}

watch(() => props.modelValue, (val) => {
  if (val) {
    loadPrescriptions()
    selectedPrescription.value = null
    searchName.value = ''
  }
})
</script>

<style scoped>
.search-bar {
  margin-bottom: 16px;
}
</style>
