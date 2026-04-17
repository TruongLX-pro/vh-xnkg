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
    :title="selectedRequest ? `${selectedRequest.classCode} - ${getTypeLabel(selectedRequest.requestType)}` : 'Chi tiáº¿t yÃªu cáº§u'"
    @close="store.closeDetail"
  >
    <template v-if="selectedRequest">
      <div class="space-y-6">
        <div class="grid gap-4 lg:grid-cols-2">
          <a-card :bordered="false" class="rounded-3xl bg-slate-50">
            <div class="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">ThÃ´ng tin yÃªu cáº§u</div>
            <a-descriptions :column="1" size="small">
              <a-descriptions-item label="MÃ£ request">{{ selectedRequest.id }}</a-descriptions-item>
              <a-descriptions-item label="Loáº¡i thÃ´ng bÃ¡o">{{ getTypeLabel(selectedRequest.requestType) }}</a-descriptions-item>
              <a-descriptions-item label="Tráº¡ng thÃ¡i">
                <a-tag :color="getProcessingStatusColor(selectedRequest.processingStatus)">
                  {{ getProcessingStatusLabel(selectedRequest.processingStatus) }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="Káº¿t quáº£ xá»­ lÃ½">
                <a-tag :color="getResolutionResultColor(selectedRequest.resolutionResult ?? (selectedRequest.processingStatus === 'Pending' ? 'InformationSent' : undefined))">
                  {{ getResolutionResultLabel(selectedRequest.resolutionResult ?? (selectedRequest.processingStatus === 'Pending' ? 'InformationSent' : undefined)) }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="Nguá»“n">{{ getSourceLabel(selectedRequest.sourceDepartment) }}</a-descriptions-item>
              <a-descriptions-item label="NgÆ°á»i thao tÃ¡c nguá»“n">{{ selectedRequest.triggeredBy }}</a-descriptions-item>
              <a-descriptions-item label="Thá»i Ä‘iá»ƒm táº¡o">{{ selectedRequest.createdAt }}</a-descriptions-item>
              <a-descriptions-item label="Thá»i Ä‘iá»ƒm gá»­i Telegram">{{ selectedRequest.notifiedAt || '-' }}</a-descriptions-item>
              <a-descriptions-item label="Háº¡n pháº£n há»“i">{{ selectedRequest.deadlineConfirmAt || '-' }}</a-descriptions-item>
              <a-descriptions-item v-if="selectedRequest.confirmedAt" label="Thá»i Ä‘iá»ƒm xÃ¡c nháº­n">{{ selectedRequest.confirmedAt }}</a-descriptions-item>
              <a-descriptions-item v-if="selectedRequest.rejectedAt" label="Thá»i Ä‘iá»ƒm tá»« chá»‘i">{{ selectedRequest.rejectedAt }}</a-descriptions-item>
              <a-descriptions-item v-if="selectedRequest.expiredAt" label="Thá»i Ä‘iá»ƒm quÃ¡ háº¡n">{{ selectedRequest.expiredAt }}</a-descriptions-item>
            </a-descriptions>
          </a-card>

          <a-card :bordered="false" class="rounded-3xl bg-slate-50">
            <div class="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">ThÃ´ng tin lá»›p</div>
            <a-descriptions :column="1" size="small">
              <a-descriptions-item label="MÃ£ lá»›p">{{ selectedRequest.classCode }}</a-descriptions-item>
              <a-descriptions-item label="TÃªn lá»›p">{{ selectedRequest.className }}</a-descriptions-item>
              <a-descriptions-item label="KhÃ³a há»c">{{ selectedRequest.courseName }}</a-descriptions-item>
              <a-descriptions-item label="Level">{{ selectedRequest.level }}</a-descriptions-item>
              <a-descriptions-item label="NgÃ y báº¯t Ä‘áº§u">{{ selectedRequest.startDate }}</a-descriptions-item>
              <a-descriptions-item label="Buá»•i Ä‘áº§u">{{ selectedRequest.firstSession }}</a-descriptions-item>
              <a-descriptions-item label="Lá»‹ch há»c">{{ selectedRequest.scheduleSummary }}</a-descriptions-item>
              <a-descriptions-item label="Tráº¡ng thÃ¡i lá»›p">{{ selectedRequest.classStatus }}</a-descriptions-item>
            </a-descriptions>
          </a-card>
        </div>

        <a-card :bordered="false" class="rounded-3xl">
          <div class="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">GiÃ¡o viÃªn phá»¥ trÃ¡ch</div>
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
                    {{ selectedRequest.teacherCode }} Â· {{ selectedRequest.teacherType }}
                  </div>
                  <div class="mt-3 text-sm text-slate-600">Teacher Care: {{ selectedRequest.teacherCareName }}</div>
                </div>
                <a-button type="default" :href="`tel:${selectedRequest.teacherPhone}`">
                  <template #icon>
                    <phone-outlined />
                  </template>
                  Gá»i Ä‘iá»‡n
                </a-button>
              </div>
              <div class="mt-3 text-sm text-slate-600">Sá»‘ Ä‘iá»‡n thoáº¡i: {{ selectedRequest.teacherPhone }}</div>
            </div>

            <div v-if="selectedRequest.oldTeacherName" class="rounded-2xl bg-slate-50 p-4">
              <div class="flex items-center gap-2 font-semibold text-slate-900">
                <span>GiÃ¡o viÃªn cÅ©</span>
                <a-tag color="purple">GV cÅ©</a-tag>
              </div>
              <div class="mt-2 text-sm text-slate-700">{{ selectedRequest.oldTeacherName }}</div>
              <div class="mt-1 text-sm text-slate-500">
                {{ selectedRequest.oldTeacherCode || '-' }} Â· {{ selectedRequest.oldTeacherPhone || '-' }}
              </div>
            </div>
          </div>
        </a-card>

        <a-card :bordered="false" class="rounded-3xl">
          <div class="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            <bell-outlined />
            Lá»‹ch sá»­ xá»­ lÃ½
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
                  <span v-if="event.channel"> â€¢ {{ event.channel }}</span>
                  <span v-if="event.result"> â€¢ {{ event.result }}</span>
                </div>
                <div class="mt-1 text-sm text-slate-500">{{ event.note }}</div>
              </div>
            </a-timeline-item>
          </a-timeline>

          <div class="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-4">
            <div class="mb-2 text-sm font-semibold text-slate-800">ThÃªm ghi chÃº váº­n hÃ nh</div>
            <a-textarea
              v-model:value="operationalNote"
              :rows="3"
              maxlength="500"
              placeholder="Ghi láº¡i cÃ¡c trao Ä‘á»•i ná»™i bá»™, káº¿t quáº£ gá»i Ä‘iá»‡n, hoáº·c quyáº¿t Ä‘á»‹nh xá»­ lÃ½ tiáº¿p theo"
            />
            <div class="mt-3 flex justify-end">
              <a-button type="primary" :loading="isSubmitting" @click="submitOperationalNote">
                LÆ°u ghi chÃº
              </a-button>
            </div>
          </div>
        </a-card>

        <div
          v-if="selectedRequest.processingStatus === 'Pending'"
          class="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
        >
          <div class="mb-2 text-base font-semibold text-slate-900">Can thiá»‡p cá»§a váº­n hÃ nh</div>
          <div class="flex flex-wrap gap-2">
            <a-button type="primary" ghost @click="store.resendRequest(selectedRequest)">Gá»­i láº¡i Telegram</a-button>
            <a-button type="primary" @click="store.openConfirm(selectedRequest)">Chuyá»ƒn xÃ¡c nháº­n</a-button>
            <a-button danger ghost @click="store.openReject(selectedRequest)">Chuyá»ƒn tá»« chá»‘i</a-button>
          </div>
        </div>

        <div
          v-if="selectedRequest.processingStatus === 'InProgress' && selectedRequest.resolutionResult === 'Rejected'"
          class="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
        >
          <div class="mb-2 text-base font-semibold text-slate-900">Váº­n hÃ nh hoÃ n táº¥t xá»­ lÃ½</div>
          <div class="flex flex-wrap gap-2">
            <a-button type="primary" ghost @click="store.openConfirm(selectedRequest)">Chuyá»ƒn xÃ¡c nháº­n</a-button>
            <a-button type="primary" @click="store.markSelectedRequestHandled()">ÄÃ¡nh dáº¥u Ä‘Ã£ xá»­ lÃ½</a-button>
          </div>
        </div>

        <div
          v-if="selectedRequest.processingStatus === 'InProgress' && selectedRequest.resolutionResult === 'Expired'"
          class="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
        >
          <div class="mb-2 text-base font-semibold text-slate-900">Váº­n hÃ nh chá»‘t báº£n ghi quÃ¡ háº¡n</div>
          <div class="flex flex-wrap gap-2">
            <a-button type="primary" ghost @click="store.resendRequest(selectedRequest)">Gá»­i láº¡i Telegram</a-button>
            <a-button type="primary" @click="store.openConfirm(selectedRequest)">Chuyá»ƒn xÃ¡c nháº­n</a-button>
            <a-button danger ghost @click="store.openReject(selectedRequest)">Chuyá»ƒn tá»« chá»‘i</a-button>
            <a-button @click="store.cancelSelectedRequest('Váº­n hÃ nh chá»‘t há»§y báº£n ghi sau khi báº£n ghi quÃ¡ háº¡n SLA.')">
              Chuyá»ƒn há»§y
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
    title="Chuyá»ƒn tráº¡ng thÃ¡i sang xÃ¡c nháº­n"
    ok-text="XÃ¡c nháº­n"
    cancel-text="Há»§y"
    :ok-button-props="{ type: 'primary', disabled: !confirmReason.trim(), loading: isSubmitting }"
    :cancel-button-props="{ disabled: isSubmitting }"
    @ok="submitConfirm"
    @cancel="store.closeConfirm"
  >
    <div class="space-y-4">
      <a-alert
        type="info"
        show-icon
        message="Váº­n hÃ nh xÃ¡c nháº­n thay cho giÃ¡o viÃªn"
        description="Chá»‰ dÃ¹ng khi Teacher Care Ä‘Ã£ xÃ¡c minh vÃ  cáº§n chá»‘t tráº¡ng thÃ¡i xÃ¡c nháº­n trÃªn há»‡ thá»‘ng."
      />
      <a-textarea
        v-model:value="confirmReason"
        :rows="4"
        maxlength="500"
        placeholder="Nháº­p lÃ½ do váº­n hÃ nh chuyá»ƒn xÃ¡c nháº­n thay cho giÃ¡o viÃªn"
      />
    </div>
  </a-modal>

  <a-modal
    v-model:open="rejectVisible"
    :z-index="1600"
    :mask-closable="false"
    title="Chuyá»ƒn tráº¡ng thÃ¡i sang tá»« chá»‘i"
    ok-text="XÃ¡c nháº­n tá»« chá»‘i"
    cancel-text="Há»§y"
    :ok-button-props="{ danger: true, disabled: !rejectReason, loading: isSubmitting }"
    :cancel-button-props="{ disabled: isSubmitting }"
    @ok="submitReject"
    @cancel="store.closeReject"
  >
    <div class="space-y-4">
      <a-alert
        type="error"
        show-icon
        message="Váº­n hÃ nh xÃ¡c nháº­n Ä‘Ã£ kiá»ƒm tra vá»›i giÃ¡o viÃªn"
        description="Chá»‰ dÃ¹ng khi Teacher Care Ä‘Ã£ follow-up vÃ  cáº§n chá»‘t tráº¡ng thÃ¡i xá»­ lÃ½ trÃªn há»‡ thá»‘ng."
      />
      <a-select
        v-model:value="rejectReason"
        placeholder="Chá»n lÃ½ do tá»« chá»‘i"
        :options="rejectReasonOptions.map((item) => ({ value: item, label: item }))"
      />
      <a-textarea
        v-model:value="rejectTeacherReply"
        :rows="3"
        maxlength="500"
        placeholder="Pháº£n há»“i chi tiáº¿t tá»« giÃ¡o viÃªn"
      />
      <a-textarea
        v-model:value="rejectOperationNote"
        :rows="3"
        maxlength="500"
        placeholder="Ghi chÃº xÃ¡c minh cá»§a váº­n hÃ nh"
      />
      <a-textarea
        v-model:value="rejectNextAction"
        :rows="3"
        maxlength="500"
        placeholder="BÆ°á»›c xá»­ lÃ½ tiáº¿p theo"
      />
    </div>
  </a-modal>
</template>
