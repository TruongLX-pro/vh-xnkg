<script setup lang="ts">
import {
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  NotificationOutlined,
  TeamOutlined,
} from '@ant-design/icons-vue'
import viVN from 'ant-design-vue/es/locale/vi_VN'
import { computed, h } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import RequestDetailDrawer from '../components/RequestDetailDrawer.vue'
import TeacherPopupModal from '../components/TeacherPopupModal.vue'
import { useTeachingRequests } from '../composables/useTeachingRequests'

const route = useRoute()
const router = useRouter()
const { requests, stats } = useTeachingRequests()

const selectedMenu = computed(() => [route.name as string])

const menuItems = [
  { key: 'teacher', icon: () => h(TeamOutlined), label: 'Giáo viên' },
  { key: 'operations', icon: () => h(NotificationOutlined), label: 'Vận hành' },
]

const currentTitle = computed(() => String(route.meta.title ?? 'Module xác nhận lịch dạy'))
const currentSubtitle = computed(() => String(route.meta.subtitle ?? ''))

function handleMenuClick(info: { key: string }) {
  router.push(info.key === 'teacher' ? '/giao-vien' : '/van-hanh')
}
</script>

<template>
  <a-config-provider
    :locale="viVN"
    :theme="{
      token: {
        colorPrimary: '#1677ff',
        colorInfo: '#1677ff',
        borderRadius: 10,
        colorBgLayout: '#f3f5f7',
      },
    }"
  >
    <div class="min-h-screen bg-[#f3f5f7] text-slate-800">
      <div class="grid min-h-screen lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside class="border-r border-slate-200 bg-[#0f172a] px-4 py-5 text-slate-200">
          <div class="mb-6 flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/20 text-blue-200">
              <dashboard-outlined class="text-lg" />
            </div>
            <div>
              <div class="text-xs uppercase tracking-[0.24em] text-slate-400">ERP</div>
              <div class="text-sm font-semibold text-white">Xác nhận lịch dạy</div>
            </div>
          </div>

          <div class="mb-4 px-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Điều hướng
          </div>
          <a-menu
            :selected-keys="selectedMenu"
            mode="inline"
            theme="dark"
            :items="menuItems"
            @click="handleMenuClick"
          />

          <div class="mt-8 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Tổng quan nhanh
            </div>
            <div class="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5">
              <div class="flex items-center gap-2 text-sm">
                <clock-circle-outlined class="text-amber-300" />
                <span>Chờ xác nhận</span>
              </div>
              <span class="font-semibold text-white">{{ stats.Pending }}</span>
            </div>
            <div class="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5">
              <div class="flex items-center gap-2 text-sm">
                <check-circle-outlined class="text-emerald-300" />
                <span>Đã xác nhận</span>
              </div>
              <span class="font-semibold text-white">{{ stats.Confirmed }}</span>
            </div>
            <div class="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5">
              <div class="flex items-center gap-2 text-sm">
                <bell-outlined class="text-orange-300" />
                <span>Quá hạn</span>
              </div>
              <span class="font-semibold text-white">{{ stats.Expired }}</span>
            </div>
          </div>

          <div class="mt-8 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 p-4 text-sm leading-6 text-slate-300">
            <div class="mb-2 font-semibold text-white">Nguyên tắc nghiệp vụ</div>
            <div>ERP là nơi xác nhận chính thức.</div>
            <div>Telegram chỉ đóng vai trò nhắc việc và điều hướng về ERP.</div>
          </div>
        </aside>

        <div class="min-w-0">
          <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div class="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <div>
                <div class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Vận hành lớp học / Xác nhận lịch dạy
                </div>
                <h1 class="mt-1 text-2xl font-semibold text-slate-900">{{ currentTitle }}</h1>
                <p class="mt-1 text-sm text-slate-500">{{ currentSubtitle }}</p>
              </div>

              <div class="grid gap-3 sm:grid-cols-3">
                <div class="erp-summary-card">
                  <div class="erp-summary-label">Tổng request</div>
                  <div class="erp-summary-value">{{ requests.length }}</div>
                </div>
                <div class="erp-summary-card">
                  <div class="erp-summary-label">Đang chờ xử lý</div>
                  <div class="erp-summary-value text-amber-600">{{ stats.Pending + stats.Expired }}</div>
                </div>
                <div class="erp-summary-card">
                  <div class="erp-summary-label">Từ chối / Đã hủy</div>
                  <div class="erp-summary-value text-rose-600">{{ stats.Rejected + stats.Cancelled }}</div>
                </div>
              </div>
            </div>
          </header>

          <main class="px-5 py-5 lg:px-8">
            <RouterView />
          </main>
        </div>
      </div>

      <TeacherPopupModal />
      <RequestDetailDrawer />
    </div>
  </a-config-provider>
</template>
