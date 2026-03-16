<template>
  <div>
    <el-page-header @back="$router.back()">
      <template #content>体测数据录入</template>
    </el-page-header>

    <el-card style="margin-top: 16px">
      <el-steps :active="step" finish-status="success" style="margin-bottom: 24px">
        <el-step title="选择患者" />
        <el-step title="填写检测信息" />
        <el-step title="录入指标数据" />
      </el-steps>

      <!-- Step 1: Select Patient -->
      <div v-if="step === 0">
        <el-form label-width="100px">
          <el-form-item label="选择患者">
            <el-select v-model="selectedPatientId" filterable placeholder="搜索并选择患者" style="width: 400px">
              <el-option v-for="p in patientOptions" :key="p.patient_id" :label="`${p.patient_id} - ${p.name}`" :value="p.patient_id" />
            </el-select>
          </el-form-item>
        </el-form>
        <el-button type="primary" :disabled="!selectedPatientId" @click="step = 1">下一步</el-button>
      </div>

      <!-- Step 2: Test Record Info -->
      <div v-if="step === 1">
        <el-form :model="recordForm" label-width="120px">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="检测日期" required>
                <el-date-picker v-model="recordForm.test_date" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="检测轮次" required>
                <el-input-number v-model="recordForm.test_round" :min="1" :max="10" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="MMRC分级">
                <el-radio-group v-model="recordForm.mmrc_grade">
                  <el-radio v-for="g in [0,1,2,3,4]" :key="g" :value="g">{{ g }}级</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="检测员">
                <el-input v-model="recordForm.tester_name" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="备注">
            <el-input v-model="recordForm.notes" type="textarea" />
          </el-form-item>
        </el-form>
        <el-button @click="step = 0">上一步</el-button>
        <el-button type="primary" @click="step = 2">下一步</el-button>
      </div>

      <!-- Step 3: Indicator Values -->
      <div v-if="step === 2">
        <el-tabs v-model="indicatorTab">
          <el-tab-pane label="身体形态" name="BODY_SHAPE">
            <el-form label-width="140px">
              <el-form-item v-for="ind in indicatorStore.bodyShape" :key="ind.indicator_code" :label="ind.indicator_name" required>
                <template v-if="ind.indicator_code === 'BMI'">
                  <el-input-number v-model="indicatorValues[ind.indicator_code]" disabled :precision="2" />
                  <span class="unit">{{ ind.unit }}</span>
                  <span class="hint">(自动计算)</span>
                </template>
                <template v-else>
                  <el-input-number v-model="indicatorValues[ind.indicator_code]" :precision="ind.precision_digits" :min="0" @change="onIndicatorChange" />
                  <span class="unit">{{ ind.unit }}</span>
                  <span class="range">参考: {{ ind.normal_range_desc }}</span>
                </template>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="身体机能" name="BODY_FUNCTION">
            <el-form label-width="140px">
              <el-form-item v-for="ind in indicatorStore.bodyFunction" :key="ind.indicator_code" :label="ind.indicator_name" required>
                <template v-if="ind.data_type === 'ENUM'">
                  <el-radio-group v-model="indicatorValues[ind.indicator_code]">
                    <el-radio :value="1">是</el-radio>
                    <el-radio :value="0">否</el-radio>
                  </el-radio-group>
                </template>
                <template v-else>
                  <el-input-number v-model="indicatorValues[ind.indicator_code]" :precision="ind.precision_digits" />
                  <span class="unit">{{ ind.unit }}</span>
                  <span class="range">参考: {{ ind.normal_range_desc }}</span>
                </template>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="身体素质" name="BODY_QUALITY">
            <el-form label-width="140px">
              <el-form-item v-for="ind in indicatorStore.bodyQuality" :key="ind.indicator_code" :label="ind.indicator_name" required>
                <el-input-number v-model="indicatorValues[ind.indicator_code]" :precision="ind.precision_digits" />
                <span class="unit">{{ ind.unit }}</span>
                <span class="range">参考: {{ ind.normal_range_desc }}</span>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
        <div style="margin-top: 16px">
          <el-button @click="step = 1">上一步</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">提交</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useIndicatorStore } from '../../stores/indicator'
