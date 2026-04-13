<script setup lang="ts">
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  PhoneOutlined,
  PlusOutlined,
  RedoOutlined,
} from '@ant-design/icons-vue'
import { Empty } from 'ant-design-vue'
import type { RequestItem, RequestStatus, RequestType, SourceDepartment } from '../../types'
import {
  getConfirmationMeta,
  getSlaMeta,
  getSourceLabel,
  getStatusColor,
  getStatusLabel,
  getTypeLabel,
  getTypeTone,
} from '../../utils/requestPresentation'

const props = defineProps<{
  rows: RequestItem[]
  statusTab: RequestStatus
  typeFilter: 'All' | RequestType
  sourceFilter: 'All' | SourceDepartment
  classSearch: string
  teacherSearch: string
  startDateFrom?: string
  startDateTo?: string
  deadlineFrom?: string
  deadlineTo?: string
}>()

const emit = defineEmits<{
  'update:statusTab': [value: RequestStatus]
  'update:typeFilter': [value: 'All' | RequestType]
  'update:sourceFilter': [value: 'All' | SourceDepartment]
  'update:classSearch': [value: string]
  'update:teacherSearch': [value: string]
  'update:startDateFrom': [value?: string]
  'update:startDateTo': [value?: string]
  'update:deadlineFrom': [value?: string]
  'update:deadlineTo': [value?: string]
  detail: [request: RequestItem]
  resend: [request: RequestItem]
  reject: [request: RequestItem]
  confirm: [request: RequestItem]
  'open-manual': []
  reset: []
}>()

const columns = [
  { title: 'Mã lớp', dataIndex: 'classCode', key: 'classCode', width: 145 },
  { title: 'Giáo viên', dataIndex: 'teacherName', key: 'teacherName', width: 185 },
  { title: 'Loại thông báo', key: 'requestType', width: 185 },
  { title: 'Nguồn', key: 'sourceDepartment', width: 90 },
  { title: 'Ngày bắt đầu', dataIndex: 'startDate', key: 'startDate', width: 120 },
  { title: 'Lịch học', dataIndex: 'scheduleSummary', key: 'scheduleSummary', width: 180 },
  { title: 'Hạn phản hồi', dataIndex: 'deadlineConfirmAt', key: 'deadlineConfirmAt', width: 170 },
  { title: 'Trạng thái', key: 'status', width: 120 },
  { title: 'Last update', key: 'lastUpdate', width: 190 },
  { title: 'Hành động', key: 'actions', width: 160, fixed: 'right' as const },
]

const statuses: RequestStatus[] = [
  'AwaitingConfirmation',
  'Confirmed',
  'Rejected',
  'Expired',
  'InformationSent',
]

const emptyImage = Empty.PRESENTED_IMAGE_SIMPLE
</script>

