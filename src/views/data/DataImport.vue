<template>
  <div class="data-import-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>数据导入</span>
        </div>
      </template>

      <el-alert
        title="导入说明"
        type="info"
        description="请先下载对应的导入模板，按照模板格式填写数据后上传。对于'完整汇总数据'，请使用特定的汇总Excel文件。"
        show-icon
        style="margin-bottom: 20px"
        :closable="false"
      />

      <el-form label-width="120px" class="import-form">
        <el-form-item label="导入类型">
          <el-radio-group v-model="importType">
            <el-radio value="patients">患者信息</el-radio>
            <el-radio value="test-data">体测数据</el-radio>
            <el-radio value="comprehensive">完整汇总数据(两次检测)</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="操作" v-if="importType !== 'comprehensive'">
          <el-button type="primary" plain @click="handleDownloadTemplate">
            <el-icon><Download /></el-icon> 下载模板
          </el-button>
        </el-form-item>

        <el-divider />

        <el-form-item label="上传文件">
          <el-upload
            ref="uploadRef"
            class="upload-demo"
            drag
            action="#"
            :auto-upload="false"
            :limit="1"
            :on-change="handleFileChange"
            :on-exceed="handleExceed"
            :file-list="fileList"
            accept=".xlsx,.xls"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                仅支持 .xlsx / .xls 格式文件，文件大小不超过 10MB
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitUpload" :loading="uploading">
            开始导入
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox, type UploadInstance, type UploadProps, type UploadUserFile } from 'element-plus'
import { Download, UploadFilled } from '@element-plus/icons-vue'
import { importPatients, importTestData, importComprehensiveData, downloadTemplate } from '@/api/importExport'

const importType = ref('comprehensive')
const uploadRef = ref<UploadInstance>()
const fileList = ref<UploadUserFile[]>([])
const uploading = ref(false)

const handleExceed: UploadProps['onExceed'] = (files) => {
  uploadRef.value!.clearFiles()
  const file = files[0] as UploadUserFile
  uploadRef.value!.handleStart(file as any)
}

const handleFileChange: UploadProps['onChange'] = (uploadFile, uploadFiles) => {
  fileList.value = uploadFiles.slice(-1)
}

const handleDownloadTemplate = async () => {
  try {
    const res: any = await downloadTemplate()
    // Handle blob response
    // Check if res is a Blob or if the interceptor returned the blob
    const blob = res instanceof Blob ? res : new Blob([res])
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'import_template.xlsx')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Download template error', error)
    ElMessage.error('下载模板失败')
  }
}

const submitUpload = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择文件')
    return
  }

  const file = fileList.value[0].raw
  if (!file) return

  uploading.value = true
  try {
    let res: any
    if (importType.value === 'patients') {
      res = await importPatients(file)
    } else if (importType.value === 'test-data') {
      res = await importTestData(file)
    } else if (importType.value === 'comprehensive') {
      res = await importComprehensiveData(file)
    }

    // Adapt to the response structure. 
    // If the interceptor unwraps data, res might be the data object directly.
    // The spec says "returns a summary of success/failure counts."
    const data = res?.data || res
    
    const successCount = data.success_count !== undefined ? data.success_count : (data.success ? 1 : 0)
    const failureCount = data.failure_count !== undefined ? data.failure_count : 0
    const message = data.message || '导入完成'

    ElMessageBox.alert(
      `<div>${message}</div><div>成功: ${successCount}</div><div>失败: ${failureCount}</div>`, 
      '导入结果', 
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定',
        type: 'success'
      }
    )
    
    fileList.value = [] // Clear file after success
    uploadRef.value!.clearFiles()
  } catch (error: any) {
    console.error('Import error', error)
    const errorMsg = error.response?.data?.message || error.message || '导入失败，请检查文件格式'
    ElMessage.error(errorMsg)
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.data-import-container {
  padding: 20px;
}
.import-form {
  max-width: 600px;
  margin-top: 20px;
}
</style>
