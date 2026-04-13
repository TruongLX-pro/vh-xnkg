import { parseDateTime } from './date'
import type { RequestItem, RequestStatus, RequestType, SourceDepartment } from '../types'

export const rejectReasonOptions = [
  'Không phù hợp lịch dạy',
  'Không thể tiếp nhận lịch học mới',
  'Vấn đề sức khỏe / nghỉ phép',
  'Quá tải / đủ tải dạy',
  'Lý do khác',
]

const statusColorMap: Record<RequestStatus, string> = {
  AwaitingConfirmation: 'gold',
  Confirmed: 'green',
  Rejected: 'red',
  Expired: 'volcano',
  InformationSent: 'blue',
}

const statusLabelMap: Record<RequestStatus, string> = {
  AwaitingConfirmation: 'Chờ xác nhận',
  Confirmed: 'Đã xác nhận',
  Rejected: 'Từ chối',
  Expired: 'Quá hạn',
  InformationSent: 'Đã gửi thông tin',
}

const typeLabelMap: Record<RequestType, string> = {
  'New Opening': 'Báo lớp khai giảng',
  'Teacher Handover': 'Báo lớp chuyển ngang',
  'Schedule Change': 'Báo đổi lịch học',
  'Class Ended': 'Báo lớp kết thúc',
  Other: 'Khác',
}

const typeToneMap: Record<RequestType, string> = {
  'New Opening': 'cyan',
  'Teacher Handover': 'purple',
  'Schedule Change': 'geekblue',
  'Class Ended': 'orange',
  Other: 'default',
}

const sourceLabelMap: Record<SourceDepartment, string> = {
  GVU: 'GVU',
  CM: 'CM',
}

export function getStatusColor(status: RequestStatus) {
  return statusColorMap[status]
}

export function getStatusLabel(status: RequestStatus) {
  return statusLabelMap[status]
}

export function getTypeLabel(type: RequestType) {
  return typeLabelMap[type]
}

export function getTypeTone(type: RequestType) {
  return typeToneMap[type]
}

export function getSourceLabel(source: SourceDepartment) {
  return sourceLabelMap[source]
}

export function getSlaMeta(item: RequestItem) {
  if (!item.requiresTeacherConfirmation) {
    return { tone: 'blue', label: 'Chỉ gửi thông tin' }
  }

  if (item.status === 'Expired') {
    return { tone: 'error', label: 'Quá hạn SLA' }
  }

  if (!item.deadlineConfirmAt) {
    return { tone: 'default', label: 'Chưa có SLA' }
  }

  const now = new Date(2026, 3, 13, 9, 0)
  const deadline = parseDateTime(item.deadlineConfirmAt)
  const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (item.status === 'AwaitingConfirmation' && diffHours <= 6) {
    return { tone: 'warning', label: 'Sắp hết hạn' }
  }

  if (item.status === 'AwaitingConfirmation' && diffHours <= 12) {
    return { tone: 'processing', label: 'Cần ưu tiên' }
  }

  if (item.status === 'Confirmed') {
    return { tone: 'success', label: 'Đã xác nhận' }
  }

  if (item.status === 'Rejected') {
    return { tone: 'error', label: 'Đã từ chối' }
  }

  return { tone: 'default', label: 'Trong hạn' }
}

export function getConfirmationMeta(item: RequestItem) {
  if (item.status !== 'Confirmed' || !item.confirmedAt || !item.deadlineConfirmAt) {
    return null
  }

  return parseDateTime(item.confirmedAt) <= parseDateTime(item.deadlineConfirmAt)
    ? { tone: 'success', label: 'Xác nhận đúng hạn' }
    : { tone: 'warning', label: 'Xác nhận sau hạn' }
}
