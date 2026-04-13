<script setup lang="ts">
import { ClockCircleOutlined, HistoryOutlined } from '@ant-design/icons-vue'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useTeacherQueue } from '../composables/useTeacherQueue'
import { useTeachingRequestStore } from '../stores/teachingRequest'
import type { RequestItem } from '../types'
import {
  getConfirmationMeta,
  getSlaMeta,
  getStatusColor,
  getStatusLabel,
  getTypeTone,
} from '../utils/requestPresentation'

const store = useTeachingRequestStore()
const { teacherProfile, teacherPendingRequests, isSubmitting } = storeToRefs(store)
const { activeTab, keyword, typeFilter, pendingRows, historyRows } = useTeacherQueue()

const promptRequestId = ref<string>()
const introPromptVisible = ref(false)
const teacherRejectVisible = ref(false)
const teacherConfirmVisible = ref(false)
const teacherRejectReason = ref('')
const rejectRequestId = ref<string>()
const hasAutoPrompted = ref(false)

const promptRequest = computed(() =>
  teacherPendingRequests.value.find((item) => item.id === promptRequestId.value) ?? null,
)

watch(
  teacherPendingRequests,
  (rows) => {
    if (rows.length && !hasAutoPrompted.value) {
      promptRequestId.value = rows[0].id
      introPromptVisible.value = true
      hasAutoPrompted.value = true
    }
  },
  { immediate: true },
)

function closePrompt() {
  introPromptVisible.value = false
}

function openTeacherConfirm(requestId?: string) {
  if (!requestId) {
    return
  }

  promptRequestId.value = requestId
  teacherConfirmVisible.value = true
}

function closeTeacherConfirm() {
  teacherConfirmVisible.value = false
}

async function handleTeacherConfirm(requestId?: string) {
  if (!requestId) {
    return
  }

  await store.confirmTeacherRequest(requestId)
  closeTeacherConfirm()
  closePrompt()
}

function openTeacherReject(requestId?: string) {
  if (!requestId) {
    return
  }

  introPromptVisible.value = false
  rejectRequestId.value = requestId
  teacherRejectReason.value = ''
  teacherRejectVisible.value = true
}

function closeTeacherReject() {
  teacherRejectVisible.value = false
  teacherRejectReason.value = ''
  rejectRequestId.value = undefined
}

async function submitTeacherReject() {
  if (!rejectRequestId.value || !teacherRejectReason.value.trim()) {
    return
  }

  await store.rejectTeacherRequest(rejectRequestId.value, {
    reason: teacherRejectReason.value.trim(),
  })
  closeTeacherReject()
  closePrompt()
}

const pendingColumns = [
  { title: 'Loại thông báo', key: 'requestType', width: 150 },
  { title: 'Lớp', key: 'classCode', width: 180 },
  { title: 'Ngày bắt đầu', key: 'startDate', width: 110 },
  { title: 'Thời gian học', key: 'scheduleSummary', width: 230 },
  { title: 'Level', key: 'level', width: 100 },
  { title: 'Hạn xác nhận', key: 'deadlineConfirmAt', width: 160 },
  { title: 'Thao tác', key: 'actions', width: 250 },
]

const historyColumns = [
  { title: 'Loại thông báo', key: 'requestType', width: 180 },
  { title: 'Lớp', key: 'classCode', width: 210 },
  { title: 'Ngày bắt đầu', key: 'startDate', width: 120 },
  { title: 'Level', key: 'level', width: 110 },
  { title: 'Kết quả', key: 'status', width: 150 },
  { title: 'Cập nhật cuối', key: 'lastUpdate', width: 180 },
  { title: 'Ghi nhận gần nhất', key: 'lastNote', width: 320 },
]

function getTeacherTypeLabel(requestType: RequestItem['requestType']) {
  if (requestType === 'Schedule Change') {
    return 'Đổi lịch học'
  }

  if (requestType === 'Teacher Handover') {
    return 'Đổi giáo viên'
  }

  return 'Báo lớp khai giảng'
}
</script>

