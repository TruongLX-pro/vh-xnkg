import { createRouter, createWebHistory } from 'vue-router'
import AppShell from '../layouts/AppShell.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: AppShell,
      redirect: '/van-hanh',
      children: [
        {
          path: '/van-hanh',
          name: 'operations',
          component: () => import('../views/OperationsView.vue'),
          meta: {
            title: 'Quản lý thông báo giáo viên',
          },
        },
        {
          path: '/giao-vien',
          name: 'teacher',
          component: () => import('../views/TeacherView.vue'),
          meta: {
            title: 'Giáo viên xác nhận thông báo',
          },
        },
      ],
    },
  ],
})
