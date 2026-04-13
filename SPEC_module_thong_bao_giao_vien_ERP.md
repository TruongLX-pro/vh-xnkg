# SPEC Module Thông Báo Giáo Viên Trên ERP

## 1. Mục tiêu

Tài liệu này chốt lại ngữ cảnh nghiệp vụ của tính năng thông báo giáo viên, dựa trên:

- các tài liệu nghiệp vụ gốc đã cung cấp
- toàn bộ trao đổi cập nhật nghiệp vụ trong thread triển khai
- trạng thái sản phẩm demo hiện tại trong thư mục `demo`

Mục tiêu là tạo một baseline chung cho Product, Operations, GVU, CM, FE, BE, QA khi tiếp tục phát triển tính năng này.

---

## 2. Phạm vi tính năng

Tính năng quản lý thông báo giáo viên gồm 2 phía:

- Màn vận hành trên ERP để theo dõi, gửi lại Telegram, can thiệp xác nhận hoặc từ chối thay cho giáo viên khi cần.
- Màn giáo viên trên ERP để giáo viên xem các thông báo cần phản hồi và thực hiện xác nhận hoặc từ chối trực tiếp trên ERP.

Telegram là kênh đẩy thông báo ra ngoài. ERP là nơi ghi nhận trạng thái chính thức.

Nguyên tắc hiện tại:

- Telegram gửi tới giáo viên phải kèm link vào ERP.
- Với các loại thông báo cần phản hồi, giáo viên xác nhận hoặc từ chối trên ERP.
- Với các loại chỉ cần gửi thông tin, Telegram chỉ đóng vai trò thông báo; màn giáo viên không cần hiển thị các item này.

---

## 3. Nhóm nghiệp vụ chuẩn

### 3.1. Nhóm cần giáo viên phản hồi

Ba loại sau bắt buộc giáo viên phản hồi:

1. Báo lớp khai giảng
2. Báo lớp chuyển ngang
3. Báo đổi lịch học

Hành động của giáo viên:

- Nhận lớp
- Từ chối lớp

Kênh phản hồi chuẩn hiện tại:

- phản hồi trên ERP

### 3.2. Nhóm chỉ gửi thông tin

Hai loại sau không yêu cầu giáo viên phản hồi:

1. Báo lớp up/down level
2. Báo lớp kết thúc

Quy ước hiển thị:

- Không hiển thị trong màn giáo viên.
- Vẫn tồn tại trong màn vận hành để theo dõi lịch sử gửi thông tin.
- `Báo lớp up/down level` đang được biểu diễn bằng luồng tạo thủ công ở vận hành và được gán loại `Khác`.

---

## 4. Rule nguồn phát sinh

Nguồn phát sinh chỉ gồm 2 giá trị:

- `GVU`
- `CM`

Rule xác định nguồn:

- Những lớp chưa diễn ra buổi học đầu tiên thì nguồn phát sinh tính cho `GVU`.
- Những lớp đã phát sinh buổi học đầu tiên thì nguồn phát sinh tính cho `CM`.

Áp dụng cho cả luồng tự động và bản ghi tạo thủ công.

---

## 5. Danh mục loại thông báo

Danh mục nghiệp vụ chuẩn ở vận hành:

1. Báo lớp khai giảng
2. Báo lớp chuyển ngang
3. Báo đổi lịch học
4. Báo lớp kết thúc
5. Khác

Quy ước text hiển thị ở phía giáo viên:

- `Báo lớp khai giảng` giữ nguyên
- `Báo lớp chuyển ngang` hiển thị là `Đổi giáo viên`
- `Báo đổi lịch học` hiển thị là `Đổi lịch học`

Phía vận hành giữ nguyên label nghiệp vụ gốc.

---

## 6. Trigger nghiệp vụ theo từng loại

### 6.1. Báo lớp khai giảng

Điều kiện phát sinh:

- Lớp mới được tạo
- Trạng thái lớp là `Chờ khai giảng` hoặc `Đang học`
- Chưa phát sinh buổi học nào

Nguồn:

- `GVU`

Kết quả:

- Tạo một bản ghi thông báo ở trạng thái `Chờ xác nhận`
- Gửi Telegram kèm link ERP
- Giáo viên phải phản hồi trên ERP

### 6.2. Báo lớp chuyển ngang

Điều kiện phát sinh:

- Lớp đang học
- Đã phát sinh buổi học trong quá khứ
- Có đổi giáo viên, hoặc vừa đổi giáo viên vừa đổi lịch

