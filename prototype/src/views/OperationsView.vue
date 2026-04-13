<script setup lang="ts">
import { Empty } from 'ant-design-vue'
import { computed, ref } from 'vue'
import { useTeachingRequests } from '../composables/useTeachingRequests'
import type { RequestStatus, RequestType, SourceDepartment } from '../types'

const statusTab = ref<RequestStatus>('Pending')
const typeFilter = ref<'All' | RequestType>('All')
const sourceFilter = ref<'All' | SourceDepartment>('All')
const priorityFilter = ref<'All' | 'urgent'>('All')
const classSearch = ref('')
const teacherSearch = ref('')
const startDateFrom = ref<string>()
const startDateTo = ref<string>()
const deadlineFrom = ref<string>()
const deadlineTo = ref<string>()

const {
  requests,
  stats,
  getTypeLabel,
  getStatusColor,
  getStatusLabel,
  getSourceLabel,
  getSlaMeta,
  getConfirmationMeta,
  isDateInRange,
  openDetail,
  resend,
} = useTeachingRequests()

const rows = computed(() =>
  requests.value.filter((item) => {
    const statusMatched = item.status === statusTab.value
    const typeMatched = typeFilter.value === 'All' || item.requestType === typeFilter.value
    const sourceMatched = sourceFilter.value === 'All' || item.sourceDepartment === sourceFilter.value
    const priorityMatched =
      priorityFilter.value === 'All' ||
      ['Sắp hết hạn', 'Cần ưu tiên', 'Quá hạn SLA'].includes(getSlaMeta(item).label)
    const startDateMatched = isDateInRange(item.startDate, startDateFrom.value, startDateTo.value)
    const deadlineMatched = isDateInRange(
      item.deadlineConfirmAt.split(' ')[0],
      deadlineFrom.value,
      deadlineTo.value,
    )
    const codeMatched = item.classCode.toLowerCase().includes(classSearch.value.trim().toLowerCase())
    const teacherMatched = item.teacherName
      .toLowerCase()
      .includes(teacherSearch.value.trim().toLowerCase())

    return (
      statusMatched &&
      typeMatched &&
      sourceMatched &&
      priorityMatched &&
      startDateMatched &&
      deadlineMatched &&
      codeMatched &&
      teacherMatched
    )
  }),
)

const columns = [
  { title: 'Mã lớp', dataIndex: 'classCode', key: 'classCode', width: 120 },
  { title: 'Giáo viên', dataIndex: 'teacherName', key: 'teacherName', width: 170 },
  { title: 'Loại yêu cầu', key: 'requestType', width: 180 },
  { title: 'Nguồn phát sinh', key: 'sourceDepartment', width: 140 },
  { title: 'Ngày bắt đầu', dataIndex: 'startDate', key: 'startDate', width: 130 },
  { title: 'Lịch học', dataIndex: 'scheduleSummary', key: 'scheduleSummary', width: 220 },
  { title: 'Hạn xác nhận', dataIndex: 'deadlineConfirmAt', key: 'deadlineConfirmAt', width: 170 },
  { title: 'Theo dõi thêm', key: 'contextInfo', width: 210 },
  { title: 'Trạng thái', key: 'status', width: 130 },
  { title: 'Hành động', key: 'actions', width: 220, fixed: 'right' as const },
]

const statuses: RequestStatus[] = ['Pending', 'Confirmed', 'Rejected', 'Expired', 'Cancelled']
const emptyImage = Empty.PRESENTED_IMAGE_SIMPLE

function resetFilters() {
  typeFilter.value = 'All'
  sourceFilter.value = 'All'
  priorityFilter.value = 'All'
  classSearch.value = ''
  teacherSearch.value = ''
  startDateFrom.value = undefined
  startDateTo.value = undefined
  deadlineFrom.value = undefined
  deadlineTo.value = undefined
}
</script>

