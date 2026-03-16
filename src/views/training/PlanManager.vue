<template>
  <div class="plan-manager">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>训练计划管理</span>
          <div class="header-actions">
            <el-button type="danger" @click="handleBatchDelete" v-if="selectedRows.length > 0">批量删除</el-button>
            <el-button type="primary" @click="handleDownloadTemplate">下载模板</el-button>
            <el-button type="success" @click="importDialogVisible = true">导入处方</el-button>
            <el-button type="primary" @click="openCreateDialog">新建处方模板</el-button>
          </div>
        </div>
      </template>

      <!-- Only show plans, hide templates tab -->
      <el-table :data="tableData" v-loading="loading" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="age_range" label="年龄范围" />
        <el-table-column prop="training_cycle" label="周期" />
        <el-table-column prop="training_type" label="类型" />
        <el-table-column prop="training_intensity" label="强度" />
        <el-table-column prop="source" label="来源" />
        <el-table-column label="操作" width="220">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="handleViewDetail(scope.row)">详情</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-drawer
      v-model="detailVisible"
      :title="currentPlanId ? '计划详情' : '新建处方模板'"
      size="80%"
      destroy-on-close
    >
      <TrainingPlanDetail 
        v-if="detailVisible"
        :plan-id="currentPlanId" 
        :readonly="false" 
        :is-create="!currentPlanId"
        @saved="handleSaved"
      />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadFile, UploadInstance } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { listTemplates, deleteTemplate, archivePlan, importPlans, downloadTemplate, batchDeleteTemplates } from '@/api/training_template'
import TrainingPlanDetail from '../patient/components/TrainingPlanDetail.vue'

const activeTab = ref('plans')
const loading = ref(false)
const tableData = ref([])
const selectedRows = ref<any[]>([])
const detailVisible = ref(false)
const currentPlanId = ref('')

const importDialogVisible = ref(false)
const importLoading = ref(false)
const uploadRef = ref<UploadInstance>()
const selectedFile = ref<File | null>(null)

const fetchData = async () => {
  loading.value = true
  try {
    const params: any = {}
    const res = await listTemplates(params)
    console.log('Fetched training plans:', res)
    tableData.value = res.data || res 
  } catch (error) {
    console.error(error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const handleTabChange = () => {
  fetchData()
}

const openCreateDialog = () => {
  currentPlanId.value = ''
  detailVisible.value = true
}

const handleSaved = () => {
  detailVisible.value = false
  fetchData()
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认删除该记录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteTemplate(row.id)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      console.error(error)
      ElMessage.error('删除失败')
    }
  })
}

const handleArchive = (row: any) => {
  ElMessageBox.confirm('确认归档该计划吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await archivePlan(row.id)
      ElMessage.success('归档成功')
      fetchData() // Refresh list
    } catch (error) {
      console.error(error)
      ElMessage.error('归档失败')
    }
  })
}

const handleViewDetail = (row: any) => {
  currentPlanId.value = String(row.id)
  detailVisible.value = true
}

const handleDownloadTemplate = async () => {
  try {
    const res = await downloadTemplate()
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([res as any]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'training_plan_template.xlsx')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error(error)
    ElMessage.error('下载模板失败')
  }
}

const handleFileChange = (file: UploadFile) => {
  if (file.raw) {
    selectedFile.value = file.raw
  }
}

const handleImport = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请选择文件')
    return
  }
  
  importLoading.value = true
  try {
    // Check file extension just in case
    const isExcel = /\.(xlsx|xls)$/.test(selectedFile.value.name)
    if (!isExcel) {
        ElMessage.error('请上传 Excel 文件')
        importLoading.value = false
        return
    }

    const res: any = await importPlans(selectedFile.value)
    
    if (res.fail_count > 0) {
      let msg = `导入完成：成功 ${res.success_count} 条，失败 ${res.fail_count} 条。`
      if (res.errors && res.errors.length > 0) {
        msg += '错误详情：' + res.errors.map((e: any) => `第${e.row}行: ${e.message}`).join('; ')
      }
      ElMessage.warning({
        message: msg,
        duration: 10000,
        showClose: true
      })
    } else {
      ElMessage.success(`导入成功：共 ${res.success_count} 条`)
    }

    importDialogVisible.value = false
    uploadRef.value?.clearFiles()
    selectedFile.value = null
    fetchData()
  } catch (error) {
    console.error(error)
    // ElMessage handled by interceptor generally, but if not:
    // ElMessage.error('导入失败')
  } finally {
    importLoading.value = false
  }
}

const handleSelectionChange = (val: any[]) => {
  selectedRows.value = val
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) return

  ElMessageBox.confirm(`确认删除选中的 ${selectedRows.value.length} 条记录吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = selectedRows.value.map((row: any) => row.id)
      await batchDeleteTemplates(ids)
      ElMessage.success('批量删除成功')
      fetchData()
      selectedRows.value = [] // clear selection
    } catch (error) {
      console.error(error)
      ElMessage.error('批量删除失败')
    }
  })
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.plan-manager {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-actions {
  display: flex;
  gap: 10px;
}
</style>