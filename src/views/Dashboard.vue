<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-value">{{ dashboard?.template_count || 0 }}</div>
            <div class="stat-label">运动处方总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-value">{{ dashboard?.patient_plan_count || 0 }}</div>
            <div class="stat-label">患者计划数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-value" style="color: #67c23a">{{ dashboard?.active_plan_count || 0 }}</div>
            <div class="stat-label">进行中</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-value" style="color: #909399">{{ dashboard?.completed_plan_count || 0 }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>运动计划状态分布</template>
          <v-chart :option="statusChartOption" style="height: 300px" autoresize />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>最近运动计划</template>
          <el-table :data="dashboard?.recent_plans || []" stripe size="small" max-height="300">
            <el-table-column prop="name" label="计划名称" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)" size="small">{{ getStatusText(scope.row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="start_date" label="开始日期" width="100" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { getDashboard } from '../api/report'

use([PieChart, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer])

const dashboard = ref<any>(null)

onMounted(async () => {
  try {
    dashboard.value = await getDashboard()
  } catch {}
})

const statusMap: Record<string, string> = {
  pending: '待确认',
  active: '进行中',
  completed: '已完成',
  stopped: '已终止',
  archived: '已归档'
}

const statusTypeMap: Record<string, string> = {
  pending: 'warning',
  active: 'success',
  completed: 'info',
  stopped: 'danger',
  archived: 'info'
}

const getStatusType = (status: string) => statusTypeMap[status] || ''
const getStatusText = (status: string) => statusMap[status] || status

const statusChartOption = computed(() => ({
  tooltip: { trigger: 'item' },
  legend: { bottom: 0 },
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    data: (dashboard.value?.status_distribution || []).map((item: any) => ({
      name: statusMap[item.status] || item.status,
      value: item.count,
    })),
    emphasis: { itemStyle: { shadowBlur: 10 } },
  }],
}))
</script>

<style scoped>
.stat-item {
  text-align: center;
  padding: 10px 0;
}
.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
}
.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
}
</style>
