export type RequestStatus = 'Pending' | 'Confirmed' | 'Rejected' | 'Expired' | 'Cancelled'
export type RequestType = 'New Opening' | 'Teacher Change'
export type SourceDepartment = 'GVU' | 'CM' | 'Teacher Care'

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
  status: RequestStatus
  sourceDepartment: SourceDepartment
  triggeredBy: string
  teacherName: string
  teacherType: 'GVVN' | 'GVNN'
  oldTeacherName?: string
  startDate: string
  firstSession: string
  scheduleSummary: string
  deadlineConfirmAt: string
  createdAt: string
  confirmedAt?: string
  rejectedAt?: string
  expiredAt?: string
  cancelledAt?: string
  classStatus: string
  noteToTeacher: string
  rejectReason?: string
  rejectNote?: string
  events: EventLog[]
}
