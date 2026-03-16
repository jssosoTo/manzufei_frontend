<template>
  <div class="user-list-container">
    <!-- Filter Bar -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="用户名">
          <el-input v-model="filterForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="filterForm.real_name" placeholder="请输入真实姓名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- User Table -->
    <el-card class="table-card">
      <div class="table-header">
        <el-button type="primary" @click="openCreateDialog">新建用户</el-button>
      </div>
      <el-table :data="userList" border v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="real_name" label="真实姓名" />
        <el-table-column prop="role" label="角色">
          <template #default="scope">
            {{ getRoleText(scope.row.role) }}
          </template>
        </el-table-column>
        <el-table-column prop="department" label="部门" />
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="last_login" label="最后登录时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button link type="warning" @click="handleResetPassword(scope.row)">重置密码</el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'create' ? '新建用户' : '编辑用户'"
      width="500px"
      @close="resetDialogForm"
    >
      <el-form
        ref="dialogFormRef"
        :model="dialogForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="dialogForm.username" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item
          label="密码"
          prop="password"
          v-if="dialogType === 'create'"
        >
          <el-input v-model="dialogForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="真实姓名" prop="real_name">
          <el-input v-model="dialogForm.real_name" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="dialogForm.role" placeholder="请选择角色">
            <el-option label="医生" :value="1" />
            <el-option label="护士" :value="2" />
            <el-option label="管理员" :value="9" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-input v-model="dialogForm.department" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="dialogForm.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="dialogForm.email" />
        </el-form-item>
        <el-form-item label="状态" prop="status" v-if="dialogType === 'edit'">
           <el-radio-group v-model="dialogForm.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getUsers, createUser, updateUser, deleteUser, resetPassword } from '../../api/user'
import type { User, UserFilter, CreateUserRequest, UpdateUserRequest } from '../../types/user'

// State
const loading = ref(false)
const userList = ref<User[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const filterForm = reactive({
  username: '',
  real_name: ''
})

const dialogVisible = ref(false)
const dialogType = ref<'create' | 'edit'>('create')
const submitting = ref(false)
const dialogFormRef = ref<FormInstance>()

const dialogForm = reactive({
  id: 0,
  username: '',
  password: '',
  real_name: '',
  role: 1,
  department: '',
  phone: '',
  email: '',
  status: 1
})

const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ],
  real_name: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
})

// Methods
const getRoleText = (role: number) => {
  const map: Record<number, string> = {
    1: '医生',
    2: '护士',
    9: '管理员'
  }
  return map[role] || '未知'
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const params: UserFilter = {
      page: currentPage.value,
      limit: pageSize.value,
      username: filterForm.username || undefined,
      real_name: filterForm.real_name || undefined
    }
    const res: any = await getUsers(params)
    // Check if res has list and total properties directly, or if they are nested
    if (res && typeof res.total === 'number') {
        userList.value = res.list || res.items || []
        total.value = res.total
    } else if (Array.isArray(res)) {
        // Fallback if API returns just an array
        userList.value = res
        total.value = res.length
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchUsers()
}

const resetFilter = () => {
  filterForm.username = ''
  filterForm.real_name = ''
  handleSearch()
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchUsers()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchUsers()
}

const openCreateDialog = () => {
  dialogType.value = 'create'
  dialogVisible.value = true
}

const openEditDialog = (row: User) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  
  // Fill form
  dialogForm.id = row.id
  dialogForm.username = row.username
  dialogForm.real_name = row.real_name
  dialogForm.role = row.role
  dialogForm.department = row.department
  dialogForm.phone = row.phone || ''
  dialogForm.email = row.email || ''
  dialogForm.status = row.status
  dialogForm.password = '' // Password not needed for edit unless changing
}

const resetDialogForm = () => {
  if (dialogFormRef.value) {
    dialogFormRef.value.resetFields()
  }
  // Manually reset non-form fields if any
  dialogForm.id = 0
  dialogForm.status = 1
  dialogForm.username = ''
  dialogForm.password = ''
  dialogForm.real_name = ''
  dialogForm.role = 1
  dialogForm.department = ''
  dialogForm.phone = ''
  dialogForm.email = ''
}

const submitForm = async () => {
  if (!dialogFormRef.value) return
  
  await dialogFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (dialogType.value === 'create') {
          const req: CreateUserRequest = {
            username: dialogForm.username,
            password: dialogForm.password,
            real_name: dialogForm.real_name,
            role: dialogForm.role,
            department: dialogForm.department,
            phone: dialogForm.phone,
            email: dialogForm.email
          }
          await createUser(req)
          ElMessage.success('创建成功')
        } else {
          const req: UpdateUserRequest = {
            real_name: dialogForm.real_name,
            role: dialogForm.role,
            department: dialogForm.department,
            phone: dialogForm.phone,
            email: dialogForm.email,
            status: dialogForm.status
          }
          await updateUser(dialogForm.id, req)
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
        fetchUsers()
      } catch (error) {
        console.error(error)
      } finally {
        submitting.value = false
      }
    }
  })
}

const handleDelete = (row: User) => {
  ElMessageBox.confirm(
    `确定要删除用户 "${row.username}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await deleteUser(row.id)
      ElMessage.success('删除成功')
      fetchUsers()
    } catch (error) {
      console.error(error)
    }
  })
}

const handleResetPassword = (row: User) => {
  ElMessageBox.confirm(
    `确定要重置用户 "${row.username}" 的密码吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await resetPassword(row.id)
      ElMessage.success('密码重置成功')
    } catch (error) {
      console.error(error)
    }
  })
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-list-container {
  padding: 20px;
}
.filter-card {
  margin-bottom: 20px;
}
.table-header {
  margin-bottom: 15px;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
