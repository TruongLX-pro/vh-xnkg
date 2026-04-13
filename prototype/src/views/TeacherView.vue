<script setup lang="ts">
import { Empty } from 'ant-design-vue'
import { computed, ref } from 'vue'
import { useTeachingRequests } from '../composables/useTeachingRequests'
import type { RequestType } from '../types'

const teacherTab = ref<'pending' | 'history'>('pending')
const typeFilter = ref<'All' | RequestType>('All')
const classSearch = ref('')

const { teacherRequests, stats, getTypeLabel, getStatusColor, getStatusLabel, getSlaMeta, openDetail, openConfirm, openReject } =
  useTeachingRequests()

const rows = computed(() =>
  teacherRequests.value.filter((item) => {
    const statusMatched = teacherTab.value === 'pending' ? item.status === 'Pending' : item.status !== 'Pending'
    const typeMatched = typeFilter.value === 'All' || item.requestType === typeFilter.value
    const codeMatched = item.classCode.toLowerCase().includes(classSearch.value.trim().toLowerCase())
    return statusMatched && typeMatched && codeMatched
  }),
)

const columns = [
  { title: 'Mã lớp', dataIndex: 'classCode', key: 'classCode', width: 120 },
  { title: 'Loại yêu cầu', key: 'requestType', width: 170 },
  { title: 'Ngày bắt đầu', dataIndex: 'startDate', key: 'startDate', width: 130 },
  { title: 'Level', dataIndex: 'level', key: 'level', width: 110 },
  { title: 'Lịch học', dataIndex: 'scheduleSummary', key: 'scheduleSummary' },
  { title: 'Hạn xác nhận', dataIndex: 'deadlineConfirmAt', key: 'deadlineConfirmAt', width: 165 },
  { title: 'Trạng thái', key: 'status', width: 130 },
  { title: 'Hành động', key: 'actions', width: 220, fixed: 'right' as const },
]

const emptyImage = Empty.PRESENTED_IMAGE_SIMPLE
</script>

<template>
  <section class="space-y-5">
    <div class="grid gap-4 lg:grid-cols-3">
      <div class="erp-stat-card">
        <div class="erp-stat-label">Request chờ xác nhận</div>
        <div class="erp-stat-value text-amber-600">{{ stats.Pending }}</div>
        <div class="erp-stat-note">Cần giáo viên phản hồi trước SLA</div>
      </div>
      <div class="erp-stat-card">
        <div class="erp-stat-label">Đã xác nhận</div>
        <div class="erp-stat-value text-emerald-600">{{ stats.Confirmed }}</div>
        <div class="erp-stat-note">Đã đủ điều kiện yên tâm khai giảng</div>
      </div>
      <div class="erp-stat-card">
        <div class="erp-stat-label">Rủi ro cần xử lý</div>
        <div class="erp-stat-value text-rose-600">{{ stats.Expired + stats.Rejected }}</div>
        <div class="erp-stat-note">Bao gồm quá hạn và từ chối nhận lớp</div>
      </div>
    </div>

    <a-card :bordered="false" class="erp-panel">
      <div class="erp-panel-header">
        <div>
          <div class="erp-panel-eyebrow">Danh sách công việc</div>
          <div class="erp-panel-title">Lớp cần xác nhận</div>
        </div>
        <div class="erp-toolbar">
          <a-select
            v-model:value="typeFilter"
            class="erp-filter"
            :options="[
              { value: 'All', label: 'Tất cả loại yêu cầu' },
              { value: 'New Opening', label: 'Báo lớp khai giảng' },
              { value: 'Teacher Change', label: 'Đổi giáo viên' },
            ]"
          />
          <a-input v-model:value="classSearch" allow-clear placeholder="Tìm theo mã lớp" class="erp-filter-wide" />
        </div>
      </div>

      <div class="erp-subtabs">
        <a-button :type="teacherTab === 'pending' ? 'primary' : 'default'" @click="teacherTab = 'pending'">
          Chờ xác nhận
        </a-button>
        <a-button :type="teacherTab === 'history' ? 'primary' : 'default'" @click="teacherTab = 'history'">
          Lịch sử xử lý
        </a-button>
      </div>

      <a-table
        :columns="columns"
        :data-source="rows"
        :pagination="{ pageSize: 6, showSizeChanger: false }"
        row-key="id"
        :scroll="{ x: 1180 }"
        size="small"
      >
        <template #emptyText>
          <a-empty
            :image="emptyImage"
            description="Không có lớp phù hợp với điều kiện lọc hiện tại"
          />
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'classCode'">
            <div>
              <div class="font-medium text-slate-900">{{ record.classCode }}</div>
              <div class="text-xs text-slate-500">{{ record.className }}</div>
            </div>
          </template>
          <template v-else-if="column.key === 'requestType'">
            <div>
              <div>{{ getTypeLabel(record.requestType) }}</div>
              <div class="text-xs text-slate-500">{{ record.courseName }}</div>
            </div>
          </template>
          <template v-else-if="column.key === 'deadlineConfirmAt'">
            <div>
              <div>{{ record.deadlineConfirmAt }}</div>
              <a-tag class="mt-1" :color="getSlaMeta(record).tone">{{ getSlaMeta(record).label }}</a-tag>
            </div>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusLabel(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'actions'">
            <div class="flex flex-wrap gap-2">
              <a-button size="small" @click="openDetail(record)">Chi tiết</a-button>
              <a-button
                v-if="record.status === 'Pending'"
                size="small"
                type="primary"
                @click="openConfirm(record)"
              >
                Nhận lớp
              </a-button>
              <a-button
                v-if="record.status === 'Pending'"
                size="small"
                danger
                @click="openReject(record)"
              >
                Từ chối
              </a-button>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>
  </section>
</template>
