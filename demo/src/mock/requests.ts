import type { RequestItem, RequestType, SourceDepartment, TeacherKind } from '../types'

const CURRENT_TEACHER = {
  name: 'Nguyễn Thị An',
  code: 'TD172',
  type: 'GVVN' as TeacherKind,
  phone: '0901234567',
  teacherCareName: 'Nguyễn Thị Mai',
}

function buildEvent(
  id: string,
  time: string,
  type: string,
  actor: string,
  note: string,
  extra?: Partial<RequestItem['events'][number]>,
) {
  return {
    id,
    time,
    type,
    actor,
    note,
    ...extra,
  }
}

function buildErpActionUrl(requestId: string, status: 'pending' | 'history') {
  return `/giao-vien?tab=${status}&request=${requestId}`
}

function buildTeacherTelegramNote(message: string, erpActionUrl: string) {
  return `${message}\n\nXác nhận trên ERP: ${erpActionUrl}`
}

function buildRequest(input: Omit<RequestItem, 'noteToTeacher'> & { noteMessage: string }) {
  return {
    ...input,
    noteToTeacher: buildTeacherTelegramNote(input.noteMessage, input.erpActionUrl),
  }
}

const teacherPortalRequests: RequestItem[] = [
  buildRequest({
    id: 'RQ-20260413-0001',
    classCode: 'ENG240501',
    className: 'Kids Starters A',
    courseName: 'Tiếng Anh Thiếu nhi',
    level: 'Starters',
    requestType: 'New Opening',
    requestTypeDescription:
      'Tự động phát sinh khi tạo lớp mới ở trạng thái chờ khai giảng hoặc đang học nhưng chưa phát sinh buổi học nào.',
    scenarioSummary:
      'Telegram gửi thông báo khai giảng và kèm link ERP để giáo viên xác nhận nhận lớp ngay trên hệ thống.',
    status: 'AwaitingConfirmation',
    sourceDepartment: 'GVU',
    triggeredBy: 'gvu_hoangnt',
    teacherName: CURRENT_TEACHER.name,
    teacherCode: CURRENT_TEACHER.code,
    teacherType: CURRENT_TEACHER.type,
    teacherPhone: CURRENT_TEACHER.phone,
    teacherCareName: CURRENT_TEACHER.teacherCareName,
    startDate: '15/04/2026',
    firstSession: '15/04/2026 19:00',
    scheduleSummary: 'Thứ 3 - Thứ 5 - Thứ 7 | 19:00 - 20:30',
    hasPastFirstSession: false,
    deadlineConfirmAt: '14/04/2026 17:00',
    createdAt: '13/04/2026 08:10',
    notifiedAt: '13/04/2026 08:12',
    classStatus: 'Chờ khai giảng',
    erpActionUrl: buildErpActionUrl('RQ-20260413-0001', 'pending'),
    noteMessage:
      'Lớp mới chuẩn bị khai giảng. Vui lòng vào ERP để xác nhận nhận lớp trước hạn phản hồi.',
    requiresTeacherConfirmation: true,
    events: [
      buildEvent(
        'E-0001',
        '13/04/2026 08:10',
        'Tạo yêu cầu',
        'Hệ thống',
        'Trigger từ nghiệp vụ báo lớp khai giảng.',
      ),
      buildEvent(
        'E-0002',
        '13/04/2026 08:12',
        'Gửi thông báo Telegram',
        'Hệ thống',
        `Template: NEW_OPENING_CONFIRM | ERP link: ${buildErpActionUrl('RQ-20260413-0001', 'pending')}`,
        { channel: 'Telegram Bot', result: 'Thành công' },
      ),
    ],
  }),
  buildRequest({
    id: 'RQ-20260413-0002',
    classCode: 'ENG240388',
    className: 'Teens Flyers Plus',
    courseName: 'Tiếng Anh Thiếu niên',
    level: 'Flyers',
    requestType: 'Schedule Change',
    requestTypeDescription:
      'Áp dụng với lớp đang học và đã phát sinh buổi trong quá khứ khi giữ nguyên giáo viên và chỉ đổi lịch học.',
    scenarioSummary:
      'Telegram gửi lịch học mới và kèm link ERP để giáo viên xác nhận tiếp tục dạy theo lịch điều chỉnh.',
    status: 'AwaitingConfirmation',
    sourceDepartment: 'CM',
    triggeredBy: 'cm_tranhn',
    teacherName: CURRENT_TEACHER.name,
    teacherCode: CURRENT_TEACHER.code,
    teacherType: CURRENT_TEACHER.type,
    teacherPhone: CURRENT_TEACHER.phone,
    teacherCareName: CURRENT_TEACHER.teacherCareName,
    startDate: '16/04/2026',
    firstSession: '16/04/2026 18:00',
    scheduleSummary: 'Thứ 2 - Thứ 4 - Thứ 6 | 18:00 - 19:30',
    hasPastFirstSession: true,
    deadlineConfirmAt: '14/04/2026 19:00',
    createdAt: '13/04/2026 08:20',
    notifiedAt: '13/04/2026 08:22',
    classStatus: 'Đang học',
    erpActionUrl: buildErpActionUrl('RQ-20260413-0002', 'pending'),
    noteMessage:
      'Lịch học đã thay đổi. Vui lòng vào ERP để xác nhận lịch mới hoặc từ chối nếu không thể tiếp nhận.',
    requiresTeacherConfirmation: true,
    events: [
      buildEvent('E-0003', '13/04/2026 08:20', 'Tạo yêu cầu', 'CM', 'Phát sinh khi điều chỉnh lịch học lớp đang học.'),
      buildEvent(
        'E-0004',
        '13/04/2026 08:22',
        'Gửi thông báo Telegram',
        'Hệ thống',
        `Template: SCHEDULE_CHANGE_CONFIRM | ERP link: ${buildErpActionUrl('RQ-20260413-0002', 'pending')}`,
        { channel: 'Telegram Bot', result: 'Thành công' },
      ),
    ],
  }),
  buildRequest({
    id: 'RQ-20260413-0003',
    classCode: 'ENG240211',
    className: 'Kids Movers B2',
    courseName: 'Tiếng Anh Thiếu nhi',
    level: 'Movers',
    requestType: 'Teacher Handover',
    requestTypeDescription:
      'Áp dụng với lớp đang học và đã phát sinh buổi trong quá khứ khi đổi giáo viên hoặc vừa đổi giáo viên vừa đổi lịch học.',
    scenarioSummary:
      'Telegram thông báo chuyển ngang và teacher mới xác nhận nhận lớp trực tiếp trên ERP.',
    status: 'Confirmed',
    sourceDepartment: 'CM',
    triggeredBy: 'cm_huyennt',
    teacherName: CURRENT_TEACHER.name,
    teacherCode: CURRENT_TEACHER.code,
    teacherType: CURRENT_TEACHER.type,
    teacherPhone: CURRENT_TEACHER.phone,
    teacherCareName: CURRENT_TEACHER.teacherCareName,
    teacherHandoverRole: 'GV mới',
    oldTeacherName: 'Lê Hoàng Minh',
    oldTeacherCode: 'LM204',
    oldTeacherPhone: '0911002200',
    startDate: '09/04/2026',
    firstSession: '09/04/2026 17:45',
    scheduleSummary: 'Thứ 2 - Thứ 5 | 17:45 - 19:15',
    hasPastFirstSession: true,
    deadlineConfirmAt: '08/04/2026 17:00',
    createdAt: '08/04/2026 09:10',
    notifiedAt: '08/04/2026 09:12',
    confirmedAt: '08/04/2026 10:05',
    classStatus: 'Đang học',
    erpActionUrl: buildErpActionUrl('RQ-20260413-0003', 'history'),
    noteMessage:
      'Lớp chuyển ngang sang giáo viên mới. Giáo viên đã xác nhận nhận lớp trên ERP.',
    requiresTeacherConfirmation: true,
    events: [
      buildEvent('E-0005', '08/04/2026 09:10', 'Tạo yêu cầu', 'CM', 'Phát sinh khi đổi giáo viên lớp đang học.'),
      buildEvent(
        'E-0006',
        '08/04/2026 09:12',
        'Gửi thông báo Telegram',
        'Hệ thống',
        `Template: TEACHER_HANDOVER_CONFIRM | ERP link: ${buildErpActionUrl('RQ-20260413-0003', 'history')}`,
        { channel: 'Telegram Bot', result: 'Thành công' },
      ),
      buildEvent(
        'E-0007',
        '08/04/2026 10:05',
        'Giáo viên xác nhận trên ERP',
        `${CURRENT_TEACHER.name} (${CURRENT_TEACHER.code})`,
        'Giáo viên đồng ý tiếp nhận lớp chuyển ngang.',
        { channel: 'ERP', result: 'Thành công' },
      ),
    ],
  }),
  buildRequest({
    id: 'RQ-20260413-0004',
    classCode: 'ENG240309',
    className: 'Kids Starters Night',
    courseName: 'Tiếng Anh Thiếu nhi',
    level: 'Starters',
    requestType: 'Schedule Change',
    requestTypeDescription:
      'Áp dụng với lớp đang học và đã phát sinh buổi trong quá khứ khi giữ nguyên giáo viên và chỉ đổi lịch học.',
    scenarioSummary:
      'Giáo viên đã từ chối lịch mới trên ERP và hệ thống ghi lại lý do để vận hành follow-up.',
    status: 'Rejected',
    sourceDepartment: 'CM',
    triggeredBy: 'gvu_hieunt',
    teacherName: CURRENT_TEACHER.name,
    teacherCode: CURRENT_TEACHER.code,
    teacherType: CURRENT_TEACHER.type,
    teacherPhone: CURRENT_TEACHER.phone,
    teacherCareName: CURRENT_TEACHER.teacherCareName,
    startDate: '10/04/2026',
    firstSession: '10/04/2026 18:30',
    scheduleSummary: 'Thứ 2 - Thứ 4 - Thứ 6 | 18:30 - 20:00',
    hasPastFirstSession: true,
    deadlineConfirmAt: '09/04/2026 16:00',
    createdAt: '09/04/2026 11:10',
    notifiedAt: '09/04/2026 11:12',
    rejectedAt: '09/04/2026 13:05',
    classStatus: 'Đang học',
    erpActionUrl: buildErpActionUrl('RQ-20260413-0004', 'history'),
    noteMessage:
      'Lịch học mới không phù hợp và giáo viên đã từ chối trên ERP. Teacher Care cần xử lý tiếp theo.',
    rejectReason: 'Không phù hợp lịch dạy',
    rejectNote: 'Teacher reply: Trùng lịch lớp cố định chiều thứ 4.',
    requiresTeacherConfirmation: true,
    events: [
      buildEvent('E-0008', '09/04/2026 11:10', 'Tạo yêu cầu', 'GVU', 'Phát sinh khi đổi lịch lớp đang học.'),
      buildEvent(
        'E-0009',
        '09/04/2026 11:12',
        'Gửi thông báo Telegram',
        'Hệ thống',
        `Template: SCHEDULE_CHANGE_CONFIRM | ERP link: ${buildErpActionUrl('RQ-20260413-0004', 'history')}`,
        { channel: 'Telegram Bot', result: 'Thành công' },
      ),
      buildEvent(
        'E-0010',
        '09/04/2026 13:05',
        'Giáo viên từ chối trên ERP',
        `${CURRENT_TEACHER.name} (${CURRENT_TEACHER.code})`,
        'Lý do: Không phù hợp lịch dạy',
        { channel: 'ERP', result: 'Đã ghi nhận' },
      ),
    ],
  }),
  buildRequest({
    id: 'RQ-20260413-0005',
    classCode: 'ENG240155',
    className: 'IELTS Foundation 1',
    courseName: 'IELTS',
    level: 'Foundation',
    requestType: 'Class Ended',
    requestTypeDescription:
      'Áp dụng khi lớp chuyển trạng thái đã kết thúc; chỉ cần gửi thông tin tới giáo viên, không yêu cầu xác nhận lại.',
    scenarioSummary:
      'Telegram vẫn kèm link ERP để giáo viên mở lịch sử thông báo và theo dõi các cập nhật liên quan.',
    status: 'InformationSent',
    sourceDepartment: 'CM',
    triggeredBy: 'tc_ngocb',
    teacherName: CURRENT_TEACHER.name,
    teacherCode: CURRENT_TEACHER.code,
    teacherType: CURRENT_TEACHER.type,
    teacherPhone: CURRENT_TEACHER.phone,
    teacherCareName: CURRENT_TEACHER.teacherCareName,
    startDate: '11/04/2026',
    firstSession: '11/04/2026 20:00',
    scheduleSummary: 'Thứ 3 - Thứ 5 | 20:00 - 21:30',
    hasPastFirstSession: true,
    createdAt: '12/04/2026 08:25',
    notifiedAt: '12/04/2026 08:27',
    classStatus: 'Đã kết thúc',
    erpActionUrl: buildErpActionUrl('RQ-20260413-0005', 'history'),
    noteMessage:
      'Lớp đã kết thúc. Vui lòng mở ERP để xem lại lịch sử thông báo và các đầu việc liên quan.',
    requiresTeacherConfirmation: false,
    events: [
      buildEvent('E-0011', '12/04/2026 08:25', 'Tạo yêu cầu', 'Teacher Care', 'Phát sinh khi lớp chuyển trạng thái đã kết thúc.'),
      buildEvent(
        'E-0012',
        '12/04/2026 08:27',
        'Gửi thông báo Telegram',
        'Hệ thống',
        `Template: CLASS_ENDED_NOTICE | ERP link: ${buildErpActionUrl('RQ-20260413-0005', 'history')}`,
        { channel: 'Telegram Bot', result: 'Thành công' },
      ),
    ],
  }),
]

