<template>
  <div>
    <el-page-header @back="$router.back()">
      <template #content>新增患者</template>
    </el-page-header>

    <el-card style="margin-top: 16px">
      <el-steps :active="step" finish-status="success" align-center style="margin-bottom: 32px">
        <el-step title="填写基本信息" />
        <el-step title="第一次体测录入" />
      </el-steps>

      <!-- Step 1: Patient Basic Info -->
      <div v-if="step === 0" style="max-width: 800px; margin: 0 auto">
        <el-form ref="patientFormRef" :model="patientForm" :rules="patientFormRules" label-width="120px">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="患者编号" prop="patient_id">
                <el-input v-model="patientForm.patient_id" placeholder="如: 001" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="姓名" prop="name">
                <el-input v-model="patientForm.name" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="出生日期" prop="birth_date">
                <el-date-picker v-model="patientForm.birth_date" type="date" value-format="YYYY-MM-DD" style="width: 100%" @change="onBirthDateChange" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="年龄" prop="age">
                <el-input-number v-model="patientForm.age" :min="0" :max="150" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="性别" prop="gender">
                <el-radio-group v-model="patientForm.gender">
                  <el-radio :value="1">男</el-radio>
                  <el-radio :value="0">女</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="电话" prop="phone">
                <el-input v-model="patientForm.phone" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="地址" prop="address">
            <el-input v-model="patientForm.address" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="紧急联系人" prop="emergency_contact">
                <el-input v-model="patientForm.emergency_contact" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="紧急电话" prop="emergency_phone">
                <el-input v-model="patientForm.emergency_phone" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="既往病史" prop="medical_history">
            <el-input v-model="patientForm.medical_history" type="textarea" :rows="2" placeholder="无则填无" />
          </el-form-item>
          <el-form-item label="过敏信息" prop="allergy_info">
            <el-input v-model="patientForm.allergy_info" type="textarea" :rows="2" placeholder="无则填无" />
          </el-form-item>

          <div style="margin-top: 24px; text-align: center">
            <el-button @click="$router.back()">取消</el-button>
            <el-button type="primary" :loading="creatingPatient" @click="handleCreatePatient">下一步</el-button>
          </div>
        </el-form>
      </div>

      <!-- Step 2: First Test Entry -->
      <div v-if="step === 1">
        <div style="margin-bottom: 24px; text-align: center">
          <el-alert title="患者创建成功！您可以现在录入第一次体测数据，也可以跳过此步骤稍后在详情页录入。" type="success" show-icon :closable="false" style="max-width: 800px; margin: 0 auto" />
        </div>

        <div style="max-width: 900px; margin: 0 auto">
          <!-- Test Record Info -->
          <el-form :model="recordForm" label-width="120px">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="检测日期" required>
                  <el-date-picker v-model="recordForm.test_date" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="检测轮次" required>
                  <el-input-number v-model="recordForm.test_round" :min="1" disabled />
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

          <el-divider content-position="left">指标数据</el-divider>

          <!-- Indicator Tabs -->
          <el-tabs v-model="indicatorTab" type="border-card">
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

          <div style="margin-top: 24px; text-align: center">
            <el-button @click="skipTestEntry">跳过</el-button>
            <el-button type="primary" :loading="submittingTest" @click="handleCreateTestRecord">提交数据并完成</el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createPatient } from '../../api/patient'
import { createTestRecord } from '../../api/test'
import { useIndicatorStore } from '../../stores/indicator'
import { calcBMI } from '../../utils/bmi'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'

const router = useRouter()
const indicatorStore = useIndicatorStore()

const step = ref(0)
const creatingPatient = ref(false)
const submittingTest = ref(false)
const createdPatientId = ref('')

// --- Step 1: Patient Form Data ---
const patientFormRef = ref<FormInstance>()
const patientForm = reactive({
  patient_id: '',
  name: '',
  gender: 1,
  birth_date: '',
  age: null as number | null,
  phone: '',
  address: '',
  emergency_contact: '',
  emergency_phone: '',
  medical_history: '',
  allergy_info: '',
})

const patientFormRules = {
  patient_id: [{ required: true, message: '请输入患者编号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  birth_date: [{ required: true, message: '请选择出生日期', trigger: 'change' }],
  age: [{ required: true, message: '年龄不能为空', trigger: 'change' }],
  phone: [{ required: true, message: '请输入电话', trigger: 'blur' }],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
  emergency_contact: [{ required: true, message: '请输入紧急联系人', trigger: 'blur' }],
  emergency_phone: [{ required: true, message: '请输入紧急电话', trigger: 'blur' }],
  medical_history: [{ required: true, message: '请输入既往病史(无则填无)', trigger: 'blur' }],
  allergy_info: [{ required: true, message: '请输入过敏信息(无则填无)', trigger: 'blur' }],
}

// --- Step 2: Test Record Data ---
const indicatorTab = ref('BODY_SHAPE')
const recordForm = reactive({
  test_date: new Date().toISOString().split('T')[0],
  test_round: 1,
  mmrc_grade: null as number | null,
  tester_name: '',
  notes: '',
})
const indicatorValues = reactive<Record<string, any>>({})

// --- Lifecycle ---
onMounted(async () => {
  await indicatorStore.fetchIndicators()
})

// --- Methods for Step 1 ---
function onBirthDateChange(val: string) {
  if (val) {
    const birthYear = new Date(val).getFullYear()
    const currentYear = new Date().getFullYear()
    patientForm.age = currentYear - birthYear
  } else {
    patientForm.age = null
  }
}

async function handleCreatePatient() {
  const valid = await patientFormRef.value?.validate().catch(() => false)
  if (!valid) return

  creatingPatient.value = true
  try {
    await createPatient(patientForm)
    createdPatientId.value = patientForm.patient_id
    ElMessage.success('患者基本信息保存成功')
    step.value = 1
  } catch (error) {
    console.error(error)
  } finally {
    creatingPatient.value = false
  }
}

// --- Methods for Step 2 ---
function onIndicatorChange() {
  const height = indicatorValues['HEIGHT']
  const weight = indicatorValues['WEIGHT']
  if (height > 0 && weight > 0) {
    indicatorValues['BMI'] = calcBMI(height, weight)
  }
}

watch(() => [indicatorValues['HEIGHT'], indicatorValues['WEIGHT']], () => {
  onIndicatorChange()
})

function skipTestEntry() {
  if (createdPatientId.value) {
    router.push(`/patients/${createdPatientId.value}`)
  } else {
    router.push('/patients')
  }
}

async function handleCreateTestRecord() {
  if (!recordForm.test_date) {
    ElMessage.warning('请填写检测日期')
    return
  }

  const indicators: any[] = []
  let missingFields: string[] = []

  // Validate indicators
  for (const ind of indicatorStore.indicators) {
    if (ind.indicator_code === 'BMI') continue

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

  submittingTest.value = true
  try {
    await createTestRecord(createdPatientId.value, {
      ...recordForm,
      indicators,
    })
    ElMessage.success('体测数据提交成功')
    router.push(`/patients/${createdPatientId.value}`)
  } catch (error) {
    console.error(error)
    ElMessage.error('提交失败')
  } finally {
    submittingTest.value = false
  }
}
</script>

<style scoped>
.unit { margin-left: 8px; color: #999; font-size: 13px; }
.range { margin-left: 12px; color: #aaa; font-size: 12px; }
.hint { margin-left: 8px; color: #409eff; font-size: 12px; }
</style>
