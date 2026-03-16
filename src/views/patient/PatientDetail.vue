<template>
  <div v-loading="loading">
    <el-page-header @back="$router.back()">
      <template #content>
        <span>患者详情 - {{ patient?.name }}</span>
      </template>
    </el-page-header>

    <el-card style="margin-top: 16px" v-if="patient">
      <el-descriptions :column="3" border>
        <el-descriptions-item label="编号">{{ patient.patient_id }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ patient.name }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ patient.gender_text }}</el-descriptions-item>
        <el-descriptions-item label="年龄">{{ patient.age || '-' }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ patient.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="出生日期">{{ patient.birth_date || '-' }}</el-descriptions-item>
        <el-descriptions-item label="地址" :span="3">{{ patient.address || '-' }}</el-descriptions-item>
        <el-descriptions-item label="既往病史" :span="3">{{ patient.medical_history || '-' }}</el-descriptions-item>
        <el-descriptions-item label="过敏信息" :span="3">{{ patient.allergy_info || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card style="margin-top: 16px">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>检测记录</span>
          <el-button type="primary" size="small" @click="$router.push(`/test/entry?patient_id=${patientId}`)">新增检测</el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="检测记录" name="records">
          <el-table :data="records" stripe>
            <el-table-column prop="test_date" label="检测日期" width="120" />
            <el-table-column prop="test_round" label="轮次" width="80" />
            <el-table-column prop="mmrc_grade_text" label="MMRC分级" />
            <el-table-column prop="tester_name" label="检测员" width="100" />
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button link type="primary" @click="viewRecord(row.record_id)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="指标趋势" name="trend">
          <div v-if="trendData">
            <el-select v-model="selectedTrendIndicator" placeholder="选择指标" style="width: 200px; margin-bottom: 16px">
              <el-option v-for="s in trendData.series" :key="s.indicator_code" :label="s.indicator_name" :value="s.indicator_code" />
            </el-select>
            <v-chart v-if="trendChartOption" :option="trendChartOption" style="height: 350px" autoresize />
          </div>
          <el-empty v-else description="暂无趋势数据" />
        </el-tab-pane>

        <el-tab-pane label="检测对比" name="comparison">
          <el-table v-if="comparisonData" :data="comparisonData.items" stripe>
            <el-table-column prop="indicator_name" label="指标" width="140" />
            <el-table-column prop="unit" label="单位" width="80" />
            <el-table-column label="第一轮">
              <template #default="{ row }">{{ row.first_value ?? '-' }}</template>
            </el-table-column>
            <el-table-column label="第二轮">
              <template #default="{ row }">{{ row.second_value ?? '-' }}</template>
            </el-table-column>
            <el-table-column label="变化">
              <template #default="{ row }">
                <span v-if="row.change_value != null" :style="{ color: row.change_value > 0 ? '#e6a23c' : row.change_value < 0 ? '#67c23a' : '' }">
                  {{ row.change_value > 0 ? '+' : '' }}{{ row.change_value?.toFixed(2) }}
                </span>
                <span v-else>-</span>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无对比数据" />
        </el-tab-pane>

        <el-tab-pane label="训练计划" name="training">
          <div v-if="trainingView === 'list'">
            <div style="margin-bottom: 16px">
              <el-button type="primary" @click="prescriptionDialogVisible = true">引用处方</el-button>
            </div>
            <TrainingPlanList :patient-id="patientId" @select="handleSelectPlan" />
          </div>
          <div v-else>
            <el-button @click="trainingView = 'list'" style="margin-bottom: 16px" :icon="ArrowLeft">返回列表</el-button>
            <TrainingPlanDetail :plan-id="selectedPlanId" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- Prescription Select Dialog -->
    <PrescriptionSelectDialog
      v-model="prescriptionDialogVisible"
      :patient-id="patientId"
      @success="handlePrescriptionSuccess"
    />

    <!-- Record Detail Dialog -->
    <el-dialog v-model="recordDialogVisible" title="检测详情" width="700px" destroy-on-close>
      <el-descriptions v-if="currentRecord" :column="2" border>
        <el-descriptions-item label="检测日期">{{ currentRecord.test_date }}</el-descriptions-item>
        <el-descriptions-item label="检测轮次">第{{ currentRecord.test_round }}轮</el-descriptions-item>
        <el-descriptions-item label="MMRC分级">{{ currentRecord.mmrc_grade_text || '-' }}</el-descriptions-item>
        <el-descriptions-item label="检测员">{{ currentRecord.tester_name || '-' }}</el-descriptions-item>
      </el-descriptions>
      <el-table v-if="currentRecord?.indicators" :data="currentRecord.indicators" stripe style="margin-top: 16px">
        <el-table-column prop="indicator_name" label="指标" width="140" />
        <el-table-column label="数值">
          <template #default="{ row }">{{ row.value_numeric ?? row.value_text ?? '-' }}</template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.is_abnormal === 1" type="danger" size="small">
              {{ row.abnormal_direction === -1 ? '偏低' : '偏高' }}
            </el-tag>
            <el-tag v-else-if="row.is_abnormal === 0" type="success" size="small">正常</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="normal_range_desc" label="参考范围" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { ArrowLeft } from '@element-plus/icons-vue'
import VChart from 'vue-echarts'
import { getPatient } from '../../api/patient'
import { getTestRecords, getTestRecord } from '../../api/test'
import { getComparison, getTrend } from '../../api/report'
import TrainingPlanList from './components/TrainingPlanList.vue'
import TrainingPlanDetail from './components/TrainingPlanDetail.vue'
import PrescriptionSelectDialog from './components/PrescriptionSelectDialog.vue'

use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

const route = useRoute()
const patientId = route.params.id as string

const loading = ref(true)
const patient = ref<any>(null)
const records = ref<any[]>([])
const activeTab = ref('records')
const comparisonData = ref<any>(null)
const trendData = ref<any>(null)
const selectedTrendIndicator = ref('')
const recordDialogVisible = ref(false)
const currentRecord = ref<any>(null)

const trainingView = ref<'list' | 'detail'>('list')
const prescriptionDialogVisible = ref(false)
const selectedPlanId = ref('')

const handleSelectPlan = (plan: any) => {
  selectedPlanId.value = plan.id
  trainingView.value = 'detail'
}

const handlePrescriptionSuccess = () => {
  // Refresh training plan list if needed
}

onMounted(async () => {
  try {
    const [p, r] = await Promise.all([
      getPatient(patientId),
      getTestRecords(patientId),
    ])
    patient.value = p
    records.value = (r as any) || []

    // Load analysis data
    try {
      const [comp, trend] = await Promise.all([
        getComparison(patientId),
        getTrend(patientId),
      ])
      comparisonData.value = comp
      trendData.value = trend
      if (trend && (trend as any).series?.length > 0) {
        selectedTrendIndicator.value = (trend as any).series[0].indicator_code
      }
    } catch {}
  } catch {} finally {
    loading.value = false
  }
})

async function viewRecord(recordId: number) {
  try {
    currentRecord.value = await getTestRecord(patientId, recordId)
    recordDialogVisible.value = true
  } catch {}
}

const trendChartOption = computed(() => {
  if (!trendData.value || !selectedTrendIndicator.value) return null
  const series = trendData.value.series?.find((s: any) => s.indicator_code === selectedTrendIndicator.value)
  if (!series || !series.data_points?.length) return null
  return {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: series.data_points.map((d: any) => `第${d.test_round}轮\n${d.test_date}`),
    },
    yAxis: { type: 'value', name: series.unit },
    series: [{
      type: 'line',
      data: series.data_points.map((d: any) => d.value),
      markPoint: { data: [{ type: 'max', name: '最大值' }, { type: 'min', name: '最小值' }] },
    }],
  }
})
</script>
