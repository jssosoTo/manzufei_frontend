<template>
  <div>
    <el-card>
      <div class="toolbar">
        <div class="search-area">
          <el-input v-model="searchName" placeholder="搜索患者姓名" clearable style="width: 200px" @clear="loadData" @keyup.enter="loadData" />
          <el-select v-model="searchGender" placeholder="性别" clearable style="width: 100px" @change="loadData">
            <el-option label="男" :value="1" />
            <el-option label="女" :value="0" />
          </el-select>
          <el-button type="primary" @click="loadData">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
        <div>
          <el-button type="danger" @click="handleBatchDelete" v-if="selectedRows.length > 0" style="margin-right: 10px">批量删除</el-button>
          <el-button type="success" @click="importDialogVisible = true" style="margin-right: 10px">导入患者</el-button>
          <el-button type="primary" @click="showForm()">新增患者</el-button>
        </div>
      </div>

      <el-table :data="patients" stripe v-loading="loading" style="margin-top: 16px" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="patient_id" label="编号" width="80" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="gender_text" label="性别" width="60" />
        <el-table-column prop="age" label="年龄" width="60" />
        <el-table-column prop="phone" label="电话" width="130" />
        <el-table-column prop="last_test_date" label="最后检测" width="110" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="$router.push(`/patients/${row.patient_id}`)">查看</el-button>
            <el-button link type="primary" @click="showForm(row)">编辑</el-button>
            <el-popconfirm title="确认删除该患者？" @confirm="handleDelete(row.patient_id)">
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-if="total > 0"
        style="margin-top: 16px; justify-content: flex-end"
        :current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
      />
    </el-card>

    <!-- Patient Form Dialog -->
    <el-dialog v-model="formVisible" :title="editingPatient ? '编辑患者' : '新增患者'" width="600px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="患者编号" prop="patient_id">
              <el-input v-model="form.patient_id" :disabled="!!editingPatient" placeholder="如: 001" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="出生日期" prop="birth_date">
              <el-date-picker v-model="form.birth_date" type="date" value-format="YYYY-MM-DD" style="width: 100%" @change="onBirthDateChange" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年龄" prop="age">
              <el-input-number v-model="form.age" :min="0" :max="150" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="form.gender">
                <el-radio :value="1">男</el-radio>
                <el-radio :value="0">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电话" prop="phone">
              <el-input v-model="form.phone" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="紧急联系人" prop="emergency_contact">
              <el-input v-model="form.emergency_contact" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="紧急电话" prop="emergency_phone">
              <el-input v-model="form.emergency_phone" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="既往病史" prop="medical_history">
          <el-input v-model="form.medical_history" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="过敏信息" prop="allergy_info">
          <el-input v-model="form.allergy_info" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  
      <!-- Import Dialog -->
      <el-dialog
        v-model="importDialogVisible"
        title="导入患者"
        width="500px"
        destroy-on-close
      >
        <div style="text-align: center">
          <el-upload
            ref="uploadRef"
            class="upload-demo"
            drag
            action=""
            :auto-upload="false"
            :on-change="handleFileChange"
            :limit="1"
            accept=".xlsx,.xls"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              拖拽文件到此处或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                只能上传 xlsx/xls 文件，且不超过 10MB
                <el-button link type="primary" @click="handleDownloadTemplate">下载模板</el-button>
              </div>
            </template>
          </el-upload>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="importDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleImport" :loading="importLoading">
              确定导入
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getPatientList, createPatient, updatePatient, deletePatient, batchDeletePatients } from '../../api/patient'
import { importPatients, downloadTemplate } from '../../api/importExport'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, UploadFile, UploadInstance } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const patients = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const selectedRows = ref<any[]>([])
const searchName = ref('')
const searchGender = ref<number | undefined>(undefined)

const formVisible = ref(false)
const formRef = ref<FormInstance>()
const editingPatient = ref<any>(null)
const submitting = ref(false)

