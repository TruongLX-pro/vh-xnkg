<script setup lang="ts">
import { BellOutlined, PhoneOutlined } from '@ant-design/icons-vue'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { useTeachingRequestStore } from '../../stores/teachingRequest'
import {
  getProcessingStatusColor,
  getProcessingStatusLabel,
  getResolutionResultColor,
  getResolutionResultLabel,
  getSourceLabel,
  getTypeLabel,
} from '../../utils/requestPresentation'

const store = useTeachingRequestStore()
const {
  selectedRequest,
  detailVisible,
  rejectVisible,
  confirmVisible,
  confirmReason,
  rejectReason,
  rejectTeacherReply,
  rejectOperationNote,
  rejectNextAction,
  rejectReasonOptions,
  isSubmitting,
} = storeToRefs(store)

const operationalNote = ref('')

watch(selectedRequest, () => {
  operationalNote.value = ''
})

function submitReject() {
  if (!rejectReason.value) {
    return
  }

  store.rejectSelectedRequest({
    reason: rejectReason.value,
    teacherReply: rejectTeacherReply.value,
    operationNote: rejectOperationNote.value,
    nextAction: rejectNextAction.value,
  })
}

function submitConfirm() {
  if (!confirmReason.value.trim()) {
    return
  }

  store.confirmSelectedRequest({
    reason: confirmReason.value.trim(),
  })
}

async function submitOperationalNote() {
  if (!operationalNote.value.trim()) {
    return
  }

  await store.addRequestNote(operationalNote.value)
  operationalNote.value = ''
}
</script>