<template>
  <a-card :bordered="false" class="erp-panel">
    <div class="erp-panel-header">
      <div class="erp-toolbar erp-toolbar-wrap">
        <a-input
          :value="props.classSearch"
          allow-clear
          placeholder="Mã lớp"
          class="erp-filter"
          @update:value="emit('update:classSearch', $event)"
        />
        <a-input
          :value="props.teacherSearch"
          allow-clear
          placeholder="Giáo viên / mã GV"
          class="erp-filter"
          @update:value="emit('update:teacherSearch', $event)"
        />
        <a-date-picker
          :value="props.startDateFrom"
          value-format="DD/MM/YYYY"
          placeholder="Ngày bắt đầu từ"
          class="erp-filter"
          @update:value="emit('update:startDateFrom', $event)"
        />
        <a-date-picker
          :value="props.startDateTo"
          value-format="DD/MM/YYYY"
          placeholder="Ngày bắt đầu đến"
          class="erp-filter"
          @update:value="emit('update:startDateTo', $event)"
        />
        <a-select
          :value="props.typeFilter"
          class="erp-filter"
          :options="[
            { value: 'All', label: 'Tất cả loại thông báo' },
            { value: 'New Opening', label: 'Báo lớp khai giảng' },
            { value: 'Teacher Handover', label: 'Báo lớp chuyển ngang' },
            { value: 'Schedule Change', label: 'Báo đổi lịch học' },
            { value: 'Class Ended', label: 'Báo lớp kết thúc' },
            { value: 'Other', label: 'Khác' },
          ]"
          @update:value="emit('update:typeFilter', $event)"
        />
        <a-select
          :value="props.sourceFilter"
          class="erp-filter"
          :options="[
            { value: 'All', label: 'Tất cả nguồn' },
            { value: 'GVU', label: 'GVU' },
            { value: 'CM', label: 'CM' },
          ]"
          @update:value="emit('update:sourceFilter', $event)"
        />
        <a-date-picker
          :value="props.deadlineFrom"
          value-format="DD/MM/YYYY"
          placeholder="Hạn phản hồi từ"
          class="erp-filter"
          @update:value="emit('update:deadlineFrom', $event)"
        />
        <a-date-picker
          :value="props.deadlineTo"
          value-format="DD/MM/YYYY"
          placeholder="Hạn phản hồi đến"
          class="erp-filter"
          @update:value="emit('update:deadlineTo', $event)"
        />
        <a-button @click="emit('reset')">Xóa bộ lọc</a-button>
      </div>
    </div>

    <div class="flex items-center justify-between gap-4">
      <div class="erp-subtabs">
        <a-button
          v-for="status in statuses"
          :key="status"
          :type="props.statusTab === status ? 'primary' : 'default'"
          @click="emit('update:statusTab', status)"
        >
          {{ getStatusLabel(status) }}
        </a-button>
      </div>

      <a-button type="primary" @click="emit('open-manual')">
        <template #icon>
          <plus-outlined />
        </template>
        Thêm thông báo thủ công
      </a-button>
    </div>

    <a-table
      :columns="columns"
      :data-source="props.rows"
      :pagination="{ pageSize: 20, showSizeChanger: false }"
      row-key="id"
      :scroll="{ x: 1540 }"
      table-layout="fixed"
      size="small"
    >
      <template #emptyText>
        <a-empty
          :image="emptyImage"
          :description="`Không có request ở trạng thái ${getStatusLabel(props.statusTab).toLowerCase()} theo bộ lọc hiện tại`"
        />
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'classCode'">
          <div>
            <div class="font-medium text-slate-900">{{ record.classCode }}</div>
            <div class="text-xs text-slate-500">{{ record.className }}</div>
          </div>
        </template>
        <template v-else-if="column.key === 'teacherName'">
          <div class="min-w-0">
            <div class="flex items-center gap-1">
              <a-button size="small" type="text" :href="`tel:${record.teacherPhone}`">
                <phone-outlined />
              </a-button>
              <span class="truncate font-medium text-slate-900">{{ record.teacherName }}</span>
            </div>
            <div class="truncate text-xs text-slate-500">{{ record.teacherCode }} · {{ record.teacherType }}</div>
            <div class="truncate text-xs text-slate-500">TC: {{ record.teacherCareName }}</div>
            <a-tag v-if="record.teacherHandoverRole" class="mt-1" color="purple">
              {{ record.teacherHandoverRole }}
            </a-tag>
          </div>
        </template>
        <template v-else-if="column.key === 'requestType'">
          <a-tag :color="getTypeTone(record.requestType)" class="border-0 whitespace-normal">
            {{ getTypeLabel(record.requestType) }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'sourceDepartment'">
          {{ getSourceLabel(record.sourceDepartment) }}
        </template>
        <template v-else-if="column.key === 'deadlineConfirmAt'">
          <div>
            <div>{{ record.deadlineConfirmAt || '-' }}</div>
            <a-tag class="mt-1" :color="getSlaMeta(record).tone">{{ getSlaMeta(record).label }}</a-tag>
          </div>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag :color="getStatusColor(record.status)">{{ getStatusLabel(record.status) }}</a-tag>
        </template>
        <template v-else-if="column.key === 'lastUpdate'">
          <div>
            <div class="font-medium text-slate-900">{{ record.events[0]?.actor || '-' }}</div>
            <div class="text-xs text-slate-500">{{ record.events[0]?.time || '-' }}</div>
            <a-tag
              v-if="record.status === 'Confirmed' && getConfirmationMeta(record)"
              class="mt-1"
              :color="getConfirmationMeta(record)?.tone"
            >
              {{ getConfirmationMeta(record)?.label }}
            </a-tag>
          </div>
        </template>
        <template v-else-if="column.key === 'actions'">
          <div class="flex items-center gap-2">
            <a-tooltip title="Chi tiết">
              <button type="button" class="action-icon-btn action-icon-btn-neutral" @click="emit('detail', record)">
                <eye-outlined />
              </button>
            </a-tooltip>

            <a-tooltip v-if="record.status === 'AwaitingConfirmation'" title="Chuyển xác nhận">
              <button type="button" class="action-icon-btn action-icon-btn-primary" @click="emit('confirm', record)">
                <check-outlined />
              </button>
            </a-tooltip>

            <a-tooltip
              v-if="
                record.status === 'AwaitingConfirmation'
                  || record.status === 'Expired'
                  || record.status === 'InformationSent'
              "
              title="Gửi lại Telegram"
            >
              <button type="button" class="action-icon-btn action-icon-btn-primary-outline" @click="emit('resend', record)">
                <redo-outlined />
              </button>
            </a-tooltip>

            <a-tooltip v-if="record.status === 'AwaitingConfirmation'" title="Chuyển từ chối">
              <button type="button" class="action-icon-btn action-icon-btn-danger-outline" @click="emit('reject', record)">
                <close-outlined />
              </button>
            </a-tooltip>
          </div>
        </template>
      </template>
    </a-table>
  </a-card>
</template>

<style scoped>
.action-icon-btn {
  width: 28px;
  height: 28px;
  border: 1px solid transparent;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  padding: 0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-icon-btn :deep(.anticon) {
  font-size: 14px;
  line-height: 1;
}

.action-icon-btn-neutral {
  color: #475569;
  border-color: #cbd5e1;
  background: #fff;
}

.action-icon-btn-neutral:hover {
  color: #0f172a;
  border-color: #94a3b8;
}

.action-icon-btn-primary {
  color: #fff;
  background: #1677ff;
}

.action-icon-btn-primary:hover {
  background: #0958d9;
}

.action-icon-btn-primary-outline {
  color: #1677ff;
  border-color: #91caff;
  background: #f0f7ff;
}

.action-icon-btn-primary-outline:hover {
  border-color: #1677ff;
  background: #e6f4ff;
}

.action-icon-btn-danger-outline {
  color: #ff4d4f;
  border-color: #ffccc7;
  background: #fff2f0;
}

.action-icon-btn-danger-outline:hover {
  border-color: #ff4d4f;
  background: #fff1f0;
}
</style>
