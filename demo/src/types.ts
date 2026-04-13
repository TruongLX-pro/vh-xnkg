export type RequestStatus =
  | 'AwaitingConfirmation'
  | 'Confirmed'
  | 'Rejected'
  | 'Expired'
  | 'InformationSent'

export type RequestType =
  | 'New Opening'
  | 'Teacher Handover'
  | 'Schedule Change'
  | 'Class Ended'
  | 'Other'

export type SourceDepartment = 'GVU' | 'CM'
export type TeacherKind = 'GVVN' | 'GVNN'

export interface EventLog {
  id: string
  time: string
  type: string
  actor: string
  note: string
  channel?: string
  result?: string
}

export interface RequestItem {
  id: string
  classCode: string
  className: string
  courseName: string
  level: string
  requestType: RequestType
  requestTypeDescription: string
  scenarioSummary: string
  status: RequestStatus
  sourceDepartment: SourceDepartment
  triggeredBy: string
  teacherName: string
  teacherCode: string
  teacherType: TeacherKind
  teacherPhone: string
  teacherCareName: string
  teacherHandoverRole?: 'GV cũ' | 'GV mới'
  oldTeacherName?: string
  oldTeacherCode?: string
  oldTeacherPhone?: string
  startDate: string
  firstSession: string
  scheduleSummary: string
  hasPastFirstSession: boolean
  deadlineConfirmAt?: string
  createdAt: string
  notifiedAt?: string
  confirmedAt?: string
  rejectedAt?: string
  expiredAt?: string
  classStatus: string
  noteToTeacher: string
  erpActionUrl: string
  rejectReason?: string
  rejectNote?: string
  requiresTeacherConfirmation: boolean
  events: EventLog[]
}

export interface RequestStats {
  AwaitingConfirmation: number
  Confirmed: number
  Rejected: number
  Expired: number
  InformationSent: number
}

export interface RejectPayload {
  reason: string
  teacherReply: string
  operationNote: string
  nextAction: string
}

export interface ConfirmPayload {
  reason: string
}

export interface TeacherRejectPayload {
  reason: string
}

export interface ManualRequestPayload {
  classCode: string
  className: string
  courseName: string
  level: string
  teacherName: string
  teacherCode: string
  teacherType: TeacherKind
  teacherPhone: string
  teacherCareName: string
  hasPastFirstSession: boolean
  startDate: string
  firstSession: string
  scheduleSummary: string
  noteToTeacher: string
}
