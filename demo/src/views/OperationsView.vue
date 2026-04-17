<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import OperationsRequestTable from '../components/request/OperationsRequestTable.vue'
import { useOperationsQueue } from '../composables/useOperationsQueue'
import { useTeachingRequestStore } from '../stores/teachingRequest'

const store = useTeachingRequestStore()
const { requests, isSubmitting, manualVisible } = storeToRefs(store)
const {
  rows,
  statusTab,
  typeFilter,
  sourceFilter,
  resultFilter,
  classSearch,
  teacherSearch,
  startDateFrom,
  startDateTo,
  deadlineFrom,
  deadlineTo,
  resetFilters,
} = useOperationsQueue()

const manualSearch = ref('')
const selectedClassCode = ref<string>()
const manualMessage = ref('')

const classSearchResults = computed(() => {
  const keyword = manualSearch.value.trim().toLowerCase()
  const seen = new Set<string>()

  return requests.value.filter((item) => {
    if (seen.has(item.classCode)) {
      return false
    }

    const matched = !keyword || item.classCode.toLowerCase().includes(keyword)
    if (matched) {
      seen.add(item.classCode)
      return true
    }

    return false
  })
})

const selectedClass = computed(() =>
  classSearchResults.value.find((item) => item.classCode === selectedClassCode.value),
)

function resetManualForm() {
  manualSearch.value = ''
  selectedClassCode.value = undefined
  manualMessage.value = ''
}

watch(manualVisible, (open) => {
  if (open) {
    resetManualForm()
  }
})

async function submitManualRequest() {
  if (!selectedClass.value || !manualMessage.value.trim()) {
    return
  }

  await store.createManualRequest({
    classCode: selectedClass.value.classCode,
    className: selectedClass.value.className,
    courseName: selectedClass.value.courseName,
    level: selectedClass.value.level,
    teacherName: selectedClass.value.teacherName,
    teacherCode: selectedClass.value.teacherCode,
    teacherType: selectedClass.value.teacherType,
    teacherPhone: selectedClass.value.teacherPhone,
    teacherCareName: selectedClass.value.teacherCareName,
    hasPastFirstSession: selectedClass.value.hasPastFirstSession,
    startDate: selectedClass.value.startDate,
    firstSession: selectedClass.value.firstSession,
    scheduleSummary: selectedClass.value.scheduleSummary,
    noteToTeacher: manualMessage.value.trim(),
  })
  statusTab.value = 'Done'
}
</script>

<template>
  <section class="space-y-5">
    <OperationsRequestTable
      :rows="rows"
      :status-tab="statusTab"
      :type-filter="typeFilter"
      :source-filter="sourceFilter"
      :result-filter="resultFilter"
      :class-search="classSearch"
      :teacher-search="teacherSearch"
      :start-date-from="startDateFrom"
      :start-date-to="startDateTo"
      :deadline-from="deadlineFrom"
      :deadline-to="deadlineTo"
      @update:status-tab="statusTab = $event"
      @update:type-filter="typeFilter = $event"
      @update:source-filter="sourceFilter = $event"
      @update:result-filter="resultFilter = $event"
      @update:class-search="classSearch = $event"
      @update:teacher-search="teacherSearch = $event"
      @update:start-date-from="startDateFrom = $event"
      @update:start-date-to="startDateTo = $event"
      @update:deadline-from="deadlineFrom = $event"
      @update:deadline-to="deadlineTo = $event"
      @detail="store.openDetail"
      @resend="store.resendRequest"
      @reject="store.openReject"
      @confirm="store.openConfirm"
      @handle="store.markRequestHandled"
      @open-manual="store.openManualModal"
      @reset="resetFilters"
    />

    <a-modal
      v-model:open="manualVisible"
      title="Thêm thông báo"
      ok-text="Gửi thông báo"
      cancel-text="Hủy"
      :ok-button-props="{ loading: isSubmitting, disabled: !selectedClass || !manualMessage.trim() }"
      @ok="submitManualRequest"
      @cancel="store.closeManualModal()"
    >
      <a-input
        v-model:value="manualSearch"
        placeholder="Search theo mã lớp"
        allow-clear
      />

      <div class="mt-4 space-y-3">
        <div
          v-for="item in classSearchResults"
          :key="item.classCode"
          class="rounded-2xl border p-4 transition"
          :class="selectedClassCode === item.classCode ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'"
          @click="selectedClassCode = item.classCode"
        >
          <div class="flex items-start gap-3">
            <a-radio :checked="selectedClassCode === item.classCode" />
            <div class="min-w-0 flex-1">
              <div class="font-medium text-slate-900">{{ item.classCode }} - {{ item.className }}</div>
              <div class="text-sm text-slate-500">
                {{ item.courseName }} · {{ item.level }} · {{ item.scheduleSummary }}
              </div>
              <div class="mt-1 text-sm text-slate-500">
                {{ item.teacherName }} ({{ item.teacherCode }}) · Nguồn {{ item.hasPastFirstSession ? 'CM' : 'GVU' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <a-textarea
        v-model:value="manualMessage"
        class="mt-4"
        :rows="4"
        placeholder="Nhập nội dung tin nhắn muốn gửi Telegram"
      />
    </a-modal>
  </section>
</template>
