# BRD Chi Tiết Field-Level

## 1. Thông tin tài liệu
- Tài liệu: BRD chi tiết field-level
- Phạm vi: MVP quy trình xác nhận khai giảng lớp mới và đổi giáo viên trước buổi học đầu tiên
- Liên kết tham chiếu:
  - `PRD_xac_nhan_khai_giang_giao_vien.md`
  - `User_Stories_AC_xac_nhan_khai_giang_giao_vien.md`
- Ngày: 2026-04-09

## 2. Mục tiêu tài liệu
Tài liệu này mô tả chi tiết các field ở từng màn hình dành cho giáo viên và vận hành trong module `Xác nhận lịch dạy`, bao gồm:
- Mục đích field
- Loại dữ liệu
- Nguồn dữ liệu
- Rule hiển thị
- Rule nhập liệu / validate
- Hành động liên quan

## 3. Quy ước chung
### 3.1 Trạng thái request
- `Pending`: chờ giáo viên xác nhận
- `Confirmed`: giáo viên đã nhận lớp
- `Rejected`: giáo viên từ chối lớp
- `Expired`: quá SLA chưa phản hồi
- `Cancelled`: request bị hủy do lớp hủy hoặc đã đổi giáo viên khác

### 3.2 Loại request
- `New Opening`: báo lớp khai giảng mới
- `Teacher Change`: đổi giáo viên trước buổi đầu

### 3.3 Quy ước dữ liệu
- ERP là nguồn dữ liệu gốc cho lớp, giáo viên, lịch học.
- Mỗi request lưu một snapshot dữ liệu tại thời điểm phát sinh.
- Thời gian hiển thị theo múi giờ hệ thống vận hành.

## 4. Màn hình cho giáo viên

## 4.1 Màn hình popup thông báo có lớp cần xác nhận
### Mục đích
Hiển thị ngay khi giáo viên đăng nhập hoặc khi có request mới, giúp giáo viên biết có lớp cần xác nhận và điều hướng sang màn hình chi tiết.

### Danh sách field
| Field key | Nhãn hiển thị | Loại dữ liệu | Bắt buộc | Nguồn dữ liệu | Rule hiển thị | Rule/Validate |
|---|---|---|---|---|---|---|
| request_count | Số lớp chờ xác nhận | Number | Có | System count | Hiển thị khi có ít nhất 1 request `Pending` | Giá trị >= 1 |
| popup_title | Tiêu đề popup | Text | Có | Static/config | Luôn hiển thị | Ví dụ: "Bạn có lớp mới cần xác nhận" |
| class_code | Mã lớp | Text | Có | Request snapshot | Hiển thị cho từng request | Read only |
| request_type_label | Loại yêu cầu | Text | Có | Request type | Hiển thị cho từng request | Mapping từ enum |
| start_date | Ngày bắt đầu | Date | Có | Request snapshot | Hiển thị cho từng request | Format ngày chuẩn hệ thống |
| schedule_summary | Lịch học | Text | Có | Request snapshot | Hiển thị cho từng request | Read only |
| level | Level | Text | Có | Request snapshot | Hiển thị nếu có dữ liệu | Read only |
| deadline_confirm_at | Hạn xác nhận | Datetime | Có | System SLA | Hiển thị cho từng request | Read only |
| btn_view_detail | Xem chi tiết | Button | Có | UI action | Luôn hiển thị | Điều hướng tới màn danh sách hoặc chi tiết |
| btn_confirm_now | Xác nhận ngay | Button | Có | UI action | Chỉ hiển thị với request `Pending` | Mở popup xác nhận nhận lớp |

### Rule nghiệp vụ
- Popup chỉ hiển thị với request ở trạng thái `Pending`.
- Nếu có nhiều request `Pending`, popup có thể hiển thị theo danh sách hoặc theo số lượng tổng hợp tùy thiết kế UI.
- Popup không hiển thị cho request `Confirmed`, `Rejected`, `Expired`, `Cancelled`.

