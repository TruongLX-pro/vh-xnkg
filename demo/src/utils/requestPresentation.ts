import { parseDateTime } from './date'
import type {
  ProcessingStatus,
  RequestItem,
  RequestStatus,
  RequestType,
  ResolutionResult,
  SourceDepartment,
} from '../types'

export const rejectReasonOptions = [
  'Không phù hợp lịch dạy',
  'Không thể tiếp nhận lịch học mới',
  'Vấn đề sức khỏe / nghỉ phép',
  'Quá tải / đủ tải dạy',
  'Lý do khác',
]

const processingStatusColorMap: Record<ProcessingStatus, string> = {
  Pending: 'gold',
  InProgress: 'processing',
  Done: 'green',
}

const processingStatusLabelMap: Record<ProcessingStatus, string> = {
  Pending: 'Chờ xử lý',
  InProgress: 'Đang xử lý',
  Done: 'Hoàn thành',
}

const resultColorMap: Record<ResolutionResult, string> = {
  Confirmed: 'green',
  Rejected: 'red',
  Cancelled: 'default',
  InformationSent: 'blue',
  Expired: 'volcano',
}

const resultLabelMap: Record<ResolutionResult, string> = {
  Confirmed: 'Xác nhận',
  Rejected: 'Từ chối',
  Cancelled: 'Hủy',
  InformationSent: 'Đã gửi thông tin',
  Expired: 'Quá hạn',
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
  const map: Record<RequestStatus, string> = {
    AwaitingConfirmation: processingStatusColorMap.Pending,
    Confirmed: resultColorMap.Confirmed,
    Rejected: resultColorMap.Rejected,
    Expired: resultColorMap.Expired,
    InformationSent: resultColorMap.InformationSent,
  }
  return map[status]
}

export function getStatusLabel(status: RequestStatus) {
  const map: Record<RequestStatus, string> = {
    AwaitingConfirmation: 'Chờ xác nhận',
    Confirmed: 'Đã xác nhận',
    Rejected: 'Từ chối',
    Expired: 'Quá hạn',
    InformationSent: 'Đã gửi thông tin',
  }
  return map[status]
}

export function getProcessingStatusColor(status: ProcessingStatus) {
  return processingStatusColorMap[status]
}

export function getProcessingStatusLabel(status: ProcessingStatus) {
  return processingStatusLabelMap[status]
}

export function getResolutionResultColor(result?: ResolutionResult) {
  return result ? resultColorMap[result] : 'default'
}

export function getResolutionResultLabel(result?: ResolutionResult) {
  return result ? resultLabelMap[result] : 'Chưa có kết quả'
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

  if (item.resolutionResult === 'Expired') {
    return { tone: 'error', label: 'Quá hạn SLA' }
  }

  if (!item.deadlineConfirmAt) {
    return { tone: 'default', label: 'Chưa có SLA' }
  }

  const now = new Date(2026, 3, 13, 9, 0)
  const deadline = parseDateTime(item.deadlineConfirmAt)
  const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (item.processingStatus === 'Pending' && diffHours <= 6) {
    return { tone: 'warning', label: 'Sắp hết hạn' }
  }

  if (item.processingStatus === 'Pending' && diffHours <= 12) {
    return { tone: 'processing', label: 'Cần ưu tiên' }
  }

  if (item.resolutionResult === 'Confirmed') {
    return { tone: 'success', label: 'Đã xác nhận' }
  }

  if (item.resolutionResult === 'Rejected') {
    return { tone: 'error', label: 'Đã từ chối' }
  }

  return { tone: 'default', label: 'Trong hạn' }
}

export function getConfirmationMeta(item: RequestItem) {
  if (item.resolutionResult !== 'Confirmed' || !item.confirmedAt || !item.deadlineConfirmAt) {
    return null
  }

  return parseDateTime(item.confirmedAt) <= parseDateTime(item.deadlineConfirmAt)
    ? { tone: 'success', label: 'Xác nhận đúng hạn' }
    : { tone: 'warning', label: 'Xác nhận sau hạn' }
}
