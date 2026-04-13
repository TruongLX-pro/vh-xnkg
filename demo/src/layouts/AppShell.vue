<script setup lang="ts">
import { DashboardOutlined, NotificationOutlined, UserOutlined } from '@ant-design/icons-vue'
import type { MenuProps } from 'ant-design-vue'
import viVN from 'ant-design-vue/es/locale/vi_VN'
import { computed, h, onMounted } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import RequestDetailDrawer from '../components/request/RequestDetailDrawer.vue'
import { useTeachingRequestStore } from '../stores/teachingRequest'

const route = useRoute()
const router = useRouter()
const store = useTeachingRequestStore()

onMounted(() => {
  store.loadRequests()
})

const selectedMenu = computed(() => [String(route.name ?? 'operations')])
const currentTitle = computed(() => String(route.meta.title ?? 'Quản lý thông báo giáo viên'))

const menuItems = [
  { key: 'operations', icon: () => h(NotificationOutlined), label: 'Vận hành' },
  { key: 'teacher', icon: () => h(UserOutlined), label: 'Giáo viên' },
]

function handleMenuClick({ key }: Parameters<NonNullable<MenuProps['onClick']>>[0]) {
  router.push(key === 'teacher' ? '/giao-vien' : '/van-hanh')
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
              <div class="text-sm font-semibold text-white">Thông báo giáo viên</div>
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

          <div class="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
            <div class="mb-2 font-semibold text-white">Luồng xác nhận mới</div>
            <div>Telegram luôn kèm link ERP để giáo viên xác nhận hoặc từ chối ngay trên hệ thống.</div>
            <div>Vận hành vẫn theo dõi toàn bộ queue và có thể can thiệp khi cần.</div>
          </div>
        </aside>

        <div class="min-w-0">
          <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div class="px-5 py-4 lg:px-8">
              <h1 class="text-2xl font-semibold text-slate-900">{{ currentTitle }}</h1>
            </div>
          </header>

          <main class="px-5 py-5 lg:px-8">
            <RouterView />
          </main>
        </div>
      </div>

      <RequestDetailDrawer />
    </div>
  </a-config-provider>
</template>