## 4.2 Màn hình danh sách lớp chờ xác nhận của giáo viên
### Mục đích
Cho phép giáo viên theo dõi toàn bộ các request đang cần thao tác.

### Danh sách filter/search
| Field key | Nhãn hiển thị | Loại dữ liệu | Bắt buộc | Nguồn dữ liệu | Rule hiển thị | Rule/Validate |
|---|---|---|---|---|---|---|
| tab_pending | Chờ xác nhận | Tab | Có | UI | Mặc định active | Chỉ hiển thị request `Pending` |
| tab_history | Lịch sử | Tab | Có | UI | Luôn hiển thị | Hiển thị các request đã xử lý |
| filter_request_type | Loại yêu cầu | Dropdown | Không | Request type | Luôn hiển thị | Giá trị: `All`, `New Opening`, `Teacher Change` |
| search_class_code | Mã lớp | Text search | Không | Request snapshot | Luôn hiển thị | Tìm gần đúng theo mã lớp |

### Danh sách cột
| Field key | Nhãn hiển thị | Loại dữ liệu | Bắt buộc | Nguồn dữ liệu | Rule hiển thị | Rule/Validate |
|---|---|---|---|---|---|---|
| request_id | Mã request | Text | Có | System | Có thể ẩn ở UI, dùng cho tracking | Unique |
| class_code | Mã lớp | Text | Có | Request snapshot | Luôn hiển thị | Read only |
| request_type_label | Loại yêu cầu | Text | Có | Request type | Luôn hiển thị | Mapping enum |
| start_date | Ngày bắt đầu | Date | Có | Request snapshot | Luôn hiển thị | Read only |
| schedule_summary | Lịch học | Text | Có | Request snapshot | Luôn hiển thị | Read only |
| level | Level | Text | Không | Request snapshot | Hiển thị nếu có | Read only |
| deadline_confirm_at | Hạn xác nhận | Datetime | Có | SLA engine | Luôn hiển thị | Read only |
| status | Trạng thái | Status tag | Có | Request status | Luôn hiển thị | Mapping enum |
| action_view | Xem chi tiết | Button/link | Có | UI action | Luôn hiển thị | Mở màn chi tiết |
| action_confirm | Nhận lớp | Button | Không | UI action | Chỉ hiển thị nếu `Pending` | Mở popup xác nhận |
| action_reject | Từ chối | Button | Không | UI action | Chỉ hiển thị nếu `Pending` | Mở popup từ chối |

### Rule nghiệp vụ
- Giáo viên chỉ nhìn thấy request của chính mình.
- Mặc định sắp xếp theo `deadline_confirm_at` tăng dần.
- Tab `Lịch sử` hiển thị request `Confirmed`, `Rejected`, `Expired`, `Cancelled`.

## 4.3 Màn hình chi tiết request của giáo viên
### Mục đích
Hiển thị đầy đủ thông tin lớp và cho phép giáo viên xác nhận hoặc từ chối.

### Nhóm field: thông tin request
| Field key | Nhãn hiển thị | Loại dữ liệu | Bắt buộc | Nguồn dữ liệu | Rule hiển thị | Rule/Validate |
|---|---|---|---|---|---|---|
| request_id | Mã yêu cầu | Text | Có | System | Có thể ẩn tùy UI | Read only |
| request_type_label | Loại yêu cầu | Text | Có | Request type | Luôn hiển thị | Read only |
| status | Trạng thái | Status tag | Có | Request status | Luôn hiển thị | Read only |
| created_at | Thời điểm tạo yêu cầu | Datetime | Có | System | Luôn hiển thị | Read only |
| deadline_confirm_at | Hạn xác nhận | Datetime | Có | SLA engine | Luôn hiển thị | Read only |