Nguồn:

- `CM`

Kết quả:

- Phát sinh 2 nhánh thông báo:
  - cho giáo viên mới: cần xác nhận
  - cho giáo viên cũ: nhận thông tin thay đổi
- Trong dữ liệu vận hành cần có cờ `GV mới` và `GV cũ`

Lưu ý:

- Màn giáo viên hiện chỉ cần tập trung vào item của giáo viên đang nhận lớp.
- Thông báo dành cho giáo viên cũ là luồng thông tin, không cần phản hồi.

### 6.3. Báo đổi lịch học

Điều kiện phát sinh:

- Lớp đang học
- Đã phát sinh buổi học trong quá khứ
- Giữ nguyên giáo viên
- Chỉ đổi lịch học

Nguồn:

- `CM`

Kết quả:

- Tạo bản ghi `Chờ xác nhận`
- Gửi Telegram kèm link ERP
- Giáo viên phản hồi trên ERP

### 6.4. Báo lớp kết thúc

Điều kiện phát sinh:

- Khi GVU hoặc VHLH chuyển trạng thái lớp sang `Kết thúc`

Kết quả chuẩn hiện tại đã chốt trong thread:

- Chỉ gửi thông tin cho giáo viên qua Telegram
- Không yêu cầu giáo viên phản hồi trên ERP
- Không hiển thị ở màn giáo viên

Lưu ý:

- Tài liệu gốc có đề xuất hiện pop-up yêu cầu giáo viên xác nhận đã nhận thông tin. Đây là một điểm khác với quyết định hiện tại trong thread. Nếu sau này đổi lại định hướng nghiệp vụ, cần cập nhật lại cả data model, status flow và màn giáo viên.

### 6.5. Khác

Mục đích:

- Dùng cho các trường hợp thủ công do vận hành chủ động thêm vào danh sách thông báo

Ví dụ điển hình:

- Báo lớp up/down level
- Các biến động đặc thù chưa có trigger tự động

Kết quả:

- Tạo từ thao tác thủ công ở vận hành
- Gửi Telegram
- Trạng thái mặc định là `Đã gửi thông tin`
- Không hiển thị trong màn giáo viên

---

## 7. SLA xác nhận

Rule từ tài liệu nghiệp vụ:

- Với lớp trong tuần: SLA xác nhận là `T - 24 giờ`
- Với lớp Thứ 7, Chủ nhật: SLA xác nhận là `T - 48 giờ`

Trong đó:

- `T` là thời điểm lớp diễn ra

Hậu quả khi quá SLA:

- Chuyển item sang nhóm `Quá hạn xác nhận`
- Vận hành tiếp tục follow-up

Lưu ý:

- Demo hiện mới có khái niệm `SLA`, `Cần ưu tiên`, `Sắp hết hạn`, `Quá hạn`, nhưng chưa thể hiện đầy đủ logic phân biệt weekday/weekend theo rule chuẩn.

---

## 8. Trạng thái nghiệp vụ

Danh sách trạng thái chuẩn đang dùng:

1. `Chờ xác nhận`
2. `Đã xác nhận`
3. `Từ chối`
4. `Quá hạn`
5. `Đã gửi thông tin`

Mapping sử dụng:

- `Chờ xác nhận`: cho các loại cần phản hồi
- `Đã xác nhận`: giáo viên hoặc vận hành xác nhận thành công
- `Từ chối`: giáo viên hoặc vận hành chốt từ chối
- `Quá hạn`: vượt SLA mà chưa có phản hồi
- `Đã gửi thông tin`: cho các loại chỉ cần thông báo

Trạng thái đã loại bỏ:

- `Đã hủy`

---

## 9. Rule Telegram

Mọi tin nhắn Telegram gửi cho giáo viên phải bao gồm:

- thông tin lớp tối thiểu theo kịch bản
- CTA hướng dẫn vào ERP
- link ERP tương ứng với item

Thông tin lớp tối thiểu theo kịch bản thường gồm:

- Mã lớp
- Thời gian học
- Ngày bắt đầu học
- Level

Ngoài ra còn có:

- hướng dẫn kiểm tra thời khóa biểu ERP
- note vận hành
- các lưu ý nghiệp vụ về cover, giờ vào lớp, hỗ trợ kỹ thuật, hủy lớp, tài liệu

Lưu ý implementation:

- Demo hiện đã có `erpActionUrl` trong dữ liệu và append link ERP vào nội dung Telegram.
- Demo chưa tách bộ template Telegram chuẩn cho từng loại GVVN/GVNN thành một cấu hình riêng.

