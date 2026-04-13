<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useTeachingRequests } from '../composables/useTeachingRequests'

const route = useRoute()
const { teacherPendingRequests, popupVisible, getTypeLabel, getStatusColor, openDetail, openConfirm } =
  useTeachingRequests()
</script>

<template>
  <a-modal
    v-if="route.name === 'teacher'"
    v-model:open="popupVisible"
    :footer="null"
    width="720px"
    title="Bạn có lớp mới cần xác nhận"
  >
    <div class="space-y-4">
      <a-alert
        type="warning"
        show-icon
        message="Popup dành cho giáo viên"
        description="Chỉ hiển thị các request ở trạng thái Chờ xác nhận và điều hướng giáo viên vào ERP để xác nhận."
      />
      <div
        v-for="item in teacherPendingRequests.slice(0, 3)"
        :key="item.id"
        class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
      >
        <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-slate-900">{{ item.classCode }}</span>
              <a-tag :color="getStatusColor(item.status)">
                {{ getTypeLabel(item.requestType) }}
              </a-tag>
            </div>
            <div class="text-sm text-slate-600">{{ item.startDate }} | {{ item.scheduleSummary }}</div>
            <div class="text-sm text-slate-600">Level: {{ item.level }}</div>
            <div class="text-sm font-medium text-amber-700">
              Hạn xác nhận: {{ item.deadlineConfirmAt }}
            </div>
          </div>
          <div class="flex gap-2">
            <a-button @click="openDetail(item)">Chi tiết</a-button>
            <a-button type="primary" @click="openConfirm(item)">Xác nhận ngay</a-button>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>