### Nhóm field: thông tin lớp
| Field key | Nhãn hiển thị | Loại dữ liệu | Bắt buộc | Nguồn dữ liệu | Rule hiển thị | Rule/Validate |
|---|---|---|---|---|---|---|
| class_code | Mã lớp | Text | Có | Request snapshot | Luôn hiển thị | Read only |
| class_name | Tên lớp | Text | Không | Request snapshot | Hiển thị nếu có | Read only |
| course_name | Khóa học | Text | Không | Request snapshot | Hiển thị nếu có | Read only |
| program_type | Loại chương trình | Text | Không | Request snapshot | Hiển thị nếu có | Read only |
| level | Level | Không | Text | Request snapshot | Hiển thị nếu có | Read only |
| start_date | Ngày bắt đầu | Date | Có | Request snapshot | Luôn hiển thị | Read only |
| first_session_datetime | Buổi học đầu tiên | Datetime | Không | Request snapshot | Hiển thị nếu có | Read only |
| schedule_summary | Lịch học | Text | Có | Request snapshot | Luôn hiển thị | Read only |
| center_name | Trung tâm/đơn vị | Text | Không | ERP | Hiển thị nếu có | Read only |
| note_to_teacher | Ghi chú tới giáo viên | Text area | Không | Template/config | Hiển thị nếu có | Read only |

### Nhóm field: hành động
| Field key | Nhãn hiển thị | Loại dữ liệu | Bắt buộc | Nguồn dữ liệu | Rule hiển thị | Rule/Validate |
|---|---|---|---|---|---|---|
| btn_confirm | Nhận lớp | Button | Không | UI action | Chỉ hiển thị khi `Pending` | Mở popup confirm |
| btn_reject | Từ chối lớp | Button | Không | UI action | Chỉ hiển thị khi `Pending` | Mở popup reject |
| btn_back | Quay lại | Button | Có | UI action | Luôn hiển thị | Quay lại danh sách |

## 4.4 Popup xác nhận nhận lớp
### Mục đích
Yêu cầu giáo viên xác nhận lần cuối trước khi đổi trạng thái request sang `Confirmed`.

### Danh sách field
| Field key | Nhãn hiển thị | Loại dữ liệu | Bắt buộc | Nguồn dữ liệu | Rule hiển thị | Rule/Validate |
|---|---|---|---|---|---|---|
| confirm_title | Tiêu đề popup | Text | Có | Static | Luôn hiển thị | Ví dụ: "Xác nhận nhận lớp" |
| confirm_message | Nội dung xác nhận | Text | Có | Template/static | Luôn hiển thị | Nêu rõ GV xác nhận đã nhận thông tin lớp |
| checkbox_acknowledge | Tôi đã nhận thông tin lớp và đồng ý dạy buổi đầu | Checkbox | Có | User input | Hiển thị trước khi submit | Bắt buộc tick mới cho submit |
| btn_submit_confirm | Xác nhận | Button | Có | UI action | Luôn hiển thị | Chỉ active khi checkbox được tick |
| btn_cancel | Hủy | Button | Có | UI action | Luôn hiển thị | Đóng popup |

### Rule nghiệp vụ
- Khi submit thành công, request chuyển sang `Confirmed`.
- Ghi nhận `confirmed_at`, `confirmed_by`.

## 4.5 Popup từ chối lớp
### Mục đích
Thu thập lý do từ chối lớp để vận hành xử lý tiếp.

### Danh sách field
| Field key | Nhãn hiển thị | Loại dữ liệu | Bắt buộc | Nguồn dữ liệu | Rule hiển thị | Rule/Validate |
|---|---|---|---|---|---|---|
| reject_title | Tiêu đề popup | Text | Có | Static | Luôn hiển thị | Ví dụ: "Từ chối nhận lớp" |
| reject_reason_code | Lý do từ chối | Dropdown | Có | Master data | Luôn hiển thị | Bắt buộc chọn 1 giá trị |
| reject_note | Ghi chú bổ sung | Text area | Không | User input | Luôn hiển thị | Giới hạn ký tự theo config, ví dụ 500 |
| btn_submit_reject | Gửi từ chối | Button | Có | UI action | Luôn hiển thị | Chỉ active khi đã chọn lý do |
| btn_cancel | Hủy | Button | Có | UI action | Luôn hiển thị | Đóng popup |