---

## 10. Màn giáo viên chuẩn

### 10.1. Mục tiêu

Màn giáo viên không phải là màn quản trị chi tiết. Mục tiêu là:

- hiển thị các lớp cần phản hồi
- cho giáo viên phản hồi nhanh
- cho giáo viên xem lại lịch sử các phản hồi đã xử lý

### 10.2. Cấu trúc màn

Hai tab:

1. `Chờ xác nhận`
2. `Lịch sử`

Không hiển thị ở màn giáo viên:

- các thông báo chỉ gửi thông tin
- các item `Khác`
- các item `Báo lớp kết thúc`

### 10.3. Popup đầu vào

Khi giáo viên truy cập màn:

- nếu có item `Chờ xác nhận`, hệ thống mở popup thông báo
- popup hiển thị danh sách các item đang chờ
- mỗi item có CTA:
  - `Xác nhận ngay`
  - `Từ chối lớp`

Flow:

- `Xác nhận ngay` mở popup confirm lại, hiển thị chi tiết lớp
- sau khi xác nhận thành công, item biến mất khỏi danh sách chờ
- `Từ chối lớp` mở popup yêu cầu nhập lý do và bắt buộc nhập

### 10.4. Danh sách chờ xác nhận

Các cột tối thiểu nên có:

- Loại thông báo
- Lớp
- Ngày bắt đầu
- Thời gian học
- Level
- Hạn xác nhận
- Thao tác

Filter cần có:

- search theo mã lớp / tên lớp
- filter loại thông báo

Filter không cần giữ:

- xóa bộ lọc riêng
- các filter thiên về vận hành như nguồn, SLA, queue

### 10.5. Danh sách lịch sử

Các cột tối thiểu nên có:

- Loại thông báo
- Lớp
- Ngày bắt đầu
- Level
- Kết quả
- Cập nhật cuối
- Ghi nhận gần nhất

### 10.6. Những gì không cần ở màn giáo viên

- Drawer vận hành kiểu chi tiết sâu
- form ghi chú nội bộ
- cột nguồn
- cột teacher care quá nặng về backend workflow
- danh sách các thông báo chỉ mang tính broadcast

---

## 11. Màn vận hành chuẩn

### 11.1. Mục tiêu

Vận hành là nơi:

- theo dõi toàn bộ queue
- can thiệp xử lý ngoại lệ
- gửi lại Telegram
- xác nhận hoặc từ chối thay cho giáo viên sau khi xác minh
- tạo thông báo thủ công

### 11.2. Các nhóm theo dõi logic

Từ tài liệu nghiệp vụ, vận hành về bản chất cần theo dõi 5 nhóm:

1. Báo lớp khai giảng
2. Báo lớp chuyển ngang
3. Hoàn thành
4. Quá hạn xác nhận
5. Từ chối nhận lớp

Trong demo hiện tại, việc theo dõi đang kết hợp bởi:

- trạng thái
- loại thông báo

Điều này đủ cho demo, nhưng nếu lên production có thể cần thiết kế lại IA theo đúng grouping nghiệp vụ.

### 11.3. Dữ liệu quan trọng ở vận hành

Danh sách vận hành cần thể hiện:

- mã lớp
- giáo viên
- mã GV
- loại GV
- teacher care
- loại thông báo
- nguồn
- ngày bắt đầu
- lịch học
- hạn phản hồi
- trạng thái
- last update

Riêng luồng chuyển ngang:

- cần cờ `GV mới` / `GV cũ`

### 11.4. Hành động của vận hành

- Xem chi tiết
- Gửi lại Telegram
- Chuyển xác nhận thay cho giáo viên
- Chuyển từ chối thay cho giáo viên
- Thêm ghi chú vận hành
- Tạo thông báo thủ công

Các thao tác chuyển xác nhận hoặc chuyển từ chối thay cho giáo viên:

- đều phải mở popup confirm/form
- đều phải ghi vào log lịch sử xử lý

---

## 12. Luồng tạo thủ công

Từ màn vận hành:

- bấm `Thêm thông báo thủ công`
- search theo mã lớp
- chọn lớp
- nhập nội dung tin nhắn muốn gửi Telegram
- bấm gửi

Kết quả:

- tạo record mới loại `Khác`
- nguồn được suy ra theo rule GVU/CM
- trạng thái là `Đã gửi thông tin`
- không đi vào màn giáo viên

Use case chính:

