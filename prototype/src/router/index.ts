import { createRouter, createWebHistory } from 'vue-router'
import AppShell from '../layouts/AppShell.vue'
import TeacherView from '../views/TeacherView.vue'
import OperationsView from '../views/OperationsView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: AppShell,
      redirect: '/giao-vien',
      children: [
        {
          path: '/giao-vien',
          name: 'teacher',
          component: TeacherView,
          meta: {
            title: 'Góc nhìn giáo viên',
            subtitle: 'Xác nhận nhận lớp, từ chối lớp và theo dõi lịch sử xử lý trên ERP.',
          },
        },
        {
          path: '/van-hanh',
          name: 'operations',
          component: OperationsView,
          meta: {
            title: 'Góc nhìn vận hành',
            subtitle: 'Theo dõi queue chờ xác nhận, quá hạn, từ chối và gửi nhắc lại.',
          },
        },
      ],
    },
  ],
})
