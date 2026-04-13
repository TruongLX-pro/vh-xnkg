# PRD: Số hóa quy trình xác nhận khai giảng lớp mới với giáo viên

## 1. Thông tin tài liệu
- Tên sản phẩm: Tính năng xác nhận nhận lớp trước khai giảng trên ERP
- Nhóm nghiệp vụ: Vận hành lớp học / Teacher Care / GVU / CM / Giáo viên
- Loại tài liệu: PRD ngắn gọn
- Phiên bản: v0.1
- Ngày: 2026-04-09

## 2. Bối cảnh
Hiện tại nghiệp vụ báo xác nhận lớp khai giảng và các trường hợp đổi giáo viên trước buổi học đầu tiên đang được vận hành thủ công qua Excel, Google Form và Telegram. Khi phát sinh mở lớp mới hoặc đổi giáo viên, các bộ phận vận hành phải điền form để CTV nhận thông tin, nhắn tin cho giáo viên theo kịch bản có sẵn, sau đó theo dõi phản hồi và đánh dấu lại trên file.

Quy trình này gây phân mảnh dữ liệu, phụ thuộc nhân sự trung gian, khó kiểm soát SLA xác nhận và làm tăng rủi ro giáo viên xin nghỉ đột xuất hoặc không nắm được thông tin trước buổi khai giảng.

## 3. Mục tiêu
### 3.1 Mục tiêu kinh doanh
- Đảm bảo lớp khai giảng có xác nhận chủ động từ giáo viên trước buổi học đầu tiên.
- Giảm phụ thuộc vào CTV trong thao tác relay thông tin và cập nhật file.
- Chuẩn hóa dữ liệu xác nhận lớp trên ERP để dễ kiểm soát và truy vết.
- Giảm rủi ro phát sinh thay giáo viên cận giờ học do giáo viên chưa nắm lịch hoặc từ chối muộn.

### 3.2 Mục tiêu sản phẩm
- Tự động tạo yêu cầu xác nhận khi mở lớp mới hoặc đổi giáo viên trên ERP.
- Cho phép giáo viên xác nhận hoặc từ chối trực tiếp trên ERP.
- Cho phép vận hành theo dõi trạng thái xử lý, SLA và ngoại lệ tại một module tập trung.
- Tự động gửi thông báo theo template, ưu tiên ERP là nơi xác nhận chính.

## 4. Phạm vi
### 4.1 In scope cho MVP
- Luồng mở lớp mới ở trạng thái chờ khai giảng.
- Luồng đổi giáo viên trước buổi học đầu tiên.
- Tạo request xác nhận cho giáo viên trên ERP.
- Popup / notification cho giáo viên.
- Màn hình vận hành theo dõi trạng thái xác nhận.
- Các trạng thái: chờ xác nhận, đã xác nhận, từ chối, quá hạn, đã hủy.
- SLA xác nhận và reminder cơ bản.
- Lưu lịch sử gửi thông báo và thao tác xác nhận.

### 4.2 Out of scope cho MVP
- Luồng UP/DOWN level.
- Luồng đóng lớp.
- Luồng đổi lịch nhưng không đổi giáo viên.
- Tối ưu phân công giáo viên thay thế tự động.
- Quản trị đa kênh thông báo phức tạp ngoài ERP.

## 5. Người dùng liên quan
- GVU: mở lớp, đổi lịch, đổi giáo viên.
- Teacher Care / CTV TC: theo dõi và xử lý các lớp chưa được xác nhận.
- CM: có thể phát sinh đổi giáo viên.
- Giáo viên: nhận hoặc từ chối lớp.
- Quản lý vận hành: theo dõi SLA và hiệu quả vận hành.

## 6. Vấn đề hiện tại
- Dữ liệu nghiệp vụ nằm trên ERP nhưng quy trình xử lý nằm ngoài hệ thống.
- Form và file Excel không đồng bộ trạng thái theo thời gian thực.
- CTV phải thao tác copy nội dung, nhắn Telegram, chờ phản hồi rồi cập nhật file.
- Không có audit log đầy đủ cho từng lần đổi giáo viên và xác nhận.
- Không có queue xử lý tập trung cho các trường hợp quá hạn hoặc từ chối.

## 7. Giải pháp đề xuất
ERP bổ sung workflow "Xác nhận lịch dạy" để tự động ghi nhận và điều phối các yêu cầu giáo viên xác nhận nhận lớp trước khai giảng.

Khi phát sinh mở lớp mới hoặc đổi giáo viên:
- Hệ thống tự tạo một yêu cầu xác nhận gắn với lớp và giáo viên.
- Hệ thống gửi thông báo cho giáo viên qua popup trên ERP và notification center.
- Có thể đồng thời gửi tin nhắn Telegram theo template để nhắc giáo viên truy cập ERP.
- Giáo viên thao tác "Nhận lớp" hoặc "Từ chối lớp" trên ERP.
- Nếu quá SLA hoặc từ chối, request được đẩy sang queue xử lý cho vận hành.

## 8. Luồng nghiệp vụ to-be
### 8.1 Mở lớp mới
1. GVU mở lớp mới trên ERP với trạng thái hợp lệ để khai giảng.
2. Hệ thống tạo request xác nhận cho giáo viên được gán lớp.
3. Hệ thống gửi thông báo tới giáo viên.
4. Giáo viên chọn:
- Nhận lớp.
- Từ chối lớp và nhập lý do.
5. Hệ thống cập nhật trạng thái request.
6. Nếu quá deadline chưa xác nhận thì chuyển sang "Quá hạn xác nhận".

