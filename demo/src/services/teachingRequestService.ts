import { mockRequests } from '../mock/requests'
import type {
  ConfirmPayload,
  ManualRequestPayload,
  ProcessingStatus,
  RejectPayload,
  RequestItem,
  ResolutionResult,
  TeacherKind,
  TeacherRejectPayload,
} from '../types'

let requestDb = structuredClone(mockRequests)

function cloneRequests() {
  return structuredClone(requestDb) as RequestItem[]
}

function findRequest(requestId: string) {
  return requestDb.find((item) => item.id === requestId)
}

function appendEvent(request: RequestItem, event: RequestItem['events'][number]) {
  request.events.unshift(event)
}

function syncLegacyStatus(request: RequestItem) {
  if (request.processingStatus === 'Pending') {
    request.status = 'AwaitingConfirmation'
    return
  }

  if (request.resolutionResult === 'Confirmed') {
    request.status = 'Confirmed'
    return
  }

  if (request.resolutionResult === 'Rejected') {
    request.status = 'Rejected'
    return
  }

  if (request.resolutionResult === 'Expired') {
    request.status = 'Expired'
    return
  }

  if (request.resolutionResult === 'InformationSent' || request.resolutionResult === 'Cancelled') {
    request.status = 'InformationSent'
  }
}

function applyResolution(
  request: RequestItem,
  processingStatus: ProcessingStatus,
  resolutionResult?: ResolutionResult,
  time?: string,
) {
  request.processingStatus = processingStatus
  request.resolutionResult = resolutionResult

  if (resolutionResult === 'Confirmed' && time) {
    request.confirmedAt = time
    request.closedAt = time
  }

  if (resolutionResult === 'Rejected' && time) {
    request.rejectedAt = time
  }

  if (resolutionResult === 'Expired' && time) {
    request.expiredAt = time
  }

  if (
    processingStatus === 'Done'
    && resolutionResult
    && ['Confirmed', 'Rejected', 'Cancelled', 'InformationSent'].includes(resolutionResult)
    && time
  ) {
    request.closedAt = time
  }

  syncLegacyStatus(request)
}

function wait(ms = 120) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function buildRequestId() {
  return `RQ-${Date.now()}`
}

function buildTeacherMessage(message: string, erpActionUrl: string) {
  return `${message}\n\nXác nhận trên ERP: ${erpActionUrl}`
}

function buildErpActionUrl(requestId: string, status: 'pending' | 'history') {
  return `/giao-vien?tab=${status}&request=${requestId}`
}

function buildNextTeacher(request: RequestItem) {
  const nextTeacherType: TeacherKind = request.teacherType === 'GVVN' ? 'GVNN' : 'GVVN'

  return {
    teacherName: nextTeacherType === 'GVNN' ? 'Sophie Brown' : 'Trần Hoài Thu',
    teacherCode: nextTeacherType === 'GVNN' ? 'SB3124' : 'TD481',
    teacherType: nextTeacherType,
    teacherPhone: nextTeacherType === 'GVNN' ? '0911888222' : '0903222444',
    teacherCareName: request.teacherCareName,
  }
}

export async function getTeachingRequests() {
  await wait()
  return cloneRequests()
}

export async function rejectTeachingRequest(requestId: string, payload: RejectPayload) {
  await wait()

  const request = findRequest(requestId)
  if (!request) {
    throw new Error('Request không tồn tại.')
  }

  applyResolution(request, 'InProgress', 'Rejected', '13/04/2026 09:30')
  request.rejectReason = payload.reason
  request.rejectNote = [
    payload.teacherReply ? `Teacher reply: ${payload.teacherReply}` : '',
    payload.operationNote ? `Operation note: ${payload.operationNote}` : '',
    payload.nextAction ? `Next action: ${payload.nextAction}` : '',
  ]
    .filter(Boolean)
    .join(' | ')

  appendEvent(request, {
    id: `E-${Date.now()}`,
    time: '13/04/2026 09:30',
    type: 'Vận hành ghi nhận từ chối',
    actor: 'Teacher Care',
    note: [
      `Lý do: ${payload.reason}`,
      payload.teacherReply ? `Teacher reply: ${payload.teacherReply}` : '',
      payload.operationNote ? `Operation note: ${payload.operationNote}` : '',
      payload.nextAction ? `Next action: ${payload.nextAction}` : '',
    ]
      .filter(Boolean)
      .join(' | '),
  })

  return cloneRequests()
}