const importDialogVisible = ref(false)
const importLoading = ref(false)
const uploadRef = ref<UploadInstance>()
const selectedFile = ref<File | null>(null)

const form = reactive({
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

const formRules = {
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

onMounted(() => loadData())

function onBirthDateChange(val: string) {
  if (val) {
    const birthYear = new Date(val).getFullYear()
    const currentYear = new Date().getFullYear()
    form.age = currentYear - birthYear
  } else {
    form.age = null
  }
}

async function loadData() {
  loading.value = true
  try {
    const res: any = await getPatientList({
      name: searchName.value,
      gender: searchGender.value,
      page: page.value,
      page_size: pageSize.value,
    })
    patients.value = res.list || []
    total.value = res.total || 0
  } catch {} finally {
    loading.value = false
  }
}

function resetSearch() {
  searchName.value = ''
  searchGender.value = undefined
  page.value = 1
  loadData()
}

function handlePageChange(p: number) {
  page.value = p
  loadData()
}

function handleDownloadTemplate() {
  downloadTemplate()
    .then((res: any) => {
      const url = window.URL.createObjectURL(new Blob([res]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'patient_import_template.xlsx')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    })
    .catch(() => {
      ElMessage.error('下载模板失败')
    })
}

function handleFileChange(file: UploadFile) {
  if (file.raw) {
    selectedFile.value = file.raw
  }
}

async function handleImport() {
  if (!selectedFile.value) {
    ElMessage.warning('请选择文件')
    return
  }
  
  importLoading.value = true
  try {
    const isExcel = /\.(xlsx|xls)$/.test(selectedFile.value.name)
    if (!isExcel) {
        ElMessage.error('请上传 Excel 文件')
        importLoading.value = false
        return
    }

    const res: any = await importPatients(selectedFile.value)
    
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
      importDialogVisible.value = false
    }

    uploadRef.value?.clearFiles()
    selectedFile.value = null
    loadData()
  } catch (error) {
    console.error(error)
    ElMessage.error('导入失败')
  } finally {
    importLoading.value = false
  }
}

function showForm(patient?: any) {
  if (!patient) {
    router.push('/patients/create')
    return
  }
  editingPatient.value = patient || null
  if (patient) {
    Object.assign(form, {
      patient_id: patient.patient_id,
      name: patient.name,
      gender: patient.gender,
      birth_date: patient.birth_date || '',
      age: patient.age,
      phone: patient.phone || '',
      address: patient.address || '',
      emergency_contact: patient.emergency_contact || '',
      emergency_phone: patient.emergency_phone || '',
      medical_history: patient.medical_history || '',
      allergy_info: patient.allergy_info || '',
    })
  } else {
    Object.assign(form, {
      patient_id: '', name: '', gender: 1, birth_date: '', age: null,
      phone: '', address: '', emergency_contact: '', emergency_phone: '',
      medical_history: '', allergy_info: '',
    })
  }
  formVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    if (editingPatient.value) {
      await updatePatient(form.patient_id, form)
      ElMessage.success('更新成功')
    } else {
      await createPatient(form)
      ElMessage.success('创建成功')
    }
    formVisible.value = false
    loadData()
  } catch {} finally {
    submitting.value = false
  }
}

async function handleDelete(id: string) {
  try {
    await deletePatient(id)
    ElMessage.success('删除成功')
    loadData()
  } catch {}
}

function handleSelectionChange(val: any[]) {
  selectedRows.value = val
}

function handleBatchDelete() {
  if (selectedRows.value.length === 0) return

  ElMessageBox.confirm(`确认删除选中的 ${selectedRows.value.length} 名患者吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = selectedRows.value.map((row: any) => row.patient_id)
      await batchDeletePatients(ids)
      ElMessage.success('批量删除成功')
      loadData()
      selectedRows.value = []
    } catch (error) {
      console.error(error)
    }
  })
}
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.search-area {
  display: flex;
  gap: 8px;
}
</style>