### Giá trị đề xuất cho `reject_reason_code`
- Không phù hợp lịch dạy
- Không thể nhận lớp ngày khai giảng
- Vấn đề sức khỏe / nghỉ phép
- Quá tải / đủ tải dạy
- Lý do khác

### Rule nghiệp vụ
- Khi submit thành công, request chuyển sang `Rejected`.
- Ghi nhận `rejected_at`, `rejected_by`, `reject_reason_code`, `reject_note`.

## 5. Màn hình cho vận hành

## 5.1 Module tổng quan `Xác nhận lịch dạy`
### Mục đích
Là màn hình điều phối tập trung để thay thế file Excel theo dõi thủ công.

### Tabs trạng thái
| Field key | Nhãn hiển thị | Loại dữ liệu | Bắt buộc | Nguồn dữ liệu | Rule hiển thị | Rule/Validate |
|---|---|---|---|---|---|---|
| tab_pending | Chờ xác nhận | Tab | Có | UI | Luôn hiển thị | Filter trạng thái `Pending` |
| tab_confirmed | Đã xác nhận | Tab | Có | UI | Luôn hiển thị | Filter trạng thái `Confirmed` |
| tab_rejected | Từ chối | Tab | Có | UI | Luôn hiển thị | Filter trạng thái `Rejected` |
| tab_expired | Quá hạn | Tab | Có | UI | Luôn hiển thị | Filter trạng thái `Expired` |
| tab_cancelled | Đã hủy | Tab | Có | UI | Luôn hiển thị | Filter trạng thái `Cancelled` |

### Khu vực KPI summary
| Field key | Nhãn hiển thị | Loại dữ liệu | Bắt buộc | Nguồn dữ liệu | Rule hiển thị | Rule/Validate |
|---|---|---|---|---|---|---|
| pending_count | Số request chờ xác nhận | Number | Có | Aggregation | Luôn hiển thị | Read only |
| confirmed_count | Số request đã xác nhận | Number | Có | Aggregation | Luôn hiển thị | Read only |
| rejected_count | Số request từ chối | Number | Có | Aggregation | Luôn hiển thị | Read only |
| expired_count | Số request quá hạn | Number | Có | Aggregation | Luôn hiển thị | Read only |

## 5.2 Bộ lọc và tìm kiếm của vận hành
| Field key | Nhãn hiển thị | Loại dữ liệu | Bắt buộc | Nguồn dữ liệu | Rule hiển thị | Rule/Validate |
|---|---|---|---|---|---|---|
| search_class_code | Mã lớp | Text search | Không | Request snapshot | Luôn hiển thị | Tìm gần đúng |
| search_teacher_name | Giáo viên | Text search | Không | ERP/User | Luôn hiển thị | Tìm theo tên hoặc mã GV nếu có |
| filter_request_type | Loại yêu cầu | Dropdown | Không | Master data | Luôn hiển thị | `All`, `New Opening`, `Teacher Change` |
| filter_source_department | Bộ phận phát sinh | Dropdown | Không | Master data | Luôn hiển thị | `All`, `GVU`, `CM`, `Teacher Care`, `System` |
| filter_start_date_from | Ngày bắt đầu từ | Date | Không | Request snapshot | Luôn hiển thị | From <= To |
| filter_start_date_to | Ngày bắt đầu đến | Date | Không | Request snapshot | Luôn hiển thị | To >= From |
| filter_deadline_from | Hạn xác nhận từ | Date | Không | Request | Luôn hiển thị | From <= To |
| filter_deadline_to | Hạn xác nhận đến | Date | Không | Request | Luôn hiển thị | To >= From |
| filter_status | Trạng thái | Dropdown | Không | Master data | Có thể ẩn nếu dùng tab | Đồng bộ với tab hiện tại |
| btn_search | Tìm kiếm | Button | Có | UI action | Luôn hiển thị | Thực hiện filter |
| btn_reset_filter | Xóa bộ lọc | Button | Có | UI action | Luôn hiển thị | Reset về mặc định |

