# SPEC Module Thông Báo Giáo Viên Trên ERP

## 1. Mục tiêu

Tài liệu này chốt lại nghiệp vụ mới nhất của tính năng thông báo giáo viên trên ERP, sau khi đã cập nhật lại model xử lý trên màn vận hành và luồng xử lý giữa ERP - Telegram - giáo viên.

Mục tiêu của tài liệu:

- thống nhất cách hiểu giữa Product, Operations, GVU, CM, FE, BE, QA
- chốt model dữ liệu và state machine ở mức business
- làm baseline cho các thay đổi tiếp theo của màn vận hành, màn giáo viên, BE và QA test case

## 2. Phạm vi tính năng

Tính năng gồm 2 phần:

- Màn vận hành trên ERP để theo dõi và xử lý các bản ghi thông báo giáo viên
- Màn giáo viên trên ERP để giáo viên xác nhận hoặc từ chối các thông báo cần phản hồi

Telegram là kênh gửi thông báo ra ngoài.  
ERP là nơi ghi nhận trạng thái chính thức và lịch sử xử lý.

## 3. Nhóm loại thông báo

### 3.1. Nhóm cần giáo viên phản hồi

Ba loại sau bắt buộc giáo viên phản hồi:

1. Báo lớp khai giảng
2. Báo lớp chuyển ngang
3. Báo đổi lịch học

### 3.2. Nhóm chỉ gửi thông tin

Hai loại sau không yêu cầu giáo viên phản hồi:

1. Báo lớp kết thúc
2. Khác

Lưu ý:

- `Khác` là nhãn kỹ thuật trên màn vận hành
- use case business phổ biến của `Khác` là up/down level hoặc các trường hợp tạo thủ công
- các loại chỉ gửi thông tin không hiển thị trong màn giáo viên

## 4. Rule nguồn phát sinh

Nguồn phát sinh chỉ gồm 2 giá trị:

- `GVU`
- `CM`

Rule xác định:

- lớp chưa diễn ra buổi học đầu tiên thì nguồn phát sinh là `GVU`
- lớp đã phát sinh buổi học đầu tiên thì nguồn phát sinh là `CM`

Rule này áp dụng cho cả trigger tự động và thông báo tạo thủ công.

## 5. Đơn vị theo dõi trên màn vận hành

Mỗi bản ghi thông báo trên màn vận hành được theo dõi theo cặp khóa:

- `Mã lớp`
- `Giáo viên`

Lưu ý nghiệp vụ:

- UI và business queue theo dõi theo cặp `Mã lớp + Giáo viên`
- hệ thống vẫn cần `requestId` để định danh từng bản ghi cụ thể
- cùng một cặp `Mã lớp + Giáo viên` có thể phát sinh nhiều bản ghi theo thời gian nếu bản ghi trước đã hoàn thành

## 6. Model nghiệp vụ mới: Trạng thái và Kết quả xử lý

### 6.1. Trạng thái bản ghi

Trạng thái thể hiện bản ghi đang nằm ở đâu trong queue vận hành:

1. `Chờ xử lý`
2. `Đang xử lý`
3. `Hoàn thành`

### 6.2. Kết quả xử lý

Kết quả xử lý thể hiện outcome của bản ghi:

1. `Xác nhận`
2. `Từ chối`
3. `Hủy`
4. `Đã gửi thông tin`
5. `Quá hạn`

### 6.3. Nguyên tắc tách 2 lớp thông tin

- `Trạng thái` trả lời câu hỏi: bản ghi này hiện đang ở đâu trong queue?
- `Kết quả xử lý` trả lời câu hỏi: bản ghi này đã được xử lý ra sao?

Không được gộp 2 khái niệm này thành 1 field duy nhất như model cũ.

## 7. Mapping nghiệp vụ giữa Trạng thái và Kết quả xử lý

### 7.1. Bản ghi mới thuộc nhóm cần phản hồi

Khi hệ thống mới tạo bản ghi cho:

- Báo lớp khai giảng
- Báo lớp chuyển ngang
- Báo đổi lịch học

thì mặc định:

- Trạng thái = `Chờ xử lý`
- Kết quả xử lý = rỗng

### 7.2. Giáo viên hoặc vận hành xác nhận

Nếu giáo viên hoặc vận hành thao tác xác nhận:

- Trạng thái = `Hoàn thành`
- Kết quả xử lý = `Xác nhận`

### 7.3. Giáo viên hoặc vận hành từ chối

Nếu giáo viên hoặc vận hành thao tác từ chối:

- Trạng thái = `Đang xử lý`
- Kết quả xử lý = `Từ chối`

Ý nghĩa:

