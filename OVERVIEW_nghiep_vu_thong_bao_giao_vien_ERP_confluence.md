# [Overview] Nghiệp vụ thông báo giáo viên trên ERP

## 1. Mục tiêu

Tài liệu này dùng để trình bày nhanh bài toán, giải pháp và các rule quan trọng của tính năng thông báo giáo viên trên ERP theo nghiệp vụ mới nhất.

## 2. Bài toán hiện tại

Khi có biến động liên quan đến lớp học như:

- mở lớp mới
- đổi giáo viên
- đổi lịch học
- up/down level
- kết thúc lớp

thông tin hiện đang đi qua nhiều bước thủ công giữa GVU, CM, Teacher Care và giáo viên.

Rủi ro chính:

- giáo viên nhận thông tin chậm hoặc thiếu
- vận hành khó theo dõi lớp nào đang chờ phản hồi
- không có nơi chốt kết quả chính thức
- khó audit lại lịch sử xử lý

## 3. Giải pháp tổng quan

- Telegram là kênh gửi thông báo ra ngoài
- ERP là nơi ghi nhận trạng thái chính thức
- Màn vận hành theo dõi toàn bộ bản ghi thông báo
- Màn giáo viên chỉ hiển thị các bản ghi cần phản hồi

Mỗi biến động lớp học sẽ tạo ra một bản ghi thông báo giáo viên, được theo dõi theo cặp:

- Mã lớp
- Giáo viên

## 4. Hai lớp thông tin nghiệp vụ

### 4.1. Trạng thái bản ghi

Dùng để biết bản ghi đang nằm ở đâu trong queue:

- `Chờ xử lý`
- `Đang xử lý`
- `Hoàn thành`

### 4.2. Kết quả xử lý

Dùng để biết outcome của bản ghi:

- `Xác nhận`
- `Từ chối`
- `Hủy`
- `Đã gửi thông tin`
- `Quá hạn`

### 4.3. Nguyên tắc

- `Trạng thái` = queue status
- `Kết quả xử lý` = outcome

Không gộp 2 khái niệm này vào cùng 1 field.

## 5. Phân loại thông báo

| Loại thông báo | Có cần GV phản hồi không | Có hiển thị ở màn GV không |
| --- | --- | --- |
| Báo lớp khai giảng | Có | Có |
| Báo lớp chuyển ngang | Có | Có |
| Báo đổi lịch học | Có | Có |
| Báo lớp kết thúc | Không | Không |
| Khác | Không | Không |

Lưu ý:

- `Khác` là nhãn kỹ thuật trên màn vận hành
- use case phổ biến của `Khác` là up/down level hoặc các trường hợp tạo thủ công

## 6. Rule nguồn phát sinh

Nguồn chỉ gồm 2 giá trị:

- `GVU`
- `CM`

Rule:

- lớp chưa có buổi học đầu tiên -> `GVU`
- lớp đã có buổi học đầu tiên -> `CM`

## 7. Mapping nghiệp vụ

| Tình huống | Trạng thái | Kết quả xử lý |
| --- | --- | --- |
| Mới tạo bản ghi cần phản hồi | Chờ xử lý | Rỗng |
| GV/Vận hành xác nhận | Hoàn thành | Xác nhận |
| GV/Vận hành từ chối | Đang xử lý | Từ chối |
| Vận hành đã follow-up xong sau từ chối | Hoàn thành | Từ chối |
| Hệ thống quá hạn SLA | Đang xử lý | Quá hạn |
| Vận hành chốt lại bản ghi quá hạn | Hoàn thành | Xác nhận / Từ chối / Hủy |
| Bản ghi chỉ gửi thông tin | Hoàn thành | Đã gửi thông tin |
| Bản ghi cũ bị đổi giáo viên khi vẫn đang chờ xử lý | Hoàn thành | Hủy |

## 8. Rule đặc biệt

### 8.1. Đổi giáo viên

Nếu bản ghi cũ đang `Chờ xử lý` mà vận hành đổi giáo viên:

- bản ghi cũ -> `Hoàn thành + Hủy`
- tạo bản ghi mới cho giáo viên mới -> `Chờ xử lý + rỗng`

### 8.2. Đổi lịch

Nếu bản ghi đang `Chờ xử lý` và vẫn cùng cặp `Mã lớp + Giáo viên`:

- hệ thống update trực tiếp lịch mới trên dòng hiện tại
- không tạo bản ghi mới

## 9. SLA

Rule hiện tại:

- lớp trong tuần: xác nhận trước `T - 24h`
- lớp thứ 7, chủ nhật: xác nhận trước `T - 48h`

Nếu quá SLA:

- bản ghi chuyển từ `Chờ xử lý` sang `Đang xử lý`
- kết quả xử lý = `Quá hạn`

## 10. Telegram và ERP

### Telegram

- gửi thông báo
- dẫn link vào ERP

### ERP

- là nơi giáo viên phản hồi chính thức
- là nơi vận hành theo dõi queue
- là nơi lưu log và kết quả cuối cùng

## 11. Màn vận hành

Đề xuất giao diện:

- Tab:
  - `Chờ xử lý`
  - `Đang xử lý`
  - `Hoàn thành`
- Cột `Kết quả xử lý` hiển thị bằng tag

Action chính:

- gửi lại Telegram
- chuyển xác nhận
- chuyển từ chối
- đánh dấu đã xử lý
- chốt lại case quá hạn

## 12. Màn giáo viên

Chỉ hiển thị các bản ghi:

- cần giáo viên phản hồi
- đang ở `Chờ xử lý`

Giáo viên vào màn sẽ thấy:

- popup nếu còn bản ghi cần xử lý
- danh sách chờ xác nhận
- lịch sử

Bản ghi đã `Hủy`, `Quá hạn`, `Từ chối`, `Đã gửi thông tin` chỉ hiển thị trong lịch sử.

## 13. Kết luận

Điểm thay đổi quan trọng nhất của nghiệp vụ mới là:

- màn vận hành theo dõi theo `Trạng thái bản ghi`
- hệ thống và UI hiển thị outcome bằng `Kết quả xử lý`

Model này phù hợp hơn với thực tế xử lý của vận hành, đặc biệt trong các case:

- giáo viên từ chối nhưng vẫn chưa follow-up xong
- bản ghi quá hạn SLA
- đổi giáo viên khi bản ghi cũ vẫn đang chờ xử lý
- đổi lịch trên cùng một cặp `Mã lớp + Giáo viên`