export async function confirmTeachingRequestByOps(requestId: string, payload: ConfirmPayload) {
  await wait()

  const request = findRequest(requestId)
  if (!request) {
    throw new Error('Request không tồn tại.')
  }

  applyResolution(request, 'Done', 'Confirmed', '13/04/2026 09:25')

  appendEvent(request, {
    id: `E-${Date.now()}`,
    time: '13/04/2026 09:25',
    type: 'Vận hành chuyển xác nhận',
    actor: 'Teacher Care',
    note: `Lý do: ${payload.reason}`,
    channel: 'ERP',
  })

  return cloneRequests()
}

export async function confirmTeachingRequestByTeacher(requestId: string) {
  await wait()

  const request = findRequest(requestId)
  if (!request) {
    throw new Error('Request không tồn tại.')
  }

  applyResolution(request, 'Done', 'Confirmed', '13/04/2026 09:18')

  appendEvent(request, {
    id: `E-${Date.now()}`,
    time: '13/04/2026 09:18',
    type: 'Giáo viên xác nhận trên ERP',
    actor: `${request.teacherName} (${request.teacherCode})`,
    note: 'Giáo viên đã vào ERP và xác nhận thông báo.',
    channel: 'ERP',
    result: 'Thành công',
  })

  return cloneRequests()
}

export async function rejectTeachingRequestByTeacher(
  requestId: string,
  payload: TeacherRejectPayload,
) {
  await wait()

  const request = findRequest(requestId)
  if (!request) {
    throw new Error('Request không tồn tại.')
  }

  applyResolution(request, 'InProgress', 'Rejected', '13/04/2026 09:22')
  request.rejectReason = payload.reason

  appendEvent(request, {
    id: `E-${Date.now()}`,
    time: '13/04/2026 09:22',
    type: 'Giáo viên từ chối trên ERP',
    actor: `${request.teacherName} (${request.teacherCode})`,
    note: `Lý do: ${payload.reason}`,
    channel: 'ERP',
    result: 'Đã ghi nhận',
  })

  return cloneRequests()
}

export async function resendTeachingRequest(requestId: string) {
  await wait()

  const request = findRequest(requestId)
  if (!request) {
    throw new Error('Request không tồn tại.')
  }

  appendEvent(request, {
    id: `E-${Date.now()}`,
    time: '13/04/2026 09:40',
    type: request.requiresTeacherConfirmation ? 'Gửi lại Telegram kèm link ERP' : 'Gửi lại thông tin Telegram',
    actor: 'tc_user_01',
    note: request.requiresTeacherConfirmation
      ? `Teacher Care gửi lại Telegram để giáo viên xác nhận trên ERP tại ${request.erpActionUrl}.`
      : `Teacher Care gửi lại Telegram để giáo viên theo dõi trên ERP tại ${request.erpActionUrl}.`,
    channel: 'Telegram Bot',
    result: 'Thành công',
  })

  return cloneRequests()
}

export async function addOperationalNote(requestId: string, note: string) {
  await wait()

  const request = findRequest(requestId)
  if (!request) {
    throw new Error('Request không tồn tại.')
  }

  appendEvent(request, {
    id: `E-${Date.now()}`,
    time: '13/04/2026 09:45',
    type: 'Ghi chú vận hành',
    actor: 'tc_user_01',
    note,
  })

  return cloneRequests()
}