const genericAwaitingTemplates: Array<{
  requestType: RequestType
  teacherType: TeacherKind
  sourceDepartment: SourceDepartment
  teacherCareName: string
  scheduleSummary: string
  level: string
  courseName: string
  classStatus: string
  hasPastFirstSession: boolean
  triggeredBy: string
  teacherHandoverRole?: 'GV cũ' | 'GV mới'
  oldTeacherName?: string
  oldTeacherCode?: string
  oldTeacherPhone?: string
}> = [
  {
    requestType: 'New Opening',
    teacherType: 'GVVN',
    sourceDepartment: 'GVU',
    teacherCareName: 'Phạm Thu Mai',
    scheduleSummary: 'Thứ 2 - Thứ 4 - Thứ 6 | 18:00 - 19:30',
    level: 'Starters',
    courseName: 'Tiếng Anh Thiếu nhi',
    classStatus: 'Chờ khai giảng',
    hasPastFirstSession: false,
    triggeredBy: 'gvu_auto',
  },
  {
    requestType: 'Teacher Handover',
    teacherType: 'GVNN',
    sourceDepartment: 'CM',
    teacherCareName: 'Lê Nhã Uyên',
    scheduleSummary: 'Thứ 3 - Thứ 5 - Thứ 7 | 19:15 - 20:45',
    level: 'Flyers',
    courseName: 'Tiếng Anh Thiếu niên',
    classStatus: 'Đang học',
    hasPastFirstSession: true,
    triggeredBy: 'cm_auto',
    teacherHandoverRole: 'GV mới',
    oldTeacherName: 'Nguyễn Gia Linh',
    oldTeacherCode: 'GL221',
    oldTeacherPhone: '0988777444',
  },
  {
    requestType: 'Schedule Change',
    teacherType: 'GVVN',
    sourceDepartment: 'CM',
    teacherCareName: 'Ngô Bích Hạnh',
    scheduleSummary: 'Thứ 2 - Thứ 5 | 17:30 - 19:00',
    level: 'Movers',
    courseName: 'Tiếng Anh Thiếu nhi',
    classStatus: 'Đang học',
    hasPastFirstSession: true,
    triggeredBy: 'gvu_schedule',
  },
]

