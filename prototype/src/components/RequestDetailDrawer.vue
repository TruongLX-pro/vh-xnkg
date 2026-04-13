<script setup lang="ts">
import { BellOutlined } from '@ant-design/icons-vue'
import { useRoute } from 'vue-router'
import { useTeachingRequests } from '../composables/useTeachingRequests'

const route = useRoute()
const {
  selectedRequest,
  detailVisible,
  confirmVisible,
  confirmChecked,
  rejectVisible,
  rejectReason,
  rejectNote,
  rejectReasonOptions,
  getTypeLabel,
  getStatusColor,
  getStatusLabel,
  getSourceLabel,
  closeDetail,
  openReject,
  submitConfirm,
  submitReject,
} = useTeachingRequests()
</script>

<template>
  <a-drawer
    v-model:open="detailVisible"
    width="760"
    placement="right"
    :title="selectedRequest ? `${selectedRequest.classCode} - ${getTypeLabel(selectedRequest.requestType)}` : 'Chi tiết yêu cầu'"
    @close="closeDetail"
  >
    <template v-if="selectedRequest">
      <div class="space-y-6">
        <div class="grid gap-4 lg:grid-cols-2">
          <a-card :bordered="false" class="rounded-3xl bg-slate-50">
            <div class="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Thông tin yêu cầu
            </div>
            <a-descriptions :column="1" size="small">
              <a-descriptions-item label="Mã request">{{ selectedRequest.id }}</a-descriptions-item>
              <a-descriptions-item label="Loại yêu cầu">
                {{ getTypeLabel(selectedRequest.requestType) }}
              </a-descriptions-item>
              <a-descriptions-item label="Trạng thái">
                <a-tag :color="getStatusColor(selectedRequest.status)">
                  {{ getStatusLabel(selectedRequest.status) }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="Nguồn phát sinh">
                {{ getSourceLabel(selectedRequest.sourceDepartment) }}
              </a-descriptions-item>
              <a-descriptions-item label="Người thao tác">
                {{ selectedRequest.triggeredBy }}
              </a-descriptions-item>
              <a-descriptions-item label="Thời điểm tạo">
                {{ selectedRequest.createdAt }}
              </a-descriptions-item>
              <a-descriptions-item label="Hạn xác nhận">
                {{ selectedRequest.deadlineConfirmAt }}
              </a-descriptions-item>
              <a-descriptions-item v-if="selectedRequest.confirmedAt" label="Thời điểm xác nhận">
                {{ selectedRequest.confirmedAt }}
              </a-descriptions-item>
              <a-descriptions-item v-if="selectedRequest.rejectedAt" label="Thời điểm từ chối">
                {{ selectedRequest.rejectedAt }}
              </a-descriptions-item>
              <a-descriptions-item v-if="selectedRequest.expiredAt" label="Thời điểm quá hạn">
                {{ selectedRequest.expiredAt }}
              </a-descriptions-item>
              <a-descriptions-item v-if="selectedRequest.cancelledAt" label="Thời điểm hủy">
                {{ selectedRequest.cancelledAt }}
              </a-descriptions-item>
            </a-descriptions>
          </a-card>

          <a-card :bordered="false" class="rounded-3xl bg-slate-50">
            <div class="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Thông tin lớp
            </div>
            <a-descriptions :column="1" size="small">
              <a-descriptions-item label="Mã lớp">{{ selectedRequest.classCode }}</a-descriptions-item>
              <a-descriptions-item label="Tên lớp">{{ selectedRequest.className }}</a-descriptions-item>
              <a-descriptions-item label="Khóa học">{{ selectedRequest.courseName }}</a-descriptions-item>
              <a-descriptions-item label="Level">{{ selectedRequest.level }}</a-descriptions-item>
              <a-descriptions-item label="Ngày bắt đầu">{{ selectedRequest.startDate }}</a-descriptions-item>
              <a-descriptions-item label="Buổi đầu">{{ selectedRequest.firstSession }}</a-descriptions-item>
              <a-descriptions-item label="Lịch học">
                {{ selectedRequest.scheduleSummary }}
              </a-descriptions-item>
              <a-descriptions-item label="Trạng thái lớp">
                {{ selectedRequest.classStatus }}
              </a-descriptions-item>
            </a-descriptions>
          </a-card>
        </div>

        <a-card :bordered="false" class="rounded-3xl">
          <div class="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Giáo viên và ghi chú
          </div>
          <div class="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <div class="rounded-2xl bg-slate-50 p-4">
              <div class="font-semibold text-slate-900">{{ selectedRequest.teacherName }}</div>
              <div class="mt-1 text-sm text-slate-500">{{ selectedRequest.teacherType }}</div>
              <div v-if="selectedRequest.oldTeacherName" class="mt-3 text-sm text-slate-600">
                Giáo viên cũ:
                <span class="font-medium">{{ selectedRequest.oldTeacherName }}</span>
              </div>
              <div v-if="selectedRequest.rejectReason" class="mt-3 text-sm text-rose-600">
                Lý do từ chối: {{ selectedRequest.rejectReason }}
              </div>
            </div>
            <div class="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm leading-7 text-slate-600">
              {{ selectedRequest.noteToTeacher }}
              <div
                v-if="selectedRequest.rejectNote"
                class="mt-3 rounded-xl bg-rose-50 p-3 text-rose-700"
              >
                Ghi chú từ giáo viên: {{ selectedRequest.rejectNote }}
              </div>
            </div>
          </div>
        </a-card>

        <a-card :bordered="false" class="rounded-3xl">
          <div class="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            <bell-outlined />
            Lịch sử xử lý
          </div>
          <a-timeline>
            <a-timeline-item v-for="event in selectedRequest.events" :key="event.id">
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div class="font-medium text-slate-900">{{ event.type }}</div>
                  <div class="text-xs uppercase tracking-[0.18em] text-slate-400">
                    {{ event.time }}
                  </div>
                </div>
                <div class="mt-2 text-sm text-slate-600">
                  {{ event.actor }}
                  <span v-if="event.channel"> • {{ event.channel }}</span>
                  <span v-if="event.result"> • {{ event.result }}</span>
                </div>
                <div class="mt-1 text-sm text-slate-500">{{ event.note }}</div>
              </div>
            </a-timeline-item>
          </a-timeline>
        </a-card>

        <div
          v-if="selectedRequest.status === 'Pending' && route.name === 'teacher'"
          class="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
        >
          <div class="mb-2 text-base font-semibold text-slate-900">Hành động của giáo viên</div>
          <div class="mb-4 text-sm leading-7 text-slate-600">
            Xem kỹ thông tin lớp trước khi xác nhận hoặc từ chối. Hệ thống sẽ lưu lại lịch sử thao tác trên ERP.
          </div>
          <div class="flex gap-2">
            <a-button type="primary" @click="confirmVisible = true">Nhận lớp</a-button>
            <a-button danger @click="openReject(selectedRequest)">Từ chối lớp</a-button>
          </div>
        </div>
      </div>
    </template>
  </a-drawer>

  <a-modal
    v-model:open="confirmVisible"
    title="Xác nhận nhận lớp"
    ok-text="Xác nhận"
    cancel-text="Hủy"
    :ok-button-props="{ type: 'primary', disabled: !confirmChecked }"
    @ok="submitConfirm"
  >
    <template v-if="selectedRequest">
      <div class="space-y-4">
        <a-alert
          type="info"
          show-icon
          message="Xác nhận chủ động trước khai giảng"
          description="Giáo viên xác nhận đã nhận thông tin lớp và đồng ý dạy buổi học đầu tiên."
        />
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
          <div><strong>Mã lớp:</strong> {{ selectedRequest.classCode }}</div>
          <div><strong>Ngày bắt đầu:</strong> {{ selectedRequest.startDate }}</div>
          <div><strong>Lịch học:</strong> {{ selectedRequest.scheduleSummary }}</div>
          <div><strong>Hạn xác nhận:</strong> {{ selectedRequest.deadlineConfirmAt }}</div>
        </div>
        <a-checkbox v-model:checked="confirmChecked">
          Tôi đã nhận đầy đủ thông tin lớp và xác nhận nhận lớp trên ERP
        </a-checkbox>
      </div>
    </template>
  </a-modal>

  <a-modal
    v-model:open="rejectVisible"
    title="Từ chối nhận lớp"
    ok-text="Gửi từ chối"
    cancel-text="Hủy"
    :ok-button-props="{ danger: true, disabled: !rejectReason }"
    @ok="submitReject"
  >
    <div class="space-y-4">
      <a-alert
        type="error"
        show-icon
        message="Lý do từ chối là bắt buộc"
        description="Request sau khi từ chối sẽ được đưa vào queue Từ chối để vận hành xử lý đổi giáo viên."
      />
      <a-select
        v-model:value="rejectReason"
        placeholder="Chọn lý do từ chối"
        :options="rejectReasonOptions.map((item) => ({ value: item, label: item }))"
      />
      <a-textarea v-model:value="rejectNote" :rows="4" maxlength="500" placeholder="Ghi chú bổ sung" />
    </div>
  </a-modal>
</template>