### 8.2 Đổi giáo viên trước buổi đầu
1. GVU / CM / Teacher Care đổi giáo viên trên ERP.
2. Hệ thống đóng request cũ theo lý do thay giáo viên.
3. Hệ thống tạo request mới cho giáo viên mới.
4. Giáo viên mới xác nhận hoặc từ chối.
5. Nếu từ chối hoặc quá hạn, vận hành tiếp tục xử lý đổi giáo viên khác.

## 9. Rule nghiệp vụ
### 9.1 Trigger tạo request
- Tạo request khi lớp mới được mở và có giáo viên phụ trách.
- Tạo request mới khi đổi giáo viên trước buổi học đầu tiên.
- Mỗi lần đổi giáo viên là một request độc lập để đảm bảo lưu lịch sử.

### 9.2 SLA xác nhận
- Lớp diễn ra trong tuần: giáo viên cần xác nhận trước T - 24 giờ.
- Lớp diễn ra thứ 7 hoặc chủ nhật: giáo viên cần xác nhận trước T - 48 giờ.
- Trường hợp mở lớp trong ngày không đi theo SLA mặc định, cần có cơ chế override hoặc xác nhận trước từ vận hành.

### 9.3 Trạng thái request
- Pending: chờ giáo viên xác nhận.
- Confirmed: giáo viên đã xác nhận nhận lớp.
- Rejected: giáo viên từ chối nhận lớp.
- Expired: quá SLA chưa phản hồi.
- Cancelled: request bị hủy do lớp bị hủy hoặc đã đổi sang giáo viên khác.

### 9.4 Rule thao tác
- Khi giáo viên chọn "Từ chối lớp", bắt buộc nhập lý do.
- Khi request đã Confirmed hoặc Cancelled thì không cho phép giáo viên thao tác lại.
- Vận hành có quyền xem lịch sử và thực hiện gửi nhắc lại nếu cần.

## 10. Yêu cầu chức năng
### 10.1 Cho giáo viên
- Hiển thị popup khi có request mới cần xác nhận.
- Có màn hình danh sách lớp chờ xác nhận.
- Hiển thị thông tin tối thiểu: mã lớp, lịch học, ngày bắt đầu, level, deadline xác nhận, loại yêu cầu.
- Có nút:
  - Nhận lớp
  - Từ chối lớp
  - Xem chi tiết
- Khi từ chối phải nhập lý do từ chối.

### 10.2 Cho vận hành
- Có module "Xác nhận lịch dạy".
- Có các tab:
  - Chờ xác nhận
  - Đã xác nhận
  - Từ chối
  - Quá hạn
  - Đã hủy
- Có filter theo ngày khai giảng, giáo viên, loại yêu cầu, bộ phận phát sinh.
- Có hành động xem lịch sử request.
- Có hành động gửi nhắc lại thông báo.

### 10.3 Notification
- Tự động gửi in-app notification khi request được tạo.
- Hỗ trợ gửi Telegram template như kênh nhắc việc, nội dung có deep link về ERP.
- Lưu log gửi thông báo thành công/thất bại.

## 11. Yêu cầu phi chức năng
- Dữ liệu request phải cập nhật realtime hoặc near realtime từ ERP event.
- Có audit log cho các hành động tạo request, gửi thông báo, xác nhận, từ chối, hủy.
- Cho phép truy vết được nguồn phát sinh thay đổi: GVU, CM, Teacher Care.
- Phân quyền theo vai trò để giáo viên chỉ thấy request của mình, vận hành thấy queue xử lý theo quyền.

## 12. Chỉ số thành công
- Tỷ lệ lớp khai giảng có xác nhận trên hệ thống trước buổi đầu.
- Tỷ lệ request bị quá SLA.
- Tỷ lệ request bị từ chối.
- Thời gian trung bình từ lúc tạo request đến lúc giáo viên xác nhận.
- Số lượng thao tác thủ công qua form/file giảm theo tháng.

## 13. Rủi ro và điểm cần chốt
- Cần chốt ERP có phải là nơi xác nhận chính thức duy nhất hay vẫn chấp nhận xác nhận qua Telegram.
- Cần chốt xử lý cho case mở lớp trong ngày.
- Cần chốt rule khi giáo viên đã xác nhận nhưng sau đó lớp đổi lịch hoặc đổi giáo viên lần nữa.
- Cần chốt danh mục lý do từ chối chuẩn hóa.
- Cần chốt ai có quyền override deadline hoặc force confirm.

## 14. Đề xuất triển khai
### Giai đoạn 1
- MVP cho 2 case:
  - Mở lớp khai giảng mới
  - Đổi giáo viên trước buổi đầu

### Giai đoạn 2
- Mở rộng cho đổi lịch, UP/DOWN level, đóng lớp.
- Bổ sung dashboard quản trị và báo cáo SLA nâng cao.

## 15. Phụ lục tham chiếu
- Nguồn yêu cầu nghiệp vụ: file đề xuất hệ thống của vận hành và kịch bản nhắn giáo viên hiện tại.
- Luồng tham chiếu: sơ đồ "Luồng báo lịch lớp Khai giảng".