## 5.3 Danh sách request của vận hành
### Danh sách cột
| Field key | Nhãn hiển thị | Loại dữ liệu | Bắt buộc | Nguồn dữ liệu | Rule hiển thị | Rule/Validate |
|---|---|---|---|---|---|---|
| request_id | Mã request | Text | Có | System | Có thể hiển thị hoặc ẩn | Unique |
| class_code | Mã lớp | Text | Có | Request snapshot | Luôn hiển thị | Read only |
| class_name | Tên lớp | Text | Không | Request snapshot | Hiển thị nếu có | Read only |
| teacher_name | Giáo viên hiện tại | Text | Có | Request snapshot | Luôn hiển thị | Read only |
| old_teacher_name | Giáo viên cũ | Text | Không | Request snapshot | Chỉ hiển thị với `Teacher Change` | Read only |
| request_type_label | Loại yêu cầu | Text | Có | Request type | Luôn hiển thị | Read only |
| source_department | Bộ phận phát sinh | Text | Không | Source data | Hiển thị nếu có | Read only |
| start_date | Ngày bắt đầu | Date | Có | Request snapshot | Luôn hiển thị | Read only |
| schedule_summary | Lịch học | Text | Có | Request snapshot | Luôn hiển thị | Read only |
| level | Level | Text | Không | Request snapshot | Hiển thị nếu có | Read only |
| created_at | Thời điểm tạo request | Datetime | Có | System | Luôn hiển thị | Read only |
| deadline_confirm_at | Hạn xác nhận | Datetime | Có | SLA engine | Luôn hiển thị | Read only |
| last_notification_at | Gửi thông báo gần nhất | Datetime | Không | Notification log | Hiển thị nếu có log | Read only |
| status | Trạng thái | Status tag | Có | Request status | Luôn hiển thị | Mapping enum |
| action_view_detail | Xem chi tiết | Button/link | Có | UI action | Luôn hiển thị | Mở màn chi tiết |
| action_resend | Gửi nhắc lại | Button | Không | UI action | Chỉ hiển thị khi `Pending` | Tạo log gửi nhắc lại |

### Rule nghiệp vụ
- Dữ liệu mặc định ưu tiên hiển thị tab `Pending`.
- Cho phép sort theo `deadline_confirm_at`, `start_date`, `created_at`.
- `action_resend` không hiển thị cho request đã xử lý xong.

## 5.4 Màn hình chi tiết request của vận hành
### Mục đích
Cho phép vận hành xem toàn bộ dữ liệu và lịch sử của 1 request.

### Nhóm field: thông tin chung
| Field key | Nhãn hiển thị | Loại dữ liệu | Bắt buộc | Nguồn dữ liệu | Rule hiển thị | Rule/Validate |
|---|---|---|---|---|---|---|
| request_id | Mã request | Text | Có | System | Luôn hiển thị | Read only |
| request_type_label | Loại yêu cầu | Text | Có | Request type | Luôn hiển thị | Read only |
| status | Trạng thái | Status tag | Có | Request status | Luôn hiển thị | Read only |
| source_department | Bộ phận phát sinh | Text | Không | Source data | Hiển thị nếu có | Read only |
| triggered_by_user | Người thao tác nguồn | Text | Không | Audit log | Hiển thị nếu có | Read only |
| created_at | Thời điểm tạo request | Datetime | Có | System | Luôn hiển thị | Read only |
| deadline_confirm_at | Hạn xác nhận | Datetime | Có | SLA engine | Luôn hiển thị | Read only |
| confirmed_at | Thời điểm xác nhận | Datetime | Không | System | Hiển thị nếu `Confirmed` | Read only |
| rejected_at | Thời điểm từ chối | Datetime | Không | System | Hiển thị nếu `Rejected` | Read only |
| expired_at | Thời điểm quá hạn | Datetime | Không | System | Hiển thị nếu `Expired` | Read only |
| cancelled_at | Thời điểm hủy | Datetime | Không | System | Hiển thị nếu `Cancelled` | Read only |