const genericTeacherNames = [
  'Trần Gia Hân',
  'Phạm Minh Châu',
  'Lê Đức Anh',
  'Hoàng Hà My',
  'Samuel Parker',
  'Emily Stone',
  'Vũ Quang Minh',
  'Đặng Bảo Ngọc',
  'Phan Khánh Linh',
  'Nguyễn Minh Khoa',
]

function padNumber(value: number, size = 3) {
  return String(value).padStart(size, '0')
}

function formatDate(day: number) {
  return `${padNumber(day, 2)}/04/2026`
}

function formatTime(slot: number) {
  const startHour = 17 + (slot % 3)
  return `${padNumber(startHour, 2)}:${slot % 2 === 0 ? '00' : '30'}`
}

function buildGenericAwaitingRequest(index: number): RequestItem {
  const template = genericAwaitingTemplates[index % genericAwaitingTemplates.length]
  const requestId = `RQ-20260413-A${padNumber(index + 1, 4)}`
  const teacherName = genericTeacherNames[index % genericTeacherNames.length]
  const teacherCodePrefix = template.teacherType === 'GVNN' ? 'SB' : 'TD'
  const teacherCode = `${teacherCodePrefix}${170 + index}`
  const classNumber = 600 + index
  const day = 15 + (index % 10)
  const startTime = formatTime(index)
  const endTime = formatTime(index + 2)
  const scheduleSummary = template.scheduleSummary.replace(/\d{2}:\d{2} - \d{2}:\d{2}/, `${startTime} - ${endTime}`)
  const deadlineDay = day > 1 ? day - 1 : day
  const erpActionUrl = buildErpActionUrl(requestId, 'pending')
  const message =
    template.requestType === 'Teacher Handover'
      ? 'Lớp đang học phát sinh chuyển ngang. Giáo viên mới vui lòng vào ERP để xác nhận tiếp nhận lớp.'
      : template.requestType === 'Schedule Change'
        ? 'Lịch học đã thay đổi. Giáo viên vui lòng vào ERP để xác nhận lịch mới.'
        : 'Lớp mới chuẩn bị khai giảng. Giáo viên vui lòng vào ERP để xác nhận nhận lớp.'

  return buildRequest({
    id: requestId,
    classCode: `ENG24${classNumber}`,
    className: `${template.level} Batch ${index + 1}`,
    courseName: template.courseName,
    level: template.level,
    requestType: template.requestType,
    requestTypeDescription:
      template.requestType === 'New Opening'
        ? 'Tự động phát sinh khi tạo lớp mới ở trạng thái chờ khai giảng hoặc đang học nhưng chưa phát sinh buổi học nào.'
        : template.requestType === 'Teacher Handover'
          ? 'Áp dụng với lớp đang học và đã phát sinh buổi trong quá khứ khi đổi giáo viên hoặc vừa đổi giáo viên vừa đổi lịch học.'
          : 'Áp dụng với lớp đang học và đã phát sinh buổi trong quá khứ khi giữ nguyên giáo viên và chỉ đổi lịch học.',
    scenarioSummary:
      template.requestType === 'New Opening'
        ? 'Telegram gửi thông báo khai giảng kèm link ERP xác nhận.'
        : template.requestType === 'Teacher Handover'
          ? 'Telegram gửi thông báo chuyển ngang cho teacher mới và link ERP để xác nhận.'
          : 'Telegram gửi lịch học mới kèm link ERP xác nhận.',
    status: 'AwaitingConfirmation',
    sourceDepartment: template.sourceDepartment,
    triggeredBy: template.triggeredBy,
    teacherName,
    teacherCode,
    teacherType: template.teacherType,
    teacherPhone: `09${padNumber(10000000 + index * 317, 8)}`,
    teacherCareName: template.teacherCareName,
    teacherHandoverRole: template.teacherHandoverRole,
    oldTeacherName: template.oldTeacherName,
    oldTeacherCode: template.oldTeacherCode,
    oldTeacherPhone: template.oldTeacherPhone,
    startDate: formatDate(day),
    firstSession: `${formatDate(day)} ${startTime}`,
    scheduleSummary,
    hasPastFirstSession: template.hasPastFirstSession,
    deadlineConfirmAt: `${formatDate(deadlineDay)} ${endTime}`,
    createdAt: `13/04/2026 ${padNumber(8 + (index % 8), 2)}:${index % 2 === 0 ? '10' : '40'}`,
    notifiedAt: `13/04/2026 ${padNumber(8 + (index % 8), 2)}:${index % 2 === 0 ? '12' : '42'}`,
    classStatus: template.classStatus,
    erpActionUrl,
    noteMessage: message,
    requiresTeacherConfirmation: true,
    events: [
      buildEvent(
        `EA${padNumber(index + 1, 4)}-1`,
        `13/04/2026 ${padNumber(8 + (index % 8), 2)}:${index % 2 === 0 ? '10' : '40'}`,
        'Tạo yêu cầu',
        template.sourceDepartment,
        `Trigger tự động từ luồng ${template.requestType}.`,
      ),
      buildEvent(
        `EA${padNumber(index + 1, 4)}-2`,
        `13/04/2026 ${padNumber(8 + (index % 8), 2)}:${index % 2 === 0 ? '12' : '42'}`,
        'Gửi thông báo Telegram',
        'Hệ thống',
        `Template: ${template.requestType.toUpperCase().replaceAll(' ', '_')} | ERP link: ${erpActionUrl}`,
        { channel: 'Telegram Bot', result: 'Thành công' },
      ),
    ],
  })
}

