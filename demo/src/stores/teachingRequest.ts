import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  addOperationalNote,
  cancelTeachingRequestByOps,
  confirmTeachingRequestByOps,
  confirmTeachingRequestByTeacher,
  createManualInformationRequest,
  getTeachingRequests,
  markTeachingRequestHandled,
  rejectTeachingRequest,
  rejectTeachingRequestByTeacher,
  resendTeachingRequest,
  simulateScheduleChange,
  simulateTeacherChange,
} from '../services/teachingRequestService'
import type {
  ConfirmPayload,
  ManualRequestPayload,
  RejectPayload,
  RequestItem,
  RequestStats,
  TeacherRejectPayload,
} from '../types'
import { rejectReasonOptions } from '../utils/requestPresentation'

function buildStats(requests: RequestItem[]): RequestStats {
  return requests.reduce(
    (summary, item) => {
      summary[item.processingStatus] += 1
      return summary
    },
    {
      Pending: 0,
      InProgress: 0,
      Done: 0,
    } as RequestStats,
  )
}

export const useTeachingRequestStore = defineStore('teaching-request', () => {
  const requests = ref<RequestItem[]>([])
  const isLoaded = ref(false)
  const isLoading = ref(false)
  const isSubmitting = ref(false)

  const selectedRequestId = ref<string>()
  const detailVisible = ref(false)
  const rejectVisible = ref(false)
  const confirmVisible = ref(false)
  const manualVisible = ref(false)
  const confirmReason = ref('')
  const rejectReason = ref<string>()
  const rejectTeacherReply = ref('')
  const rejectOperationNote = ref('')
  const rejectNextAction = ref('')
  const currentTeacherCode = ref('TD172')

  const selectedRequest = computed(() =>
    requests.value.find((item) => item.id === selectedRequestId.value),
  )

  const stats = computed(() => buildStats(requests.value))

  const teacherRequests = computed(() =>
    requests.value.filter(
      (item) => item.teacherCode === currentTeacherCode.value && item.requiresTeacherConfirmation,
    ),
  )

  const teacherPendingRequests = computed(() =>
    teacherRequests.value.filter(
      (item) => item.processingStatus === 'Pending' && !item.resolutionResult,
    ),
  )

  const teacherHistoryRequests = computed(() =>
    teacherRequests.value.filter(
      (item) => item.processingStatus !== 'Pending' || Boolean(item.resolutionResult),
    ),
  )

  const teacherProfile = computed(() => teacherRequests.value[0] ?? null)

  async function loadRequests(force = false) {
    if ((isLoaded.value && !force) || isLoading.value) {
      return
    }

    isLoading.value = true

    try {
      requests.value = await getTeachingRequests()
      isLoaded.value = true
    } finally {
      isLoading.value = false
    }
  }

  function selectRequest(requestId?: string) {
    selectedRequestId.value = requestId
  }

  function openDetail(request: RequestItem) {
    selectRequest(request.id)
    detailVisible.value = true
  }

  function closeDetail() {
    detailVisible.value = false
  }

  function openReject(request: RequestItem) {
    selectRequest(request.id)
    confirmVisible.value = false
    confirmReason.value = ''
    rejectReason.value = undefined
    rejectTeacherReply.value = ''
    rejectOperationNote.value = ''
    rejectNextAction.value = ''
    rejectVisible.value = true
  }

  function closeReject() {
    rejectVisible.value = false
    rejectReason.value = undefined
    rejectTeacherReply.value = ''
    rejectOperationNote.value = ''
    rejectNextAction.value = ''
  }

  function openConfirm(request: RequestItem) {
    selectRequest(request.id)
    rejectVisible.value = false
    rejectReason.value = undefined
    rejectTeacherReply.value = ''
    rejectOperationNote.value = ''
    rejectNextAction.value = ''
    confirmReason.value = ''
    confirmVisible.value = true
  }

  function closeConfirm() {
    confirmVisible.value = false
    confirmReason.value = ''
  }

  function openManualModal() {
    manualVisible.value = true
  }

  function closeManualModal() {
    manualVisible.value = false
  }

  async function rejectSelectedRequest(payload: RejectPayload) {
    if (!selectedRequestId.value || isSubmitting.value) {
      return
    }

    isSubmitting.value = true

    try {
      requests.value = await rejectTeachingRequest(selectedRequestId.value, payload)
      closeReject()
    } finally {
      isSubmitting.value = false
    }
  }

  async function confirmSelectedRequest(payload: ConfirmPayload) {
    if (!selectedRequestId.value || isSubmitting.value) {
      return
    }

    isSubmitting.value = true

    try {
      requests.value = await confirmTeachingRequestByOps(selectedRequestId.value, payload)
      closeConfirm()
    } finally {
      isSubmitting.value = false
    }
  }

  async function confirmTeacherRequest(requestId: string) {
    if (isSubmitting.value) {
      return
    }

    isSubmitting.value = true

    try {
      requests.value = await confirmTeachingRequestByTeacher(requestId)
    } finally {
      isSubmitting.value = false
    }
  }

  async function rejectTeacherRequest(requestId: string, payload: TeacherRejectPayload) {
    if (isSubmitting.value) {
      return
    }

    isSubmitting.value = true

    try {
      requests.value = await rejectTeachingRequestByTeacher(requestId, payload)
    } finally {
      isSubmitting.value = false
    }
  }

  async function resendRequest(request: RequestItem) {
    if (isSubmitting.value) {
      return
    }

    isSubmitting.value = true

    try {
      requests.value = await resendTeachingRequest(request.id)
    } finally {
      isSubmitting.value = false
    }
  }

  async function addRequestNote(note: string) {
    if (!selectedRequestId.value || !note.trim() || isSubmitting.value) {
      return
    }

    isSubmitting.value = true

    try {
      requests.value = await addOperationalNote(selectedRequestId.value, note.trim())
    } finally {
      isSubmitting.value = false
    }
  }

  async function createManualRequest(payload: ManualRequestPayload) {
    if (isSubmitting.value) {
      return
    }

    isSubmitting.value = true

    try {
      requests.value = await createManualInformationRequest(payload)
      closeManualModal()
    } finally {
      isSubmitting.value = false
    }
  }

  async function markSelectedRequestHandled() {
    if (!selectedRequestId.value || isSubmitting.value) {
      return
    }

    isSubmitting.value = true

    try {
      requests.value = await markTeachingRequestHandled(selectedRequestId.value)
      closeDetail()
    } finally {
      isSubmitting.value = false
    }
  }

  async function markRequestHandled(request: RequestItem) {
    selectRequest(request.id)
    await markSelectedRequestHandled()
  }

  async function cancelSelectedRequest(reason: string) {
    if (!selectedRequestId.value || !reason.trim() || isSubmitting.value) {
      return
    }

    isSubmitting.value = true

    try {
      requests.value = await cancelTeachingRequestByOps(selectedRequestId.value, reason.trim())
      closeDetail()
    } finally {
      isSubmitting.value = false
    }
  }

  async function simulateSelectedTeacherChange() {
    if (!selectedRequestId.value || isSubmitting.value) {
      return
    }

    isSubmitting.value = true

    try {
      requests.value = await simulateTeacherChange(selectedRequestId.value)
      closeDetail()
    } finally {
      isSubmitting.value = false
    }
  }

  async function simulateSelectedScheduleChange() {
    if (!selectedRequestId.value || isSubmitting.value) {
      return
    }

    isSubmitting.value = true

    try {
      requests.value = await simulateScheduleChange(selectedRequestId.value)
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    requests,
    isLoaded,
    isLoading,
    isSubmitting,
    selectedRequest,
    detailVisible,
    rejectVisible,
    confirmVisible,
    manualVisible,
    confirmReason,
    rejectReason,
    rejectTeacherReply,
    rejectOperationNote,
    rejectNextAction,
    rejectReasonOptions,
    stats,
    currentTeacherCode,
    teacherProfile,
    teacherPendingRequests,
    teacherHistoryRequests,
    loadRequests,
    openDetail,
    closeDetail,
    openReject,
    closeReject,
    openConfirm,
    closeConfirm,
    openManualModal,
    closeManualModal,
    rejectSelectedRequest,
    confirmSelectedRequest,
    confirmTeacherRequest,
    rejectTeacherRequest,
    resendRequest,
    addRequestNote,
    createManualRequest,
    markSelectedRequestHandled,
    markRequestHandled,
    cancelSelectedRequest,
    simulateSelectedTeacherChange,
    simulateSelectedScheduleChange,
  }
})