### Nhóm field: thông tin lớp
| Field key | Nhãn hiển thị | Loại dữ liệu | Bắt buộc | Nguồn dữ liệu | Rule hiển thị | Rule/Validate |
|---|---|---|---|---|---|---|
| class_id | ID lớp | Text | Không | ERP | Có thể ẩn | Read only |
| class_code | Mã lớp | Text | Có | Request snapshot | Luôn hiển thị | Read only |
| class_name | Tên lớp | Text | Không | Request snapshot | Hiển thị nếu có | Read only |
| course_name | Khóa học | Text | Không | Request snapshot | Hiển thị nếu có | Read only |
| level | Level | Text | Không | Request snapshot | Hiển thị nếu có | Read only |
| start_date | Ngày bắt đầu | Date | Có | Request snapshot | Luôn hiển thị | Read only |
| first_session_datetime | Buổi đầu tiên | Datetime | Không | Request snapshot | Hiển thị nếu có | Read only |
| schedule_summary | Lịch học | Text | Có | Request snapshot | Luôn hiển thị | Read only |
| class_status | Trạng thái lớp hiện tại | Text | Không | ERP realtime | Hiển thị nếu có | Read only |

### Nhóm field: thông tin giáo viên
| Field key | Nhãn hiển thị | Loại dữ liệu | Bắt buộc | Nguồn dữ liệu | Rule hiển thị | Rule/Validate |
|---|---|---|---|---|---|---|
| teacher_id | ID giáo viên | Text | Không | ERP | Có thể ẩn | Read only |
| teacher_name | Giáo viên hiện tại | Text | Có | Request snapshot | Luôn hiển thị | Read only |
| teacher_type | Loại giáo viên | Text | Không | ERP | Hiển thị nếu có | Read only |
| old_teacher_name | Giáo viên cũ | Text | Không | Request snapshot | Chỉ hiển thị với `Teacher Change` | Read only |
| reject_reason_code | Lý do từ chối | Text | Không | Request | Chỉ hiển thị nếu `Rejected` | Mapping từ master data |
| reject_note | Ghi chú từ chối | Text area | Không | Request | Chỉ hiển thị nếu `Rejected` | Read only |

### Nhóm field: hành động
| Field key | Nhãn hiển thị | Loại dữ liệu | Bắt buộc | Nguồn dữ liệu | Rule hiển thị | Rule/Validate |
|---|---|---|---|---|---|---|
| btn_resend_notification | Gửi nhắc lại | Button | Không | UI action | Chỉ hiển thị nếu `Pending` | Tạo log gửi mới |
| btn_back_to_list | Quay lại | Button | Có | UI action | Luôn hiển thị | Quay lại danh sách |

## 5.5 Khu vực lịch sử xử lý của request
### Mục đích
Cho phép vận hành kiểm tra chuỗi sự kiện đầy đủ của request.

### Danh sách cột / event log
| Field key | Nhãn hiển thị | Loại dữ liệu | Bắt buộc | Nguồn dữ liệu | Rule hiển thị | Rule/Validate |
|---|---|---|---|---|---|---|
| event_time | Thời điểm | Datetime | Có | Audit log | Luôn hiển thị | Read only |
| event_type | Loại sự kiện | Text | Có | Audit log | Luôn hiển thị | Ví dụ: `Request Created`, `Notification Sent`, `Teacher Confirmed`, `Teacher Rejected`, `Request Expired`, `Request Cancelled` |
| event_actor | Người thực hiện | Text | Không | Audit log | Hiển thị nếu có | `System` hoặc user name |
| event_channel | Kênh gửi | Text | Không | Notification log | Chỉ hiển thị với event gửi thông báo | `ERP`, `Telegram` |
| event_result | Kết quả | Text | Không | Log | Chỉ hiển thị với event gửi thông báo | `Success`, `Failed` |
| event_note | Ghi chú | Text | Không | Log | Hiển thị nếu có | Read only |