import { getPatientList } from '../../api/patient'
import { createTestRecord, getTestRecords } from '../../api/test'
import { generateTrainingPlan } from '../../api/training_plan'
import { calcBMI } from '../../utils/bmi'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const indicatorStore = useIndicatorStore()

const step = ref(0)
const selectedPatientId = ref(route.query.patient_id as string || '')
const patientOptions = ref<any[]>([])
const indicatorTab = ref('BODY_SHAPE')
const submitting = ref(false)

const recordForm = reactive({
  test_date: new Date().toISOString().split('T')[0],
  test_round: 1,
  mmrc_grade: null as number | null,
  tester_name: '',
  notes: '',
})

const indicatorValues = reactive<Record<string, any>>({})

onMounted(async () => {
  await indicatorStore.fetchIndicators()
  try {
    const res: any = await getPatientList({ page: 1, page_size: 200, status: 1 })
    patientOptions.value = res.list || []
  } catch {}
  if (selectedPatientId.value) {
    step.value = 1
    fetchNextRound()
  }
})

// Watch patient selection to auto-fetch next round
watch(selectedPatientId, (newVal) => {
  if (newVal) {
    fetchNextRound()
  }
})

async function fetchNextRound() {
  try {
    const res: any = await getTestRecords(selectedPatientId.value)
    const records = res || []
    if (records.length > 0) {
      const maxRound = Math.max(...records.map((r: any) => r.test_round))
      recordForm.test_round = maxRound + 1
    } else {
      recordForm.test_round = 1
    }
  } catch {
    recordForm.test_round = 1
  }
}

function onIndicatorChange() {
  const height = indicatorValues['HEIGHT']
  const weight = indicatorValues['WEIGHT']
  if (height > 0 && weight > 0) {
    indicatorValues['BMI'] = calcBMI(height, weight)
  }
}

// Watch height/weight changes for auto BMI
watch(() => [indicatorValues['HEIGHT'], indicatorValues['WEIGHT']], () => {
  onIndicatorChange()
})

async function handleSubmit() {
  if (!recordForm.test_date || !recordForm.test_round) {
    ElMessage.warning('请填写检测日期和轮次')
    return
  }

  const indicators: any[] = []
  let missingFields: string[] = []

  // Validate all indicators
  for (const ind of indicatorStore.indicators) {
    if (ind.indicator_code === 'BMI') continue // Auto calculated

    const val = indicatorValues[ind.indicator_code]
    if (val === undefined || val === null || val === '') {
      missingFields.push(ind.indicator_name)
      continue
    }

    const item: any = {
      indicator_id: ind.indicator_id,
      indicator_code: ind.indicator_code,
    }
    if (ind.data_type === 'NUMERIC') {
      item.value_numeric = Number(val)
    } else if (ind.data_type === 'ENUM') {
      item.value_text = val === 1 ? '是' : '否'
      item.value_numeric = Number(val)
    } else {
      item.value_text = String(val)
    }
    indicators.push(item)
  }

  if (missingFields.length > 0) {
    ElMessage.warning(`请填写以下必填项: ${missingFields.slice(0, 3).join(', ')}` + (missingFields.length > 3 ? '...' : ''))
    return
  }

  submitting.value = true
  try {
    await createTestRecord(selectedPatientId.value, {
      ...recordForm,
      indicators,
    })
    ElMessage.success('提交成功')

    try {
      await ElMessageBox.confirm(
        '体测数据提交成功。是否立即为该患者生成新的训练计划？',
        '生成训练计划',
        {
          confirmButtonText: '生成',
          cancelButtonText: '跳过',
          type: 'success',
        }
      )
      
      await generateTrainingPlan(selectedPatientId.value)
      ElMessage.success('训练计划生成成功')
    } catch (e) {
      if (e !== 'cancel') {
        console.error('Plan generation failed', e)
        ElMessage.warning('训练计划生成失败，请稍后重试')
      }
    }

    router.push(`/patients/${selectedPatientId.value}`)
  } catch (error) {
    console.error(error)
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.unit { margin-left: 8px; color: #999; font-size: 13px; }
.range { margin-left: 12px; color: #aaa; font-size: 12px; }
.hint { margin-left: 8px; color: #409eff; font-size: 12px; }
</style>
