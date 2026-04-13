import { computed, ref } from 'vue'
import { mockRequests } from '../data/mockRequests'
import type { RequestItem, RequestStatus, RequestType, SourceDepartment } from '../types'

const requests = ref<RequestItem[]>(structuredClone(mockRequests))
const selectedId = ref<string>()
const detailVisible = ref(false)
const rejectVisible = ref(false)
const confirmVisible = ref(false)
const popupVisible = ref(true)
const confirmChecked = ref(false)
const rejectReason = ref<string>()
const rejectNote = ref('')
const currentTeacherName = ref('Nguyễn Thị An')

const rejectReasonOptions = [
  'Không phù hợp lịch dạy',
  'Không thể nhận lớp ngày khai giảng',
  'Vấn đề sức khỏe / nghỉ phép',
  'Quá tải / đủ tải dạy',
  'Lý do khác',
]

const statusColor: Record<RequestStatus, string> = {
  Pending: 'gold',
  Confirmed: 'green',
  Rejected: 'red',
  Expired: 'volcano',
  Cancelled: 'default',
}

const statusLabel: Record<RequestStatus, string> = {
  Pending: 'Chờ xác nhận',
  Confirmed: 'Đã xác nhận',
  Rejected: 'Từ chối',
  Expired: 'Quá hạn',
  Cancelled: 'Đã hủy',
}

const typeLabel: Record<RequestType, string> = {
  'New Opening': 'Báo lớp khai giảng',
  'Teacher Change': 'Đổi giáo viên',
}

const sourceLabel: Record<SourceDepartment, string> = {
  GVU: 'GVU',
  CM: 'CM',
  'Teacher Care': 'Teacher Care',
}

const selectedRequest = computed(() =>
  requests.value.find((item) => item.id === selectedId.value),
)

const pendingRequests = computed(() =>
  requests.value.filter((item) => item.status === 'Pending'),
)

const teacherRequests = computed(() =>
  requests.value.filter((item) => item.teacherName === currentTeacherName.value),
)

const teacherPendingRequests = computed(() =>
  teacherRequests.value.filter((item) => item.status === 'Pending'),
)

const stats = computed(() => ({
  Pending: requests.value.filter((item) => item.status === 'Pending').length,
  Confirmed: requests.value.filter((item) => item.status === 'Confirmed').length,
  Rejected: requests.value.filter((item) => item.status === 'Rejected').length,
  Expired: requests.value.filter((item) => item.status === 'Expired').length,
  Cancelled: requests.value.filter((item) => item.status === 'Cancelled').length,
}))

function getTypeLabel(value: RequestType) {
  return typeLabel[value]
}

function getStatusLabel(value: RequestStatus) {
  return statusLabel[value]
}

function getStatusColor(value: RequestStatus) {
  return statusColor[value]
}

function getSourceLabel(value: SourceDepartment) {
  return sourceLabel[value]
}

function parseDateTime(value: string) {
  const [datePart, timePart] = value.split(' ')
  const [day, month, year] = datePart.split('/').map(Number)
  const [hours = 0, minutes = 0] = (timePart ?? '00:00').split(':').map(Number)
  return new Date(year, month - 1, day, hours, minutes)
}

function parseDateOnly(value: string) {
  const [day, month, year] = value.split('/').map(Number)
  return new Date(year, month - 1, day)
}

function getSlaMeta(item: RequestItem) {
  const now = new Date(2026, 3, 9, 11, 0)
  const deadline = parseDateTime(item.deadlineConfirmAt)
  const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (item.status === 'Expired') {
    return { tone: 'error' as const, label: 'Quá hạn SLA' }
  }

  if (item.status === 'Pending' && diffHours <= 6) {
    return { tone: 'warning' as const, label: 'Sắp hết hạn' }
  }

  if (item.status === 'Pending' && diffHours <= 12) {
    return { tone: 'processing' as const, label: 'Cần ưu tiên' }
  }

  if (item.status === 'Confirmed') {
    return { tone: 'success' as const, label: 'Đã xác nhận' }
  }

  return { tone: 'default' as const, label: 'Trong hạn' }
}

function getConfirmationMeta(item: RequestItem) {
  if (item.status !== 'Confirmed' || !item.confirmedAt) {
    return null
  }

  return parseDateTime(item.confirmedAt) <= parseDateTime(item.deadlineConfirmAt)
    ? { tone: 'success' as const, label: 'Xác nhận đúng hạn' }
    : { tone: 'warning' as const, label: 'Xác nhận sau hạn' }
}

function isDateInRange(value: string, from?: string, to?: string) {
  const target = parseDateOnly(value)
  const fromMatched = !from || target >= parseDateOnly(from)
  const toMatched = !to || target <= parseDateOnly(to)
  return fromMatched && toMatched
}

function openDetail(item: RequestItem) {
  selectedId.value = item.id
  detailVisible.value = true
}

function closeDetail() {
  detailVisible.value = false
}

function openConfirm(item: RequestItem) {
  selectedId.value = item.id
  confirmChecked.value = false
  confirmVisible.value = true
}

function openReject(item: RequestItem) {
  selectedId.value = item.id
  rejectReason.value = undefined
  rejectNote.value = ''
  rejectVisible.value = true
}

function submitConfirm() {
  if (!selectedRequest.value || !confirmChecked.value) return

  selectedRequest.value.status = 'Confirmed'
  selectedRequest.value.events.unshift({
    id: `E-${Date.now()}`,
    time: '09/04/2026 11:10',
    type: 'Giáo viên xác nhận',
    actor: selectedRequest.value.teacherName,
    note: 'Xác nhận nhận lớp trên ERP',
  })

  confirmVisible.value = false
  detailVisible.value = false
  popupVisible.value = teacherPendingRequests.value.length > 0
}

function submitReject() {
  if (!selectedRequest.value || !rejectReason.value) return

  selectedRequest.value.status = 'Rejected'
  selectedRequest.value.rejectReason = rejectReason.value
  selectedRequest.value.rejectNote = rejectNote.value
  selectedRequest.value.events.unshift({
    id: `E-${Date.now()}`,
    time: '09/04/2026 11:15',
    type: 'Giáo viên từ chối',
    actor: selectedRequest.value.teacherName,
    note: `Lý do: ${rejectReason.value}`,
  })

  rejectVisible.value = false
  popupVisible.value = teacherPendingRequests.value.length > 0
}

function resend(item: RequestItem) {
  item.events.unshift({
    id: `E-${Date.now()}`,
    time: '09/04/2026 11:20',
    type: 'Gửi nhắc lại',
    actor: 'tc_user_01',
    note: 'Gửi lại thông báo từ queue vận hành',
    channel: 'Telegram',
    result: 'Thành công',
  })
}

export function useTeachingRequests() {
  return {
    requests,
    currentTeacherName,
    teacherRequests,
    teacherPendingRequests,
    selectedRequest,
    pendingRequests,
    stats,
    detailVisible,
    rejectVisible,
    confirmVisible,
    popupVisible,
    confirmChecked,
    rejectReason,
    rejectNote,
    rejectReasonOptions,
    getTypeLabel,
    getStatusLabel,
    getStatusColor,
    getSourceLabel,
    getSlaMeta,
    getConfirmationMeta,
    isDateInRange,
    openDetail,
    closeDetail,
    openConfirm,
    openReject,
    submitConfirm,
    submitReject,
    resend,
  }
}