export async function createManualInformationRequest(payload: ManualRequestPayload) {
  await wait()

  const requestId = buildRequestId()
  const erpActionUrl = `/giao-vien?tab=history&request=${requestId}`
  const request: RequestItem = {
    id: requestId,
    classCode: payload.classCode,
    className: payload.className,
    courseName: payload.courseName,
    level: payload.level,
    requestType: 'Other',
    requestTypeDescription:
      'Bản ghi thủ công do vận hành chủ động thêm vào danh sách thông báo khi phát sinh trường hợp ngoài các trigger tự động.',
    scenarioSummary: 'Teacher Care tạo tay và gửi Telegram để giáo viên nhận thông tin bổ sung trên ERP.',
    processingStatus: 'Done',
    resolutionResult: 'InformationSent',
    status: 'InformationSent',
    sourceDepartment: payload.hasPastFirstSession ? 'CM' : 'GVU',
    triggeredBy: 'tc_user_01',
    teacherName: payload.teacherName,
    teacherCode: payload.teacherCode,
    teacherType: payload.teacherType,
    teacherPhone: payload.teacherPhone,
    teacherCareName: payload.teacherCareName,
    hasPastFirstSession: payload.hasPastFirstSession,
    startDate: payload.startDate,
    firstSession: payload.firstSession,
    scheduleSummary: payload.scheduleSummary,
    createdAt: '13/04/2026 09:50',
    notifiedAt: '13/04/2026 09:52',
    classStatus: 'Đang học',
    noteToTeacher: buildTeacherMessage(payload.noteToTeacher, erpActionUrl),
    erpActionUrl,
    requiresTeacherConfirmation: false,
    events: [
      {
        id: `E-${Date.now()}-1`,
        time: '13/04/2026 09:50',
        type: 'Tạo yêu cầu thủ công',
        actor: 'tc_user_01',
        note: 'Teacher Care chủ động thêm lớp vào danh sách thông báo.',
      },
      {
        id: `E-${Date.now()}-2`,
        time: '13/04/2026 09:52',
        type: 'Gửi thông báo Telegram',
        actor: 'tc_user_01',
        note: `Template: OTHER_NOTICE | ERP link: ${erpActionUrl}`,
        channel: 'Telegram Bot',
        result: 'Thành công',
      },
    ],
  }

  requestDb = [request, ...requestDb]

  return cloneRequests()
}

export async function markTeachingRequestHandled(requestId: string) {
  await wait()

  const request = findRequest(requestId)
  if (!request) {
    throw new Error('Request không tồn tại.')
  }

  const resolvedAt = '13/04/2026 10:05'
  applyResolution(request, 'Done', request.resolutionResult, resolvedAt)

  appendEvent(request, {
    id: `E-${Date.now()}`,
    time: resolvedAt,
    type: 'Vận hành đánh dấu đã xử lý',
    actor: 'Teacher Care',
    note: `Kết quả xử lý giữ nguyên: ${request.resolutionResult ?? 'Chưa có kết quả'}.`,
  })

  return cloneRequests()
}

export async function cancelTeachingRequestByOps(requestId: string, reason: string) {
  await wait()

  const request = findRequest(requestId)
  if (!request) {
    throw new Error('Request không tồn tại.')
  }

  const cancelledAt = '13/04/2026 10:10'
  applyResolution(request, 'Done', 'Cancelled', cancelledAt)

  appendEvent(request, {
    id: `E-${Date.now()}`,
    time: cancelledAt,
    type: 'Vận hành hủy bản ghi',
    actor: 'Teacher Care',
    note: reason,
  })

  return cloneRequests()
}