- UP/DOWN level
- các thông báo ngoài trigger tự động

---

## 13. Log lịch sử xử lý

Mỗi bản ghi cần giữ event log theo timeline.

Những event tối thiểu:

- Tạo yêu cầu
- Gửi thông báo Telegram
- Giáo viên xác nhận trên ERP
- Giáo viên từ chối trên ERP
- Vận hành chuyển xác nhận
- Vận hành chuyển từ chối
- Gửi lại Telegram
- Ghi chú vận hành
- Tạo yêu cầu thủ công

Yêu cầu:

- log phải lưu actor
- thời gian
- loại sự kiện
- note
- channel nếu có
- result nếu có

---

## 14. Những rule đã chốt nhưng chưa thể hiện đầy đủ trên UI/demo

### 14.1. Rule nghiệp vụ chưa thể hiện đủ

1. SLA weekday/weekend
- Chưa tính chính xác T-24 và T-48 theo ngày học thực tế.

2. Template Telegram chuẩn theo từng nhóm GVVN/GVNN
- Hiện chưa được tách cấu hình riêng theo file template.

3. Nhánh giáo viên cũ trong luồng chuyển ngang
- Vận hành đã có cờ `GV cũ`/`GV mới`, nhưng cần quy định rõ hơn cách lưu, hiển thị, và whether có record riêng hay noti phụ.

4. Báo lớp kết thúc
- Tài liệu gốc và quyết định hiện tại đang khác nhau về việc có cần giáo viên bấm xác nhận đã nhận thông tin hay không.

5. UP/DOWN level
- Mới đang map sang `Khác`, chưa có nhãn hiển thị riêng ở vận hành.

### 14.2. Gap sản phẩm hiện tại cần lưu ý

1. Chưa có cấu hình teacher identity thật
- Demo đang hard-code teacher code mẫu để mô phỏng.

2. Chưa có mapping chính thức giữa Telegram message ID và ERP request ID
- Hiện mới mô phỏng bằng `erpActionUrl`.

3. Chưa có logic đồng bộ trạng thái thời gian thực
- Demo đang chạy mock data/service local.

4. Chưa có phân quyền thực
- Chưa tách role vận hành, teacher care, giáo viên bằng auth thực tế.

5. Chưa có cấu trúc tài liệu/quy trình xử lý đối với error cases
- ví dụ Telegram fail, ERP link expired, giáo viên bấm link khi item đã đóng.

---

## 15. Trạng thái sản phẩm demo hiện tại

### 15.1. Đã có

- Màn vận hành theo dõi queue
- Màn giáo viên với 2 tab `Chờ xác nhận` và `Lịch sử`
- Popup giáo viên khi vào màn
- Flow xác nhận hoặc từ chối trên ERP
- Telegram message có kèm link ERP trong mock data
- Log timeline cơ bản
- Luồng tạo thông báo thủ công

### 15.2. Chưa có hoặc mới ở mức demo

- rule SLA chuẩn theo ngày học
- auth thực
- backend thật
- webhook/bot integration thật
- template Telegram chuẩn hóa theo từng đối tượng
- rule hiển thị hoàn chỉnh cho teacher old/new trong luồng chuyển ngang

---

## 16. Đề xuất backlog tiếp theo

### 16.1. FE

1. Tách popup teacher thành component riêng
2. Chuẩn hóa token text riêng cho teacher-facing labels
3. Tách mock template Telegram thành config data

### 16.2. BE

1. Thiết kế request model chuẩn
2. Lưu event log chuẩn hóa
3. Tạo SLA engine theo weekday/weekend
4. Mapping Telegram delivery status

### 16.3. Product / Ops

1. Chốt lại dứt điểm rule của `Báo lớp kết thúc`
2. Chốt naming chuẩn cho `Khác` khi dùng cho `UP/DOWN level`
3. Chốt danh mục lý do từ chối lớp của giáo viên

---

## 17. Kết luận

Baseline hiện tại nên được hiểu như sau:

- ERP teacher module chỉ phục vụ các thông báo cần phản hồi.
- Telegram là kênh push, ERP là nơi chốt trạng thái.
- Vận hành là nơi điều phối toàn bộ queue và xử lý ngoại lệ.
- Các luồng chỉ gửi thông tin không đưa vào màn giáo viên.

Nếu team tiếp tục phát triển production version, tài liệu này nên được dùng làm spec working version cho FE/BE/QA, và được cập nhật tiếp sau khi Product chốt các điểm còn mở ở phần backlog.