<template>
  <section class="space-y-5">
    <div class="grid gap-4 lg:grid-cols-4">
      <div class="erp-stat-card">
        <div class="erp-stat-label">Chờ xác nhận</div>
        <div class="erp-stat-value text-amber-600">{{ stats.Pending }}</div>
        <div class="erp-stat-note">Queue cần theo dõi hằng ngày</div>
      </div>
      <div class="erp-stat-card">
        <div class="erp-stat-label">Đã xác nhận</div>
        <div class="erp-stat-value text-emerald-600">{{ stats.Confirmed }}</div>
        <div class="erp-stat-note">Đã đủ điều kiện triển khai lớp</div>
      </div>
      <div class="erp-stat-card">
        <div class="erp-stat-label">Từ chối</div>
        <div class="erp-stat-value text-rose-600">{{ stats.Rejected }}</div>
        <div class="erp-stat-note">Cần đổi giáo viên thay thế</div>
      </div>
      <div class="erp-stat-card">
        <div class="erp-stat-label">Quá hạn</div>
        <div class="erp-stat-value text-orange-600">{{ stats.Expired }}</div>
        <div class="erp-stat-note">Vượt SLA xác nhận trên hệ thống</div>
      </div>
    </div>

    <a-card :bordered="false" class="erp-panel">
      <div class="erp-panel-header">
        <div>
          <div class="erp-panel-eyebrow">Bộ lọc và queue xử lý</div>
          <div class="erp-panel-title">Theo dõi xác nhận lịch dạy</div>
        </div>
        <div class="erp-toolbar erp-toolbar-wrap">
          <a-input v-model:value="classSearch" allow-clear placeholder="Mã lớp" class="erp-filter" />
          <a-input v-model:value="teacherSearch" allow-clear placeholder="Giáo viên" class="erp-filter" />
          <a-date-picker
            v-model:value="startDateFrom"
            value-format="DD/MM/YYYY"
            placeholder="Ngày bắt đầu từ"
            class="erp-filter"
          />
          <a-date-picker
            v-model:value="startDateTo"
            value-format="DD/MM/YYYY"
            placeholder="Ngày bắt đầu đến"
            class="erp-filter"
          />
          <a-select
            v-model:value="typeFilter"
            class="erp-filter"
            :options="[
              { value: 'All', label: 'Tất cả loại yêu cầu' },
              { value: 'New Opening', label: 'Báo lớp khai giảng' },
              { value: 'Teacher Change', label: 'Đổi giáo viên' },
            ]"
          />
          <a-select
            v-model:value="sourceFilter"
            class="erp-filter"
            :options="[
              { value: 'All', label: 'Tất cả nguồn' },
              { value: 'GVU', label: 'GVU' },
              { value: 'CM', label: 'CM' },
              { value: 'Teacher Care', label: 'Teacher Care' },
            ]"
          />
          <a-select
            v-model:value="priorityFilter"
            class="erp-filter"
            :options="[
              { value: 'All', label: 'Tất cả mức ưu tiên' },
              { value: 'urgent', label: 'Chỉ hiện gần / quá SLA' },
            ]"
          />
          <a-date-picker
            v-model:value="deadlineFrom"
            value-format="DD/MM/YYYY"
            placeholder="Hạn xác nhận từ"
            class="erp-filter"
          />
          <a-date-picker
            v-model:value="deadlineTo"
            value-format="DD/MM/YYYY"
            placeholder="Hạn xác nhận đến"
            class="erp-filter"
          />
          <a-button @click="resetFilters">Xóa bộ lọc</a-button>
        </div>
      </div>

      <div class="erp-subtabs">
        <a-button
          v-for="status in statuses"
          :key="status"
          :type="statusTab === status ? 'primary' : 'default'"
          @click="statusTab = status"
        >
          {{ getStatusLabel(status) }}
        </a-button>
      </div>

      <a-table
        :columns="columns"
        :data-source="rows"
        :pagination="{ pageSize: 7, showSizeChanger: false }"
        row-key="id"
        :scroll="{ x: 1580 }"
        size="small"
      >
        <template #emptyText>
          <a-empty
            :image="emptyImage"
            :description="`Không có request ở trạng thái ${getStatusLabel(statusTab).toLowerCase()} theo bộ lọc hiện tại`"
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
            <div>
              <div>{{ record.teacherName }}</div>
              <div class="text-xs text-slate-500">{{ record.teacherType }}</div>
            </div>
          </template>
          <template v-else-if="column.key === 'requestType'">
            <div>
              <div>{{ getTypeLabel(record.requestType) }}</div>
              <div v-if="record.oldTeacherName" class="text-xs text-slate-500">
                GV cũ: {{ record.oldTeacherName }}
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'sourceDepartment'">
            {{ getSourceLabel(record.sourceDepartment) }}
          </template>
          <template v-else-if="column.key === 'deadlineConfirmAt'">
            <div>
              <div>{{ record.deadlineConfirmAt }}</div>
              <a-tag class="mt-1" :color="getSlaMeta(record).tone">
                {{ getSlaMeta(record).label }}
              </a-tag>
            </div>
          </template>
          <template v-else-if="column.key === 'contextInfo'">
            <div class="text-sm">
              <template v-if="record.status === 'Rejected'">
                <div class="font-medium text-rose-600">
                  {{ record.rejectReason || 'Đã từ chối nhận lớp' }}
                </div>
                <div v-if="record.rejectNote" class="text-xs text-slate-500">
                  {{ record.rejectNote }}
                </div>
              </template>
              <template v-else-if="record.status === 'Expired'">
                <div class="font-medium text-orange-600">
                  Quá hạn từ {{ record.expiredAt || '-' }}
                </div>
                <div class="text-xs text-slate-500">Cần xử lý đổi giáo viên hoặc escalte</div>
              </template>
              <template v-else-if="record.status === 'Confirmed'">
                <a-tag v-if="getConfirmationMeta(record)" :color="getConfirmationMeta(record)?.tone">
                  {{ getConfirmationMeta(record)?.label }}
                </a-tag>
                <div class="mt-1 text-xs text-slate-500">
                  {{ record.confirmedAt || '-' }}
                </div>
              </template>
              <template v-else-if="record.status === 'Cancelled'">
                <div class="font-medium text-slate-600">
                  Đã hủy lúc {{ record.cancelledAt || '-' }}
                </div>
                <div class="text-xs text-slate-500">Không còn cần xác nhận</div>
              </template>
              <template v-else>
                <div class="font-medium text-slate-700">
                  Nguồn: {{ getSourceLabel(record.sourceDepartment) }}
                </div>
                <div class="text-xs text-slate-500">Người thao tác: {{ record.triggeredBy }}</div>
              </template>
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
                ghost
                @click="resend(record)"
              >
                Gửi nhắc lại
              </a-button>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>
  </section>
</template>