export async function simulateTeacherChange(requestId: string) {
  await wait()

  const request = findRequest(requestId)
  if (!request) {
    throw new Error('Request không tồn tại.')
  }

  if (request.processingStatus !== 'Pending') {
    throw new Error('Chỉ mô phỏng đổi giáo viên khi bản ghi đang chờ xử lý.')
  }

  const changedAt = '13/04/2026 10:20'
  const nextTeacher = buildNextTeacher(request)
  const newRequestId = buildRequestId()
  const newErpActionUrl = buildErpActionUrl(newRequestId, 'pending')

  request.erpActionUrl = buildErpActionUrl(request.id, 'history')
  applyResolution(request, 'Done', 'Cancelled', changedAt)
  appendEvent(request, {
    id: `E-${Date.now()}`,
    time: changedAt,
    type: 'Hệ thống hủy bản ghi cũ',
    actor: 'Hệ thống',
    note: 'Lớp được đổi giáo viên khi bản ghi cũ còn chờ xử lý. Bản ghi này được chuyển sang lịch sử với kết quả hủy.',
  })

  const newRequest: RequestItem = {
    ...structuredClone(request),
    id: newRequestId,
    teacherName: nextTeacher.teacherName,
    teacherCode: nextTeacher.teacherCode,
    teacherType: nextTeacher.teacherType,
    teacherPhone: nextTeacher.teacherPhone,
    teacherCareName: nextTeacher.teacherCareName,
    triggeredBy: 'ops_demo',
    processingStatus: 'Pending',
    resolutionResult: undefined,
    status: 'AwaitingConfirmation',
    createdAt: changedAt,
    notifiedAt: '13/04/2026 10:22',
    confirmedAt: undefined,
    rejectedAt: undefined,
    expiredAt: undefined,
    closedAt: undefined,
    rejectReason: undefined,
    rejectNote: undefined,
    erpActionUrl: newErpActionUrl,
    noteToTeacher: buildTeacherMessage(
      'Lớp được cập nhật sang giáo viên mới. Vui lòng vào ERP để xác nhận nhận lớp.',
      newErpActionUrl,
    ),
    events: [
      {
        id: `E-${Date.now()}-new-1`,
        time: changedAt,
        type: 'Tạo bản ghi mới sau đổi giáo viên',
        actor: 'Hệ thống',
        note: `Bản ghi mới được tạo cho ${nextTeacher.teacherName} (${nextTeacher.teacherCode}).`,
      },
      {
        id: `E-${Date.now()}-new-2`,
        time: '13/04/2026 10:22',
        type: 'Gửi thông báo Telegram',
        actor: 'Hệ thống',
        note: `Template: ${request.requestType.toUpperCase().replaceAll(' ', '_')} | ERP link: ${newErpActionUrl}`,
        channel: 'Telegram Bot',
        result: 'Thành công',
      },
    ],
  }

  requestDb = [newRequest, ...requestDb]
  return cloneRequests()
}

export async function simulateScheduleChange(requestId: string) {
  await wait()

  const request = findRequest(requestId)
  if (!request) {
    throw new Error('Request không tồn tại.')
  }

  if (request.processingStatus !== 'Pending') {
    throw new Error('Chỉ mô phỏng đổi lịch khi bản ghi đang chờ xử lý.')
  }

  request.startDate = '18/04/2026'
  request.firstSession = '18/04/2026 20:00'
  request.scheduleSummary = 'Thứ 2 - Thứ 4 - Thứ 6 | 20:00 - 21:30'
  request.deadlineConfirmAt = '17/04/2026 18:00'
  request.noteToTeacher = buildTeacherMessage(
    'Lịch học đã được cập nhật. Vui lòng kiểm tra lại thông tin mới trên ERP trước khi phản hồi.',
    request.erpActionUrl,
  )

  appendEvent(request, {
    id: `E-${Date.now()}`,
    time: '13/04/2026 10:30',
    type: 'Hệ thống cập nhật lịch học',
    actor: 'Hệ thống',
    note: 'Lịch học được cập nhật trực tiếp trên bản ghi hiện tại vì bản ghi vẫn đang chờ xử lý.',
  })

  return cloneRequests()
}

export function buildTelegramNote(message: string, erpActionUrl: string) {
  return buildTeacherMessage(message, erpActionUrl)
}
