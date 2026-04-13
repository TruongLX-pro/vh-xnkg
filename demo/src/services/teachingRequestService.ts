import { mockRequests } from '../mock/requests'
import type {
  ConfirmPayload,
  ManualRequestPayload,
  RejectPayload,
  RequestItem,
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

function wait(ms = 120) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function buildRequestId() {
  return `RQ-${Date.now()}`
}

function buildTeacherMessage(message: string, erpActionUrl: string) {
  return `${message}\n\nXác nhận trên ERP: ${erpActionUrl}`
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

  request.status = 'Rejected'
  request.rejectedAt = '13/04/2026 09:30'
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
    type: 'Vận hành chuyển từ chối',
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

  request.status = 'Confirmed'
  request.confirmedAt = '13/04/2026 09:25'

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

  request.status = 'Confirmed'
  request.confirmedAt = '13/04/2026 09:18'

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

  request.status = 'Rejected'
  request.rejectedAt = '13/04/2026 09:22'
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

export function buildTelegramNote(message: string, erpActionUrl: string) {
  return buildTeacherMessage(message, erpActionUrl)
}