- đã có outcome là giáo viên không nhận lớp
- nhưng vận hành chưa kết thúc follow-up nghiệp vụ

Sau đó, khi vận hành bấm `Đã xử lý`:

- Trạng thái = `Hoàn thành`
- Kết quả xử lý vẫn giữ = `Từ chối`

### 7.4. Bản ghi chỉ gửi thông tin

Với các bản ghi không cần giáo viên phản hồi:

- Trạng thái = `Hoàn thành`
- Kết quả xử lý = `Đã gửi thông tin`

Áp dụng cho:

- Báo lớp kết thúc
- Khác

### 7.5. Bản ghi quá hạn SLA

Nếu bản ghi đang `Chờ xử lý` mà quá SLA chưa có phản hồi:

- Trạng thái = `Đang xử lý`
- Kết quả xử lý = `Quá hạn`

Sau đó vận hành có thể chốt lại một trong 3 hướng:

- `Xác nhận`
- `Từ chối`
- `Hủy`

Khi chốt xong:

- Trạng thái = `Hoàn thành`
- Kết quả xử lý = giá trị mà vận hành chọn

### 7.6. Bản ghi bị hủy do đổi giáo viên

Nếu bản ghi cũ đang `Chờ xử lý` mà vận hành vào màn thông tin lớp và đổi giáo viên:

- bản ghi cũ được gán:
  - Trạng thái = `Hoàn thành`
  - Kết quả xử lý = `Hủy`
- đồng thời hệ thống tạo một bản ghi mới cho giáo viên mới:
  - Trạng thái = `Chờ xử lý`
  - Kết quả xử lý = rỗng

Với bản ghi cũ:

- giáo viên cũ click link sẽ không còn popup xác nhận
- giáo viên cũ chỉ xem được ở lịch sử

## 8. Rule đặc biệt khi đổi lịch

Nếu bản ghi hiện tại đang `Chờ xử lý` mà vận hành vào màn thông tin lớp và đổi lịch:

- hệ thống update trực tiếp thông tin lịch mới trên chính dòng hiện tại
- cặp khóa vẫn là `Mã lớp + Giáo viên`
- không tạo bản ghi mới

Nội dung cần được update:

- ngày bắt đầu
- first session
- schedule
- deadline SLA nếu có thay đổi
- nội dung Telegram / ERP display nếu cần

Lưu ý phản biện:

- rule này chỉ nên áp dụng khi bản ghi đang `Chờ xử lý`
- nếu bản ghi đã vào `Đang xử lý` hoặc `Hoàn thành` thì không nên overwrite lịch sử

## 9. Trigger nghiệp vụ theo từng loại

### 9.1. Báo lớp khai giảng

Điều kiện:

- lớp mới được tạo
- lớp ở trạng thái chờ khai giảng hoặc đang học
- chưa phát sinh buổi học đầu tiên

Kết quả:

- tạo bản ghi `Chờ xử lý`
- kết quả xử lý rỗng
- gửi Telegram kèm link ERP

### 9.2. Báo lớp chuyển ngang

Điều kiện:

- lớp đang học
- đã phát sinh buổi học trong quá khứ
- có đổi giáo viên, hoặc vừa đổi giáo viên vừa đổi lịch

Kết quả:

- với giáo viên mới: tạo bản ghi cần xác nhận
- với giáo viên cũ: thông tin cũ được chuyển thành lịch sử khi cần

Trong UI vận hành cần có cờ phân biệt:

- `GV mới`
- `GV cũ`

### 9.3. Báo đổi lịch học

Điều kiện:

- lớp đang học
- đã phát sinh buổi học trong quá khứ
- giữ nguyên giáo viên
- chỉ đổi lịch học

Kết quả:

- tạo bản ghi `Chờ xử lý`
- kết quả xử lý rỗng
- nếu tiếp tục đổi lịch khi bản ghi vẫn đang `Chờ xử lý` thì update trên cùng bản ghi

### 9.4. Báo lớp kết thúc

Kết quả:

- Trạng thái = `Hoàn thành`
- Kết quả xử lý = `Đã gửi thông tin`
- không hiển thị trong màn giáo viên

### 9.5. Khác

Được tạo thủ công bởi vận hành.

Kết quả:

- Trạng thái = `Hoàn thành`
- Kết quả xử lý = `Đã gửi thông tin`
- không hiển thị trong màn giáo viên

## 10. Rule SLA

Rule business hiện tại:

- lớp trong tuần: xác nhận trước `T - 24h`
- lớp thứ 7, chủ nhật: xác nhận trước `T - 48h`

Trong đó:

- `T` là thời điểm lớp diễn ra

Nếu quá SLA:

- hệ thống chuyển bản ghi từ `Chờ xử lý` sang `Đang xử lý`
- hệ thống gán kết quả xử lý = `Quá hạn`

## 11. Rule Telegram

Mọi tin nhắn Telegram gửi cho giáo viên phải gồm:

- thông tin lớp tối thiểu
- hướng dẫn vào ERP
- link ERP đúng với bản ghi hiện tại

Thông tin lớp tối thiểu:

- Mã lớp
- Ngày bắt đầu
- Thời gian học
- Level
- nếu cần: loại lớp, giáo viên cũ/giáo viên mới

Lưu ý:

- Telegram là kênh thông báo
- ERP mới là nơi ghi nhận kết quả chính thức

## 12. Màn vận hành

### 12.1. Cách tổ chức giao diện

Màn vận hành được đề xuất theo:

- Tab:
  - `Chờ xử lý`
  - `Đang xử lý`
  - `Hoàn thành`
- Cột `Kết quả xử lý` hiển thị bằng tag

### 12.2. Các cột thông tin tối thiểu

- Mã lớp
- Giáo viên
- Loại thông báo
- Nguồn
- Ngày bắt đầu
- Lịch học
- Hạn phản hồi
- Kết quả xử lý
- Last update

### 12.3. Các action chính

Khi bản ghi ở `Chờ xử lý`:

- Chi tiết
- Gửi lại Telegram
- Chuyển xác nhận
- Chuyển từ chối

Khi bản ghi ở `Đang xử lý`:

- Chi tiết
- Gửi lại Telegram
- Đánh dấu đã xử lý
- nếu là `Quá hạn`: có thể chốt `Xác nhận`, `Từ chối`, hoặc `Hủy`

Khi bản ghi ở `Hoàn thành`:

- Chủ yếu xem chi tiết và lịch sử

## 13. Màn giáo viên

### 13.1. Phạm vi hiển thị

Màn giáo viên chỉ hiển thị các bản ghi:

- cần giáo viên phản hồi
- đang `Chờ xử lý`

Không hiển thị:

- Báo lớp kết thúc
- Khác
- bản ghi đã bị `Hủy`
- bản ghi đã vào `Đang xử lý` do quá hạn hoặc từ chối

### 13.2. Cấu trúc màn

Gồm 2 tab:

1. `Chờ xác nhận`
2. `Lịch sử`

### 13.3. Rule popup đầu vào

Khi giáo viên vào màn:

- nếu còn bản ghi `Chờ xử lý` thì mở popup
- popup cho xác nhận nhanh hoặc từ chối

Nếu bản ghi đã chuyển sang `Hủy`, `Quá hạn`, `Từ chối`, `Xác nhận`, `Đã gửi thông tin`:

- chỉ hiển thị ở lịch sử
- không còn popup xác nhận

## 14. Audit trail

Mọi thay đổi nghiệp vụ phải lưu event log.

Tối thiểu cần audit:

- ai tạo bản ghi
- ai gửi Telegram
- ai xác nhận
- ai từ chối
- khi nào hệ thống đánh dấu quá hạn
- khi nào vận hành đánh dấu đã xử lý
- khi nào hệ thống hủy bản ghi cũ và tạo bản ghi mới do đổi giáo viên
- khi nào lịch học trên bản ghi được update trực tiếp

## 15. Điểm cần lưu ý cho BE/FE/QA

### 15.1. FE

- không được tiếp tục dùng 1 field `status` để represent cả queue và outcome
- UI vận hành phải tách rõ tab và tag kết quả xử lý

### 15.2. BE

- cần model được `processingStatus` và `resolutionResult`
- cần support transition logic thay vì cho FE set trạng thái tùy ý

### 15.3. QA

Cần cover tối thiểu các case:

- tạo mới bản ghi cần xác nhận
- xác nhận bởi giáo viên
- xác nhận bởi vận hành
- từ chối bởi giáo viên
- từ chối bởi vận hành
- quá hạn SLA
- vận hành chốt lại bản ghi quá hạn
- đổi giáo viên khi bản ghi đang chờ xử lý
- đổi lịch khi bản ghi đang chờ xử lý
- tạo thông báo thủ công

## 16. Kết luận

Model nghiệp vụ mới cần được hiểu theo 2 lớp:

- `Trạng thái bản ghi` để theo dõi queue vận hành
- `Kết quả xử lý` để thể hiện outcome của bản ghi

Đây là thay đổi quan trọng nhất so với model cũ, và là nền tảng để màn vận hành và màn giáo viên xử lý đúng nghiệp vụ trong các tình huống:

- xác nhận
- từ chối
- quá hạn
- hủy do đổi giáo viên
- update lịch trên cùng bản ghi