<template>
  <a-drawer
    :open="detailVisible"
    width="860"
    placement="right"
    :title="selectedRequest ? `${selectedRequest.classCode} - ${getTypeLabel(selectedRequest.requestType)}` : 'Chi tiết yêu cầu'"
    @close="store.closeDetail"
  >
    <template v-if="selectedRequest">
      <div class="space-y-6">
        <div class="grid gap-4 lg:grid-cols-2">
          <a-card :bordered="false" class="rounded-3xl bg-slate-50">
            <div class="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Thông tin yêu cầu</div>
            <a-descriptions :column="1" size="small">
              <a-descriptions-item label="Mã request">{{ selectedRequest.id }}</a-descriptions-item>
              <a-descriptions-item label="Loại thông báo">{{ getTypeLabel(selectedRequest.requestType) }}</a-descriptions-item>
              <a-descriptions-item label="Trạng thái">
                <a-tag :color="getProcessingStatusColor(selectedRequest.processingStatus)">
                  {{ getProcessingStatusLabel(selectedRequest.processingStatus) }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="Kết quả xử lý">
                <a-tag :color="getResolutionResultColor(selectedRequest.resolutionResult)">
                  {{ getResolutionResultLabel(selectedRequest.resolutionResult) }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="Nguồn">{{ getSourceLabel(selectedRequest.sourceDepartment) }}</a-descriptions-item>
              <a-descriptions-item label="Người thao tác nguồn">{{ selectedRequest.triggeredBy }}</a-descriptions-item>
              <a-descriptions-item label="Thời điểm tạo">{{ selectedRequest.createdAt }}</a-descriptions-item>
              <a-descriptions-item label="Thời điểm gửi Telegram">{{ selectedRequest.notifiedAt || '-' }}</a-descriptions-item>
              <a-descriptions-item label="Hạn phản hồi">{{ selectedRequest.deadlineConfirmAt || '-' }}</a-descriptions-item>
              <a-descriptions-item v-if="selectedRequest.confirmedAt" label="Thời điểm xác nhận">{{ selectedRequest.confirmedAt }}</a-descriptions-item>
              <a-descriptions-item v-if="selectedRequest.rejectedAt" label="Thời điểm từ chối">{{ selectedRequest.rejectedAt }}</a-descriptions-item>
              <a-descriptions-item v-if="selectedRequest.expiredAt" label="Thời điểm quá hạn">{{ selectedRequest.expiredAt }}</a-descriptions-item>
            </a-descriptions>
          </a-card>

          <a-card :bordered="false" class="rounded-3xl bg-slate-50">
            <div class="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Thông tin lớp</div>
            <a-descriptions :column="1" size="small">
              <a-descriptions-item label="Mã lớp">{{ selectedRequest.classCode }}</a-descriptions-item>
              <a-descriptions-item label="Tên lớp">{{ selectedRequest.className }}</a-descriptions-item>
              <a-descriptions-item label="Khóa học">{{ selectedRequest.courseName }}</a-descriptions-item>
              <a-descriptions-item label="Level">{{ selectedRequest.level }}</a-descriptions-item>
              <a-descriptions-item label="Ngày bắt đầu">{{ selectedRequest.startDate }}</a-descriptions-item>
              <a-descriptions-item label="Buổi đầu">{{ selectedRequest.firstSession }}</a-descriptions-item>
              <a-descriptions-item label="Lịch học">{{ selectedRequest.scheduleSummary }}</a-descriptions-item>
              <a-descriptions-item label="Trạng thái lớp">{{ selectedRequest.classStatus }}</a-descriptions-item>
            </a-descriptions>
          </a-card>
        </div>

        <a-card :bordered="false" class="rounded-3xl">
          <div class="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Giáo viên phụ trách</div>
          <div class="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div class="rounded-2xl bg-slate-50 p-4">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="flex items-center gap-2">
                    <div class="font-semibold text-slate-900">{{ selectedRequest.teacherName }}</div>
                    <a-tag v-if="selectedRequest.teacherHandoverRole" color="purple">
                      {{ selectedRequest.teacherHandoverRole }}
                    </a-tag>
                  </div>
                  <div class="mt-1 text-sm text-slate-500">
                    {{ selectedRequest.teacherCode }} · {{ selectedRequest.teacherType }}
                  </div>
                  <div class="mt-3 text-sm text-slate-600">Teacher Care: {{ selectedRequest.teacherCareName }}</div>
                </div>
                <a-button type="default" :href="`tel:${selectedRequest.teacherPhone}`">
                  <template #icon>
                    <phone-outlined />
                  </template>
                  Gọi điện
                </a-button>
              </div>
              <div class="mt-3 text-sm text-slate-600">Số điện thoại: {{ selectedRequest.teacherPhone }}</div>
            </div>

            <div v-if="selectedRequest.oldTeacherName" class="rounded-2xl bg-slate-50 p-4">
              <div class="flex items-center gap-2 font-semibold text-slate-900">
                <span>Giáo viên cũ</span>
                <a-tag color="purple">GV cũ</a-tag>
              </div>
              <div class="mt-2 text-sm text-slate-700">{{ selectedRequest.oldTeacherName }}</div>
              <div class="mt-1 text-sm text-slate-500">
                {{ selectedRequest.oldTeacherCode || '-' }} · {{ selectedRequest.oldTeacherPhone || '-' }}
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
                  <div class="text-xs uppercase tracking-[0.18em] text-slate-400">{{ event.time }}</div>
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

          <div class="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-4">
            <div class="mb-2 text-sm font-semibold text-slate-800">Thêm ghi chú vận hành</div>
            <a-textarea
              v-model:value="operationalNote"
              :rows="3"
              maxlength="500"
              placeholder="Ghi lại các trao đổi nội bộ, kết quả gọi điện, hoặc quyết định xử lý tiếp theo"
            />
            <div class="mt-3 flex justify-end">
              <a-button type="primary" :loading="isSubmitting" @click="submitOperationalNote">
                Lưu ghi chú
              </a-button>
            </div>
          </div>
        </a-card>

        <div
          v-if="selectedRequest.processingStatus === 'Pending'"
          class="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
        >
          <div class="mb-2 text-base font-semibold text-slate-900">Can thiệp của vận hành</div>
          <div class="mb-4 text-sm leading-7 text-slate-600">
            Phase 1 không có màn web cho giáo viên. Vận hành theo dõi phản hồi qua bot Telegram và có
            thể chủ động chốt trạng thái thay cho giáo viên khi đã xác minh.
          </div>
          <div class="flex flex-wrap gap-2">
            <a-button type="primary" ghost @click="store.resendRequest(selectedRequest)">Gửi lại Telegram</a-button>
            <a-button type="primary" @click="store.openConfirm(selectedRequest)">Chuyển xác nhận</a-button>
            <a-button danger ghost @click="store.openReject(selectedRequest)">Chuyển từ chối</a-button>
            <a-button @click="store.simulateSelectedScheduleChange()">Giả lập đổi lịch</a-button>
            <a-button @click="store.simulateSelectedTeacherChange()">Giả lập đổi giáo viên</a-button>
          </div>
        </div>

        <div
          v-if="selectedRequest.processingStatus === 'InProgress' && selectedRequest.resolutionResult === 'Rejected'"
          class="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
        >
          <div class="mb-2 text-base font-semibold text-slate-900">Vận hành hoàn tất xử lý</div>
          <div class="mb-4 text-sm leading-7 text-slate-600">
            Bản ghi đang ở trạng thái đang xử lý. Khi nghiệp vụ đã được follow-up xong, vận hành có thể chốt hoàn thành tại đây.
          </div>
          <div class="flex flex-wrap gap-2">
            <a-button type="primary" @click="store.markSelectedRequestHandled()">Đánh dấu đã xử lý</a-button>
          </div>
        </div>

        <div
          v-if="selectedRequest.processingStatus === 'InProgress' && selectedRequest.resolutionResult === 'Expired'"
          class="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
        >
          <div class="mb-2 text-base font-semibold text-slate-900">Vận hành chốt bản ghi quá hạn</div>
          <div class="mb-4 text-sm leading-7 text-slate-600">
            Bản ghi đã quá SLA. Vận hành cần chốt lại kết quả cuối cùng là xác nhận, từ chối hoặc hủy.
          </div>
          <div class="flex flex-wrap gap-2">
            <a-button type="primary" ghost @click="store.resendRequest(selectedRequest)">Gửi lại Telegram</a-button>
            <a-button type="primary" @click="store.openConfirm(selectedRequest)">Chuyển xác nhận</a-button>
            <a-button danger ghost @click="store.openReject(selectedRequest)">Chuyển từ chối</a-button>
            <a-button @click="store.cancelSelectedRequest('Vận hành chốt hủy bản ghi sau khi bản ghi quá hạn SLA.')">
              Chuyển hủy
            </a-button>
          </div>
        </div>
      </div>
    </template>
  </a-drawer>

  <a-modal
    v-model:open="confirmVisible"
    :z-index="1600"
    :mask-closable="false"
    title="Chuyển trạng thái sang xác nhận"
    ok-text="Xác nhận"
    cancel-text="Hủy"
    :ok-button-props="{ type: 'primary', disabled: !confirmReason.trim(), loading: isSubmitting }"
    :cancel-button-props="{ disabled: isSubmitting }"
    @ok="submitConfirm"
    @cancel="store.closeConfirm"
  >
    <div class="space-y-4">
      <a-alert
        type="info"
        show-icon
        message="Vận hành xác nhận thay cho giáo viên"
        description="Chỉ dùng khi Teacher Care đã xác minh và cần chốt trạng thái xác nhận trên hệ thống."
      />
      <a-textarea
        v-model:value="confirmReason"
        :rows="4"
        maxlength="500"
        placeholder="Nhập lý do vận hành chuyển xác nhận thay cho giáo viên"
      />
    </div>
  </a-modal>

  <a-modal
    v-model:open="rejectVisible"
    :z-index="1600"
    :mask-closable="false"
    title="Chuyển trạng thái sang từ chối"
    ok-text="Xác nhận từ chối"
    cancel-text="Hủy"
    :ok-button-props="{ danger: true, disabled: !rejectReason, loading: isSubmitting }"
    :cancel-button-props="{ disabled: isSubmitting }"
    @ok="submitReject"
    @cancel="store.closeReject"
  >
    <div class="space-y-4">
      <a-alert
        type="error"
        show-icon
        message="Vận hành xác nhận đã kiểm tra với giáo viên"
        description="Chỉ dùng khi Teacher Care đã follow-up và cần chốt trạng thái xử lý trên hệ thống."
      />
      <a-select
        v-model:value="rejectReason"
        placeholder="Chọn lý do từ chối"
        :options="rejectReasonOptions.map((item) => ({ value: item, label: item }))"
      />
      <a-textarea
        v-model:value="rejectTeacherReply"
        :rows="3"
        maxlength="500"
        placeholder="Phản hồi chi tiết từ giáo viên"
      />
      <a-textarea
        v-model:value="rejectOperationNote"
        :rows="3"
        maxlength="500"
        placeholder="Ghi chú xác minh của vận hành"
      />
      <a-textarea
        v-model:value="rejectNextAction"
        :rows="3"
        maxlength="500"
        placeholder="Bước xử lý tiếp theo"
      />
    </div>
  </a-modal>
</template>