const generatedAwaitingRequests = Array.from({ length: 38 }, (_, index) =>
  buildGenericAwaitingRequest(index),
)

const additionalRequests: RequestItem[] = [
  buildRequest({
    id: 'RQ-20260413-0006',
    classCode: 'ENG240266',
    className: 'Teens Pre-IELTS 3',
    courseName: 'Pre-IELTS',
    level: 'Intermediate',
    requestType: 'Other',
    requestTypeDescription:
      'Bản ghi thủ công do vận hành chủ động thêm vào danh sách thông báo khi phát sinh trường hợp ngoài các trigger tự động.',
    scenarioSummary:
      'Teacher Care thêm tay và gửi Telegram để giáo viên theo dõi thông tin ngoài luồng chuẩn trên ERP.',
    status: 'InformationSent',
    sourceDepartment: 'CM',
    triggeredBy: 'tc_user_01',
    teacherName: 'Lê Hồng Phúc',
    teacherCode: 'LP880',
    teacherType: 'GVNN',
    teacherPhone: '0909555777',
    teacherCareName: 'Đặng Mỹ Linh',
    startDate: '17/04/2026',
    firstSession: '17/04/2026 09:00',
    scheduleSummary: 'Thứ 3 - Thứ 5 - Thứ 7 | 09:00 - 10:30',
    hasPastFirstSession: true,
    createdAt: '13/04/2026 10:00',
    notifiedAt: '13/04/2026 10:04',
    classStatus: 'Đang học',
    erpActionUrl: buildErpActionUrl('RQ-20260413-0006', 'history'),
    noteMessage: 'Thông báo bổ sung do vận hành chủ động gửi. Vui lòng mở ERP để xem chi tiết.',
    requiresTeacherConfirmation: false,
    events: [
      buildEvent('E-0013', '13/04/2026 10:00', 'Tạo yêu cầu thủ công', 'tc_user_01', 'Teacher Care thêm thủ công vào danh sách thông báo.'),
      buildEvent(
        'E-0014',
        '13/04/2026 10:04',
        'Gửi thông báo Telegram',
        'tc_user_01',
        `Template: OTHER_NOTICE | ERP link: ${buildErpActionUrl('RQ-20260413-0006', 'history')}`,
        { channel: 'Telegram Bot', result: 'Thành công' },
      ),
    ],
  }),
  buildRequest({
    id: 'RQ-20260413-0007',
    classCode: 'ENG240512',
    className: 'Kids Flyers Weekend',
    courseName: 'Tiếng Anh Thiếu nhi',
    level: 'Flyers',
    requestType: 'New Opening',
    requestTypeDescription:
      'Tự động phát sinh khi tạo lớp mới ở trạng thái chờ khai giảng hoặc đang học nhưng chưa phát sinh buổi học nào.',
    scenarioSummary: 'Telegram đã gửi nhưng giáo viên chưa xác nhận trên ERP đúng hạn nên request bị quá hạn.',
    status: 'Expired',
    sourceDepartment: 'GVU',
    triggeredBy: 'gvu_lampt',
    teacherName: 'Vũ Nhật Nam',
    teacherCode: 'VN620',
    teacherType: 'GVVN',
    teacherPhone: '0944555888',
    teacherCareName: 'Phan Bảo Trâm',
    startDate: '14/04/2026',
    firstSession: '14/04/2026 08:00',
    scheduleSummary: 'Thứ 7 - Chủ nhật | 08:00 - 09:30',
    hasPastFirstSession: false,
    deadlineConfirmAt: '13/04/2026 08:00',
    createdAt: '12/04/2026 08:00',
    notifiedAt: '12/04/2026 08:03',
    expiredAt: '13/04/2026 08:01',
    classStatus: 'Chờ khai giảng',
    erpActionUrl: buildErpActionUrl('RQ-20260413-0007', 'history'),
    noteMessage:
      'Lớp cuối tuần chưa được xác nhận đúng hạn. Teacher Care cần follow-up trực tiếp với giáo viên.',
    requiresTeacherConfirmation: true,
    events: [
      buildEvent('E-0015', '12/04/2026 08:00', 'Tạo yêu cầu', 'Hệ thống', 'Trigger từ báo lớp khai giảng cuối tuần.'),
      buildEvent(
        'E-0016',
        '12/04/2026 08:03',
        'Gửi thông báo Telegram',
        'Hệ thống',
        `Template: NEW_OPENING_CONFIRM | ERP link: ${buildErpActionUrl('RQ-20260413-0007', 'history')}`,
        { channel: 'Telegram Bot', result: 'Thành công' },
      ),
      buildEvent('E-0017', '13/04/2026 08:01', 'Quá hạn xác nhận', 'Hệ thống', 'Tự động chuyển trạng thái quá hạn khi vượt SLA.'),
    ],
  }),
]

export const mockRequests: RequestItem[] = [
  ...teacherPortalRequests,
  ...generatedAwaitingRequests,
  ...additionalRequests,
]
