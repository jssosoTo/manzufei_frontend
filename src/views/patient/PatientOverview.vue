<template>
  <div class="patient-overview">
    <el-card>
      <template #header>
        <div class="header">
          <h2>患者数据总览</h2>
          <el-button @click="$router.back()">返回</el-button>
        </div>
      </template>

      <el-table
        :data="overviewData"
        style="width: 100%"
        border
        v-loading="loading"
        height="calc(100vh - 200px)"
      >
        <!-- Fixed Patient Info Columns -->
        <el-table-column prop="patient_id" label="编号" width="100" fixed />
        <el-table-column prop="name" label="姓名" width="100" fixed />
        <el-table-column prop="gender" label="性别" width="60" fixed>
          <template #default="{ row }">
            {{ row.gender === 1 ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column prop="age" label="年龄" width="60" fixed />

        <!-- Round 1 Columns -->
        <el-table-column label="第一轮测试">
          <el-table-column prop="round1_date" label="日期" width="120" />
          <el-table-column prop="round1_mmrc" label="MMRC" width="80" />
          <el-table-column prop="round1_bmi" label="BMI" width="80" />
          <el-table-column prop="round1_6mwd" label="6MWD" width="80" />
        </el-table-column>

        <!-- Round 2 Columns -->
        <el-table-column label="第二轮测试">
          <el-table-column prop="round2_date" label="日期" width="120" />
          <el-table-column prop="round2_mmrc" label="MMRC" width="80" />
          <el-table-column prop="round2_bmi" label="BMI" width="80" />
          <el-table-column prop="round2_6mwd" label="6MWD" width="80" />
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getPatientOverview } from '../../api/patient'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const overviewData = ref<any[]>([])

onMounted(async () => {
  loading.value = true
  try {
    const res: any = await getPatientOverview()
    if (Array.isArray(res)) {
      overviewData.value = res
    } else if (res && Array.isArray(res.list)) {
      overviewData.value = res.list
    } else if (res && Array.isArray(res.data)) {
      overviewData.value = res.data
    } else {
      overviewData.value = []
    }
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
h2 {
  margin: 0;
  font-size: 18px;
}
</style>