<template>
  <section class="space-y-5">
    <a-card :bordered="false" class="erp-panel overflow-hidden">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div class="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Teacher Portal</div>
          <div class="mt-2 text-xl font-semibold text-slate-900">
            {{ teacherProfile?.teacherName || 'Giáo viên' }}
          </div>
          <div class="mt-1 text-sm text-slate-500">
            {{ teacherProfile?.teacherCode || '-' }} · {{ teacherProfile?.teacherType || '-' }}
          </div>
          <div class="mt-1 text-sm text-slate-500">
            Teacher Care: {{ teacherProfile?.teacherCareName || '-' }}
          </div>
        </div>

        <div class="grid min-w-[280px] gap-3 sm:grid-cols-2">
          <div class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <div class="flex items-center gap-2 text-sm font-medium text-amber-800">
              <clock-circle-outlined />
              Chờ xác nhận
            </div>
            <div class="mt-2 text-2xl font-semibold text-slate-900">{{ teacherPendingRequests.length }}</div>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div class="flex items-center gap-2 text-sm font-medium text-slate-700">
              <history-outlined />
              Lịch sử
            </div>
            <div class="mt-2 text-2xl font-semibold text-slate-900">{{ historyRows.length }}</div>
          </div>
        </div>
      </div>
    </a-card>

    <a-card :bordered="false" class="erp-panel">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="erp-subtabs">
          <a-button :type="activeTab === 'pending' ? 'primary' : 'default'" @click="activeTab = 'pending'">
            Chờ xác nhận
          </a-button>
          <a-button :type="activeTab === 'history' ? 'primary' : 'default'" @click="activeTab = 'history'">
            Lịch sử
          </a-button>
        </div>

        <div class="flex items-center gap-2">
          <a-input
            v-model:value="keyword"
            allow-clear
            placeholder="Mã lớp / tên lớp"
            class="w-[150px]"
          />
          <a-select
            v-model:value="typeFilter"
            class="w-[180px]"
            :options="[
              { value: 'All', label: 'Tất cả loại thông báo' },
              { value: 'New Opening', label: 'Báo lớp khai giảng' },
              { value: 'Teacher Handover', label: 'Đổi giáo viên' },
              { value: 'Schedule Change', label: 'Đổi lịch học' },
            ]"
          />
        </div>
      </div>

      <a-table
        v-if="activeTab === 'pending'"
        :columns="pendingColumns"
        :data-source="pendingRows"
        :pagination="{ pageSize: 10, showSizeChanger: false }"
        row-key="id"
        :scroll="{ x: 1280 }"
        table-layout="fixed"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'requestType'">
            <a-tag :color="getTypeTone(record.requestType)" class="border-0 whitespace-normal">
              {{ getTeacherTypeLabel(record.requestType) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'classCode'">
            <div>
              <div class="font-medium text-slate-900">{{ record.classCode }}</div>
              <div class="text-xs text-slate-500">{{ record.className }}</div>
            </div>
          </template>
          <template v-else-if="column.key === 'startDate'">
            {{ record.startDate }}
          </template>
          <template v-else-if="column.key === 'scheduleSummary'">
            <div>
              <div class="text-slate-900">{{ record.scheduleSummary }}</div>
              <div class="text-xs text-slate-500">Teacher Care: {{ record.teacherCareName }}</div>
            </div>
          </template>
          <template v-else-if="column.key === 'level'">
            {{ record.level }}
          </template>
          <template v-else-if="column.key === 'deadlineConfirmAt'">
            <div>
              <div>{{ record.deadlineConfirmAt }}</div>
              <a-tag class="mt-1" :color="getSlaMeta(record).tone">{{ getSlaMeta(record).label }}</a-tag>
            </div>
          </template>
          <template v-else-if="column.key === 'actions'">
            <div class="flex items-center gap-2 whitespace-nowrap">
              <a-button danger ghost @click="openTeacherReject(record.id)">Từ chối lớp</a-button>
              <a-button type="primary" @click="openTeacherConfirm(record.id)">Nhận lớp</a-button>
            </div>
          </template>
        </template>
      </a-table>

      <a-table
        v-else
        :columns="historyColumns"
        :data-source="historyRows"
        :pagination="{ pageSize: 10, showSizeChanger: false }"
        row-key="id"
        :scroll="{ x: 1180 }"
        table-layout="fixed"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'requestType'">
            <a-tag :color="getTypeTone(record.requestType)" class="border-0 whitespace-normal">
              {{ getTeacherTypeLabel(record.requestType) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'classCode'">
            <div>
              <div class="font-medium text-slate-900">{{ record.classCode }}</div>
              <div class="text-xs text-slate-500">{{ record.className }}</div>
            </div>
          </template>
          <template v-else-if="column.key === 'startDate'">
            {{ record.startDate }}
          </template>
          <template v-else-if="column.key === 'status'">
            <div>
              <a-tag :color="getStatusColor(record.status)">{{ getStatusLabel(record.status) }}</a-tag>
              <a-tag
                v-if="record.status === 'Confirmed' && getConfirmationMeta(record)"
                class="mt-1"
                :color="getConfirmationMeta(record)?.tone"
              >
                {{ getConfirmationMeta(record)?.label }}
              </a-tag>
            </div>
          </template>
          <template v-else-if="column.key === 'level'">
            {{ record.level }}
          </template>
          <template v-else-if="column.key === 'lastUpdate'">
            <div>
              <div class="font-medium text-slate-900">{{ record.events[0]?.actor || '-' }}</div>
              <div class="text-xs text-slate-500">{{ record.events[0]?.time || '-' }}</div>
            </div>
          </template>
          <template v-else-if="column.key === 'lastNote'">
            <div class="text-sm text-slate-600">{{ record.events[0]?.note || '-' }}</div>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="introPromptVisible"
      title="Thông báo mới cần xác nhận"
      :footer="null"
      width="760px"
    >
      <template v-if="teacherPendingRequests.length">
        <div class="space-y-4">
          <a-alert
            type="info"
            show-icon
            message="Bạn có thông báo cần xử lý"
            description="Theo nghiệp vụ, giáo viên xác nhận hoặc từ chối trực tiếp trên ERP sau khi đã kiểm tra thời khóa biểu."
          />

          <div class="space-y-3">
            <div
              v-for="item in teacherPendingRequests"
              :key="item.id"
              class="rounded-[22px] border border-slate-200 bg-[#f8fafc] px-5 py-4"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <div class="font-semibold text-slate-900">{{ item.classCode }}</div>
                    <a-tag :color="getTypeTone(item.requestType)" class="border-0">
                      {{ getTeacherTypeLabel(item.requestType) }}
                    </a-tag>
                  </div>
                  <div class="mt-3 text-sm text-slate-600">
                    {{ item.startDate }} | {{ item.scheduleSummary }}
                  </div>
                  <div class="mt-2 text-sm text-slate-600">Level: {{ item.level }}</div>
                  <div class="mt-3 text-sm font-semibold text-[#d46b08]">
                    Hạn xác nhận: {{ item.deadlineConfirmAt }}
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <a-button danger ghost @click="openTeacherReject(item.id)">Từ chối lớp</a-button>
                  <a-button type="primary" :loading="isSubmitting" @click="openTeacherConfirm(item.id)">
                    Xác nhận ngay
                  </a-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </a-modal>

    <a-modal
      v-model:open="teacherConfirmVisible"
      title="Xác nhận nhận lớp"
      ok-text="Xác nhận nhận lớp"
      cancel-text="Hủy"
      :ok-button-props="{ type: 'primary', loading: isSubmitting, disabled: !promptRequest }"
      @ok="handleTeacherConfirm(promptRequest?.id)"
      @cancel="closeTeacherConfirm"
    >
      <template v-if="promptRequest">
        <div class="space-y-4">
          <a-alert
            type="info"
            show-icon
            message="Vui lòng xác nhận lại trước khi nhận lớp"
            description="Sau khi xác nhận, lớp sẽ biến mất khỏi danh sách chờ xác nhận và chuyển sang lịch sử."
          />
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div class="font-semibold text-slate-900">
              {{ getTeacherTypeLabel(promptRequest.requestType) }} · {{ promptRequest.classCode }}
            </div>
            <div class="mt-2 text-sm text-slate-600">Tên lớp: {{ promptRequest.className }}</div>
            <div class="mt-1 text-sm text-slate-600">Ngày bắt đầu: {{ promptRequest.startDate }}</div>
            <div class="mt-1 text-sm text-slate-600">Thời gian học: {{ promptRequest.scheduleSummary }}</div>
            <div class="mt-1 text-sm text-slate-600">Level: {{ promptRequest.level }}</div>
            <div class="mt-1 text-sm font-semibold text-[#d46b08]">
              Hạn xác nhận: {{ promptRequest.deadlineConfirmAt }}
            </div>
            <div class="mt-3 whitespace-pre-line rounded-2xl bg-white p-3 text-sm text-slate-700">
              {{ promptRequest.noteToTeacher }}
            </div>
          </div>
        </div>
      </template>
    </a-modal>

    <a-modal
      v-model:open="teacherRejectVisible"
      title="Từ chối lớp"
      ok-text="Gửi từ chối"
      cancel-text="Hủy"
      :ok-button-props="{ danger: true, loading: isSubmitting, disabled: !teacherRejectReason.trim() }"
      @ok="submitTeacherReject"
      @cancel="closeTeacherReject"
    >
      <div class="space-y-4">
        <a-alert
          type="warning"
          show-icon
          message="Hệ thống sẽ gửi lý do này cho vận hành"
          description="Vui lòng nhập ngắn gọn và rõ ràng để Teacher Care xử lý điều phối tiếp theo."
        />
        <a-textarea
          v-model:value="teacherRejectReason"
          :rows="4"
          maxlength="500"
          placeholder="Nhập lý do từ chối lớp"
        />
      </div>
    </a-modal>
  </section>
</template>
