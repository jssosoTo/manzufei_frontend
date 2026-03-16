import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
    },
    {
      path: '/',
      component: () => import('../components/Layout/AppLayout.vue'),
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('../views/Dashboard.vue'),
          meta: { title: '首页' },
        },
        {
          path: 'patients',
          name: 'PatientList',
          component: () => import('../views/patient/PatientList.vue'),
          meta: { title: '患者管理' },
        },
        {
          path: 'patients/overview',
          name: 'PatientOverview',
          component: () => import('../views/patient/PatientOverview.vue'),
          meta: { title: '患者数据总览' },
        },
        {
          path: 'patients/create',
          name: 'PatientCreate',
          component: () => import('../views/patient/PatientCreate.vue'),
          meta: { title: '新增患者' },
        },
        {
          path: 'patients/:id',
          name: 'PatientDetail',
          component: () => import('../views/patient/PatientDetail.vue'),
          meta: { title: '患者详情' },
        },
        {
          path: 'training/manager',
          name: 'PlanManager',
          component: () => import('../views/training/PlanManager.vue'),
          meta: { title: '训练计划管理' },
        },
        {
          path: 'test/entry',
          name: 'TestEntry',
          component: () => import('../views/test/TestEntry.vue'),
          meta: { title: '体测录入' },
        },
        {
          path: 'data/import',
          name: 'DataImport',
          component: () => import('../views/data/DataImport.vue'),
          meta: { title: '数据导入' },
        },
        {
          path: 'system/users',
          name: 'UserList',
          component: () => import('../views/system/UserList.vue'),
          meta: { title: '用户管理' },
        },
      ],
    },
  ],
})

// Navigation guard
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