## 6. Dữ liệu backend đề xuất cho request
## 6.1 Danh sách field chính
| Field key | Mô tả | Loại dữ liệu | Bắt buộc | Ghi chú |
|---|---|---|---|---|
| id | ID request | UUID/String | Có | Primary key |
| class_id | ID lớp | String | Có | Từ ERP |
| class_code | Mã lớp | String | Có | Snapshot |
| class_name | Tên lớp | String | Không | Snapshot |
| teacher_id | ID giáo viên hiện tại | String | Có | Snapshot |
| teacher_name | Tên giáo viên hiện tại | String | Có | Snapshot |
| old_teacher_id | ID giáo viên cũ | String | Không | Dùng cho `Teacher Change` |
| old_teacher_name | Tên giáo viên cũ | String | Không | Dùng cho `Teacher Change` |
| request_type | Loại request | Enum | Có | `New Opening`, `Teacher Change` |
| source_department | Bộ phận phát sinh | Enum/String | Không | `GVU`, `CM`, `Teacher Care`, `System` |
| triggered_by_user_id | User thao tác nguồn | String | Không | Audit |
| start_date | Ngày bắt đầu | Date | Có | Snapshot |
| first_session_datetime | Buổi đầu | Datetime | Không | Snapshot |
| schedule_summary | Lịch học | String | Có | Snapshot |
| level | Level | String | Không | Snapshot |
| status | Trạng thái | Enum | Có | `Pending`, `Confirmed`, `Rejected`, `Expired`, `Cancelled` |
| created_at | Thời điểm tạo | Datetime | Có | System |
| deadline_confirm_at | Hạn xác nhận | Datetime | Có | SLA engine |
| confirmed_at | Thời điểm xác nhận | Datetime | Không | Khi `Confirmed` |
| rejected_at | Thời điểm từ chối | Datetime | Không | Khi `Rejected` |
| expired_at | Thời điểm quá hạn | Datetime | Không | Khi `Expired` |
| cancelled_at | Thời điểm hủy | Datetime | Không | Khi `Cancelled` |
| reject_reason_code | Lý do từ chối | String | Không | Khi `Rejected` |
| reject_note | Ghi chú từ chối | String | Không | Khi `Rejected` |
| cancellation_reason | Lý do hủy | String | Không | Khi `Cancelled` |

## 6.2 Danh sách field log notification
| Field key | Mô tả | Loại dữ liệu | Bắt buộc | Ghi chú |
|---|---|---|---|---|
| id | ID log | UUID/String | Có | Primary key |
| request_id | ID request | String | Có | Foreign key |
| channel | Kênh gửi | Enum | Có | `ERP`, `Telegram` |
| template_code | Mã template | String | Không | Theo loại request |
| sent_at | Thời điểm gửi | Datetime | Có | System |
| send_result | Kết quả gửi | Enum | Có | `Success`, `Failed` |
| failure_reason | Lý do lỗi | String | Không | Nếu fail |
| recipient_id | ID người nhận | String | Có | GV |

## 7. Validation và rule hiển thị quan trọng
- `btn_confirm` và `btn_reject` chỉ hiển thị khi request ở trạng thái `Pending`.
- `reject_reason_code` là field bắt buộc khi từ chối.
- `checkbox_acknowledge` là field bắt buộc khi xác nhận nhận lớp.
- `old_teacher_name` chỉ hiển thị với request loại `Teacher Change`.
- `expired_at` chỉ có dữ liệu khi request đã chuyển `Expired`.
- Request `Cancelled` không còn hiển thị trong tab `Chờ xác nhận`.

## 8. Điểm cần chốt thêm trước khi UI design và dev
- Có hiển thị `class_name`, `course_name`, `program_type` trong MVP hay chỉ cần `class_code`.
- Có cần thêm cột `đúng hạn / quá hạn` riêng trong tab `Confirmed`.
- Có cần phân tách tab `Lịch sử` của giáo viên thành nhiều trạng thái hay chỉ gom một danh sách.
- Có cần action thủ công cho vận hành như `Cancel request`, `Override deadline`, `Force close`.
- Có cần lưu bản snapshot message content đã gửi cho từng request hay chỉ lưu template code.
