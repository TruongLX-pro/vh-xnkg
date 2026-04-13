# User Stories - Module Thông Báo Giáo Viên Trên ERP

## 1. Thông tin tài liệu

| Trường | Giá trị |
| --- | --- |
| Version | 1.0 |
| Ngày tạo | 13/04/2026 |
| Người tạo | Codex |
| Trạng thái doc | Draft |
| Tài liệu tham chiếu | `SPEC_module_thong_bao_giao_vien_ERP.md` |
| Mẫu tham chiếu | Confluence page `46759996` |

## 2. Tóm tắt

Tài liệu này mô tả bộ User Story cho tính năng thông báo giáo viên trên ERP.

Mục tiêu của tính năng:

- Tự động phát sinh các request thông báo giáo viên khi có biến động lớp học.
- Gửi Telegram kèm link ERP cho giáo viên.
- Cho phép giáo viên xác nhận hoặc từ chối trực tiếp trên ERP đối với các loại thông báo cần phản hồi.
- Cho phép vận hành theo dõi queue, theo dõi lịch sử, gửi lại Telegram, can thiệp xử lý ngoại lệ, và tạo thông báo thủ công.

## 3. Phạm vi release hiện tại

Trong release này, chỉ 3 loại thông báo cần giáo viên phản hồi:

1. Báo lớp khai giảng
2. Báo lớp chuyển ngang
3. Báo đổi lịch học

Hai loại chỉ gửi thông tin:

1. Báo lớp up/down level
2. Báo lớp kết thúc

Quy ước hiện tại:

- `Báo lớp up/down level` được tạo qua luồng thủ công và gắn nhãn `Khác` ở màn vận hành.
- `Báo lớp kết thúc` và `Khác` không hiển thị ở màn giáo viên.

## 4. Danh sách User Story

### US-01: Tự động tạo request báo lớp khai giảng

**User Story**

Là hệ thống vận hành,
Tôi muốn khi lớp mới được mở mà chưa phát sinh buổi học đầu tiên thì hệ thống tự động tạo request báo lớp khai giảng cho giáo viên,
Để giáo viên được thông báo kịp thời và có thể xác nhận nhận lớp trên ERP.

**Business Value**

- Giảm thao tác thủ công của GVU/Teacher Care.
- Chuẩn hóa luồng thông báo khai giảng.
- Tạo dữ liệu queue tập trung để theo dõi và audit.

**Scope**

- Tạo request khi lớp thỏa điều kiện báo khai giảng.
- Xác định nguồn phát sinh là `GVU`.
- Tạo trạng thái ban đầu `Chờ xác nhận`.
- Gửi Telegram kèm link ERP.

**Out of Scope**

- Luồng phân công giáo viên tự động.
- Luồng xác nhận qua Telegram bot.

**Preconditions**

- Lớp đã có giáo viên phụ trách.
- Lớp ở trạng thái `Chờ khai giảng` hoặc `Đang học`.
- Lớp chưa có buổi học đầu tiên.

**Main Flow**

1. Hệ thống ghi nhận lớp mới đủ điều kiện báo khai giảng.
2. Hệ thống tạo request mới cho giáo viên.
3. Hệ thống tính deadline xác nhận.
4. Hệ thống gửi Telegram kèm link ERP.
5. Request xuất hiện trong queue vận hành và màn giáo viên.

**Acceptance Criteria**

| AC | Mô tả |
| --- | --- |
| AC-01 | Khi lớp chưa phát sinh buổi học đầu tiên, hệ thống tạo 1 request loại `Báo lớp khai giảng`. |
| AC-02 | Nguồn phát sinh của request phải là `GVU`. |
| AC-03 | Trạng thái ban đầu của request là `Chờ xác nhận`. |
| AC-04 | Request phải lưu tối thiểu: mã lớp, tên lớp, ngày bắt đầu, lịch học, level, giáo viên, deadline, thời gian tạo. |
| AC-05 | Hệ thống phải gửi Telegram kèm link ERP đến đúng giáo viên của lớp. |
| AC-06 | Request phải hiển thị ở màn vận hành và màn giáo viên nếu request cần phản hồi. |

**Corner Cases**

- Lớp chưa có giáo viên thì không tạo request.
- Event nguồn bị gửi lặp không được tạo request trùng.
- Lớp mở trong ngày vẫn phải đi theo rule SLA/exception do business cấu hình.

**Dependencies**

- Dữ liệu lớp học và giáo viên.
- Service phát sinh request.
- Service gửi Telegram.

---

### US-02: Tự động tạo request khi đổi giáo viên hoặc đổi lịch học

**User Story**

Là hệ thống vận hành,
Tôi muốn khi lớp đang học có đổi giáo viên hoặc đổi lịch học thì hệ thống tự động tạo request mới theo đúng loại nghiệp vụ,
Để giáo viên liên quan nhận được thông tin và phản hồi đúng trên ERP.

**Business Value**

- Đảm bảo phản ánh kịp thời các biến động lớp đang học.
- Tránh bỏ sót thông tin khi vận hành thay đổi lịch hoặc giáo viên.
- Chuẩn hóa theo dõi giữa luồng đổi giáo viên và đổi lịch học.

**Scope**

- Tạo request `Báo lớp chuyển ngang` khi có đổi giáo viên.
- Tạo request `Báo đổi lịch học` khi giữ nguyên giáo viên và chỉ đổi lịch.
- Lưu cờ `GV mới` / `GV cũ` trong luồng chuyển ngang.

**Out of Scope**

- Điều phối giáo viên thay thế sau khi bị từ chối.
- Tối ưu ghép lớp hoặc tối ưu tải giáo viên.

**Preconditions**

- Lớp đã phát sinh ít nhất một buổi học trong quá khứ.
- Lớp đang ở trạng thái đang học.

**Main Flow**

1. Hệ thống nhận event đổi giáo viên hoặc đổi lịch.
2. Hệ thống xác định loại request tương ứng.
3. Hệ thống tạo request mới.
4. Hệ thống gửi Telegram kèm link ERP.
5. Request hiển thị trong queue vận hành và màn giáo viên nếu cần phản hồi.

**Acceptance Criteria**

| AC | Mô tả |
| --- | --- |
| AC-01 | Khi lớp đang học đổi giáo viên, hệ thống tạo request loại `Báo lớp chuyển ngang`. |
| AC-02 | Khi lớp đang học giữ nguyên giáo viên và chỉ đổi lịch, hệ thống tạo request loại `Báo đổi lịch học`. |
| AC-03 | Các request của nhóm này phải có nguồn phát sinh là `CM` vì lớp đã qua buổi học đầu tiên. |
| AC-04 | Với luồng chuyển ngang, dữ liệu request phải cho phép phân biệt `GV mới` và `GV cũ`. |
| AC-05 | Request dành cho giáo viên mới phải ở trạng thái `Chờ xác nhận`. |
| AC-06 | Thông báo cho giáo viên cũ là luồng thông tin, không cần phản hồi trên màn giáo viên. |

**Corner Cases**

- Vừa đổi giáo viên vừa đổi lịch vẫn đi theo luồng `Báo lớp chuyển ngang`.
- Event cập nhật lặp không được tạo nhiều request giống nhau cho cùng một giáo viên và cùng một biến động.

**Dependencies**

- Event thay đổi lịch / thay đổi giáo viên từ ERP.
- Rule xác định lớp đã qua buổi học đầu tiên.

---

### US-03: Gửi Telegram kèm link ERP cho giáo viên

**User Story**

Là vận hành nhà trường,
Tôi muốn mọi thông báo gửi cho giáo viên qua Telegram đều kèm link vào ERP,
Để giáo viên có thể vào đúng màn hình xử lý hoặc theo dõi thông tin ngay từ Telegram.

**Business Value**

- Giảm ma sát khi chuyển từ kênh thông báo sang kênh xử lý.
- Tăng tỷ lệ giáo viên phản hồi đúng nơi cần ghi nhận chính thức.
- Giảm phụ thuộc vào việc vận hành nhắn lại thủ công.

**Scope**

- Telegram cho mọi loại thông báo.
- Link ERP trỏ đúng ngữ cảnh request.
- Log lịch sử gửi Telegram.

**Out of Scope**

- Tracking read receipt của Telegram.
- Deep link sang mobile app riêng.

**Preconditions**

- Request đã được tạo thành công.
- Giáo viên có kênh Telegram hợp lệ hoặc cấu hình nhận thông báo.

**Main Flow**

1. Hệ thống chuẩn bị nội dung message theo loại request.
2. Hệ thống append link ERP tương ứng.
3. Hệ thống gửi Telegram.
4. Hệ thống lưu log gửi.

**Acceptance Criteria**

| AC | Mô tả |
| --- | --- |
| AC-01 | Mỗi message Telegram phải chứa link vào ERP. |
| AC-02 | Nội dung message phải chứa tối thiểu mã lớp, ngày bắt đầu, thời gian học, level theo kịch bản. |
| AC-03 | Nếu request là loại cần phản hồi, link ERP phải dẫn tới màn giáo viên có thể xác nhận hoặc từ chối. |
| AC-04 | Nếu request là loại chỉ gửi thông tin, link ERP chỉ cần dẫn về màn lịch sử hoặc trang thông tin phù hợp. |
| AC-05 | Hệ thống phải lưu log gửi gồm: thời gian gửi, kênh, kết quả gửi. |

**Corner Cases**

- Telegram gửi lỗi thì request vẫn phải tồn tại trên ERP.
- Gửi lại Telegram phải tạo thêm log mới, không ghi đè log cũ.

**Dependencies**

- Service gửi Telegram.
- Mapping request ID -> ERP URL.

---

### US-04: Giáo viên xem danh sách lớp chờ xác nhận

**User Story**

Là giáo viên,
Tôi muốn có một module hiển thị danh sách các lớp cần phản hồi,
Để tôi chủ động xác nhận hoặc từ chối ngay trên ERP.

**Business Value**

- Tập trung các lớp cần xử lý vào một chỗ.
- Giảm phụ thuộc vào việc chỉ đọc Telegram.
- Giúp giáo viên theo dõi được những lớp nào còn chờ xử lý.

**Scope**

- Tab `Chờ xác nhận`
- Popup thông báo khi vào màn
- Search theo mã lớp / tên lớp
- Filter theo loại thông báo

**Out of Scope**

- Hiển thị các thông báo chỉ gửi thông tin.
- Các filter nội bộ của vận hành như nguồn hoặc queue.

**Preconditions**

- Giáo viên đã đăng nhập thành công.
- Giáo viên có request loại cần phản hồi.

**Main Flow**

1. Giáo viên mở module thông báo.
2. Hệ thống kiểm tra có request đang chờ hay không.
3. Nếu có, hiển thị popup danh sách request đang chờ.
4. Giáo viên có thể xác nhận hoặc từ chối từng item.
5. Giáo viên có thể xem danh sách đầy đủ ở tab `Chờ xác nhận`.

**Acceptance Criteria**

| AC | Mô tả |
| --- | --- |
| AC-01 | Màn giáo viên chỉ hiển thị các request có `requiresTeacherConfirmation = true`. |
| AC-02 | Các loại `Khác` và `Báo lớp kết thúc` không được hiển thị ở màn giáo viên. |
| AC-03 | Tab `Chờ xác nhận` phải hiển thị tối thiểu: loại thông báo, lớp, ngày bắt đầu, thời gian học, level, hạn xác nhận. |
| AC-04 | Giáo viên chỉ nhìn thấy request của chính mình. |
| AC-05 | Search phải cho phép tìm theo mã lớp hoặc tên lớp. |
| AC-06 | Filter loại thông báo phải hỗ trợ ít nhất 3 loại: `Báo lớp khai giảng`, `Đổi giáo viên`, `Đổi lịch học`. |

**Corner Cases**

- Không có request chờ xác nhận thì không bật popup đầu vào.
- Có nhiều request cùng lúc thì popup phải hiển thị thành danh sách nhiều item.

**Dependencies**

- Auth/identity của giáo viên.
- Request store / API list requests.

---

### US-05: Giáo viên xác nhận nhận lớp trên ERP

**User Story**

Là giáo viên,
Tôi muốn xác nhận nhận lớp trực tiếp trên ERP,
Để nhà trường biết tôi đã nhận thông tin và đồng ý tiếp nhận lớp hoặc lịch học tương ứng.

**Business Value**

- Ghi nhận chính thức trên hệ thống.
- Giảm sai lệch giữa trao đổi ngoài kênh và trạng thái thực tế.
- Giúp vận hành chốt queue nhanh hơn.

**Scope**

- CTA `Nhận lớp`
- Popup confirm lại
- Chuyển trạng thái sang `Đã xác nhận`
- Ghi log lịch sử xử lý

**Out of Scope**

- Cho phép giáo viên sửa lại quyết định sau khi đã xác nhận.

**Preconditions**

- Request đang ở trạng thái `Chờ xác nhận`.

**Main Flow**

1. Giáo viên bấm `Nhận lớp`.
2. Hệ thống mở popup confirm lại.
3. Giáo viên xác nhận.
4. Hệ thống cập nhật trạng thái request.
5. Item biến mất khỏi tab `Chờ xác nhận` và xuất hiện ở `Lịch sử`.

**Acceptance Criteria**

| AC | Mô tả |
| --- | --- |
| AC-01 | Khi giáo viên bấm `Nhận lớp`, hệ thống phải mở popup confirm lại trước khi ghi nhận. |
| AC-02 | Popup confirm phải hiển thị tối thiểu: loại thông báo, mã lớp, tên lớp, ngày bắt đầu, thời gian học, level, hạn xác nhận. |
| AC-03 | Sau khi xác nhận thành công, request chuyển sang trạng thái `Đã xác nhận`. |
| AC-04 | Hệ thống phải lưu log gồm actor, thời gian, kênh `ERP`, loại sự kiện `Giáo viên xác nhận`. |
| AC-05 | Sau khi xác nhận thành công, item phải biến mất khỏi popup danh sách đang chờ và khỏi tab `Chờ xác nhận`. |

**Corner Cases**

- Request đã được vận hành xử lý trước đó thì hệ thống không cho xác nhận lần nữa.
- Nếu request đã quá hạn nhưng business vẫn cho phép xác nhận thì phải ghi nhận là xác nhận sau hạn.

**Dependencies**

- API update request status.
- Audit log.

---

### US-06: Giáo viên từ chối lớp trên ERP

**User Story**

Là giáo viên,
Tôi muốn từ chối lớp trên ERP và nhập lý do từ chối,
Để vận hành có đủ thông tin xử lý điều phối tiếp theo.

**Business Value**

- Chuẩn hóa nguyên nhân từ chối.
- Giảm việc vận hành phải gọi hỏi lại nhiều lần.
- Tăng tính audit của hệ thống.

**Scope**

- CTA `Từ chối lớp`
- Popup nhập lý do
- Bắt buộc nhập lý do
- Chuyển trạng thái sang `Từ chối`

**Out of Scope**

- Duyệt lý do từ chối theo workflow nhiều cấp.

**Preconditions**

- Request đang ở trạng thái `Chờ xác nhận`.

**Main Flow**

1. Giáo viên bấm `Từ chối lớp`.
2. Hệ thống mở popup nhập lý do.
3. Giáo viên nhập lý do và xác nhận gửi từ chối.
4. Hệ thống cập nhật trạng thái sang `Từ chối`.
5. Request xuất hiện trong lịch sử giáo viên và queue vận hành tương ứng.

**Acceptance Criteria**

| AC | Mô tả |
| --- | --- |
| AC-01 | Khi giáo viên bấm `Từ chối lớp`, hệ thống phải mở popup nhập lý do. |
| AC-02 | Giáo viên bắt buộc nhập lý do trước khi gửi từ chối. |
| AC-03 | Sau khi gửi từ chối thành công, request chuyển sang trạng thái `Từ chối`. |
| AC-04 | Hệ thống phải lưu log gồm actor, thời gian, lý do từ chối, kênh `ERP`. |
| AC-05 | Item bị từ chối phải biến mất khỏi tab `Chờ xác nhận`. |

**Corner Cases**

- Đóng popup mà chưa gửi thì request vẫn giữ nguyên trạng thái `Chờ xác nhận`.
- Nếu vận hành đã xử lý xong trước khi giáo viên gửi từ chối, hệ thống phải chặn gửi trùng.

**Dependencies**

- API reject request.
- Audit log.

---

### US-07: Giáo viên xem lịch sử các request đã xử lý

**User Story**

Là giáo viên,
Tôi muốn có tab lịch sử để xem lại các request đã xác nhận hoặc từ chối,
Để tôi theo dõi được các quyết định đã thực hiện trước đó.

**Business Value**

- Tăng khả năng tự kiểm tra của giáo viên.
- Giảm việc hỏi lại vận hành về các quyết định cũ.

**Scope**

- Tab `Lịch sử`
- Hiển thị request đã xác nhận / từ chối / quá hạn
- Search và filter loại thông báo

**Out of Scope**

- Timeline chi tiết kiểu vận hành
- Chỉnh sửa lại request lịch sử

**Preconditions**

- Giáo viên đã có request đã được xử lý.

**Main Flow**

1. Giáo viên vào tab `Lịch sử`.
2. Hệ thống hiển thị danh sách request đã xử lý.
3. Giáo viên có thể search hoặc filter loại thông báo.

**Acceptance Criteria**

| AC | Mô tả |
| --- | --- |
| AC-01 | Tab `Lịch sử` chỉ hiển thị request loại cần phản hồi đã rời khỏi trạng thái `Chờ xác nhận`. |
| AC-02 | Danh sách phải hiển thị tối thiểu: loại thông báo, lớp, ngày bắt đầu, level, kết quả, cập nhật cuối, ghi nhận gần nhất. |
| AC-03 | Label hiển thị ở phía giáo viên phải dùng `Đổi giáo viên` và `Đổi lịch học` thay cho label vận hành. |
| AC-04 | Search và filter phải hoạt động giống tab `Chờ xác nhận` trong phạm vi teacher module. |

**Corner Cases**

- Request `Khác` hoặc `Báo lớp kết thúc` không được đưa vào lịch sử giáo viên.

**Dependencies**

- API list requests theo teacher.

---

### US-08: Vận hành theo dõi queue thông báo giáo viên

**User Story**

Là vận hành,
Tôi muốn có một module tập trung để theo dõi toàn bộ request thông báo giáo viên,
Để tôi quản lý trạng thái, theo dõi SLA và xử lý ngoại lệ hiệu quả hơn.

**Business Value**

- Thay thế theo dõi thủ công qua file ngoài.
- Tăng khả năng kiểm soát queue.
- Hỗ trợ xử lý nhanh các trường hợp từ chối hoặc quá hạn.

**Scope**

- Danh sách queue theo trạng thái
- Filter theo loại thông báo, nguồn, ngày, giáo viên
- Last update
- Gửi lại Telegram
- Chi tiết request

**Out of Scope**

- Báo cáo BI tổng hợp
- Tối ưu staffing tự động

**Preconditions**

- Request đã được tạo bởi hệ thống hoặc bởi vận hành.

**Main Flow**

1. Vận hành vào module `Quản lý thông báo giáo viên`.
2. Hệ thống hiển thị queue theo trạng thái.
3. Vận hành lọc, xem chi tiết, gửi lại Telegram, hoặc can thiệp xử lý.

**Acceptance Criteria**

| AC | Mô tả |
| --- | --- |
| AC-01 | Vận hành phải có thể xem request theo các trạng thái: `Chờ xác nhận`, `Đã xác nhận`, `Từ chối`, `Quá hạn`, `Đã gửi thông tin`. |
| AC-02 | Danh sách phải hiển thị tối thiểu: mã lớp, giáo viên, mã GV, loại GV, teacher care, loại thông báo, nguồn, ngày bắt đầu, lịch học, hạn phản hồi, trạng thái, last update. |
| AC-03 | Với luồng chuyển ngang, dữ liệu phải thể hiện được cờ `GV cũ` và `GV mới`. |
| AC-04 | Vận hành có thể mở chi tiết request để xem timeline và ghi chú xử lý. |
| AC-05 | Vận hành có thể gửi lại Telegram cho các item phù hợp. |

**Corner Cases**

- Các item `Đã gửi thông tin` không cần phản hồi vẫn phải hiện ở vận hành.
- Item quá hạn nhưng đã được xử lý thủ công vẫn phải có lịch sử rõ ràng.

**Dependencies**

- Request API
- Teacher/ops permissions

---

### US-09: Vận hành can thiệp xác nhận hoặc từ chối thay cho giáo viên

**User Story**

Là vận hành,
Tôi muốn có thể chuyển xác nhận hoặc chuyển từ chối thay cho giáo viên sau khi đã xác minh,
Để queue phản ánh đúng trạng thái thực tế ngay cả khi giáo viên không thao tác trực tiếp trên ERP.

**Business Value**

- Giảm tình trạng queue treo lâu do giáo viên phản hồi ngoài hệ thống.
- Giúp hệ thống bám sát thực tế vận hành.

**Scope**

- Chuyển xác nhận
- Chuyển từ chối
- Popup form/confirm
- Ghi log lịch sử xử lý

**Out of Scope**

- Phê duyệt nhiều cấp cho hành động override

**Preconditions**

- Request đang ở trạng thái `Chờ xác nhận`.
- Vận hành đã xác minh với giáo viên.

**Main Flow**

1. Vận hành chọn item đang chờ.
2. Vận hành bấm `Chuyển xác nhận` hoặc `Chuyển từ chối`.
3. Hệ thống mở popup tương ứng.
4. Vận hành nhập lý do / thông tin xác minh.
5. Hệ thống cập nhật trạng thái và ghi log.

**Acceptance Criteria**

| AC | Mô tả |
| --- | --- |
| AC-01 | `Chuyển xác nhận` phải mở popup confirm và cho phép nhập lý do. |
| AC-02 | `Chuyển từ chối` phải mở popup form và cho phép nhập lý do từ chối. |
| AC-03 | Cả hai thao tác phải được lưu vào lịch sử xử lý. |
| AC-04 | Sau khi vận hành chuyển trạng thái thành công, request không còn nằm trong queue `Chờ xác nhận`. |

**Corner Cases**

- Request đã được giáo viên xử lý trong lúc popup đang mở thì không cho submit thành công.

**Dependencies**

- Permission vận hành
- Audit log

---

### US-10: Vận hành tạo thông báo thủ công cho các trường hợp chỉ gửi thông tin

**User Story**

Là vận hành,
Tôi muốn chủ động tạo thông báo thủ công cho một lớp và gửi Telegram cho giáo viên,
Để xử lý được các trường hợp ngoài trigger tự động như up/down level.

**Business Value**

- Không bỏ sót các trường hợp biến động ngoài luồng chuẩn.
- Vẫn gom được lịch sử và tracking vào cùng một module.

**Scope**

- Search lớp theo mã lớp
- Chọn lớp
- Nhập nội dung tin nhắn Telegram
- Gửi thông báo
- Tạo request loại `Khác`

**Out of Scope**

- Thiết kế template riêng cho từng biến động thủ công

**Preconditions**

- Vận hành có quyền tạo thông báo thủ công.
- Lớp tồn tại trên hệ thống.

**Main Flow**

1. Vận hành bấm `Thêm thông báo thủ công`.
2. Hệ thống mở popup tìm lớp theo mã lớp.
3. Vận hành chọn lớp và nhập nội dung cần gửi.
4. Hệ thống gửi Telegram và tạo request loại `Khác`.

**Acceptance Criteria**

| AC | Mô tả |
| --- | --- |
| AC-01 | Khi gửi thành công, hệ thống tạo request loại `Khác`. |
| AC-02 | Request thủ công mặc định ở trạng thái `Đã gửi thông tin`. |
| AC-03 | Nguồn của request thủ công vẫn phải tuân theo rule `GVU` / `CM` dựa trên việc lớp đã qua buổi đầu tiên hay chưa. |
| AC-04 | Request thủ công không được hiển thị ở màn giáo viên. |

**Corner Cases**

- Không chọn lớp hoặc không nhập nội dung thì không được submit.

**Dependencies**

- Search lớp
- Service gửi Telegram

---

### US-11: Hệ thống quản lý SLA và quá hạn xác nhận

**User Story**

Là vận hành,
Tôi muốn hệ thống tự tính deadline xác nhận và tự chuyển quá hạn khi cần,
Để tôi ưu tiên xử lý đúng các lớp có rủi ro chậm xác nhận.

**Business Value**

- Làm rõ mức độ ưu tiên queue.
- Giảm tình trạng lớp bị bỏ quên trước buổi đầu tiên.

**Scope**

- Tính SLA khi tạo request
- Tự chuyển trạng thái `Quá hạn`
- Hiển thị trạng thái SLA trên queue

**Out of Scope**

- Dashboard BI nâng cao về SLA

**Preconditions**

- Request loại cần phản hồi đã được tạo.

**Main Flow**

1. Hệ thống tính deadline theo thời gian học.
2. Hệ thống lưu deadline cùng request.
3. Nếu đến hạn mà request chưa được phản hồi, hệ thống tự chuyển trạng thái `Quá hạn`.

**Acceptance Criteria**

| AC | Mô tả |
| --- | --- |
| AC-01 | Với lớp trong tuần, deadline xác nhận phải là `T - 24h`. |
| AC-02 | Với lớp Thứ 7 hoặc Chủ nhật, deadline xác nhận phải là `T - 48h`. |
| AC-03 | Khi vượt deadline mà request vẫn `Chờ xác nhận`, hệ thống phải chuyển sang `Quá hạn`. |
| AC-04 | Request `Quá hạn` phải xuất hiện ở queue vận hành tương ứng. |

**Corner Cases**

- Business cần chốt rõ rule xử lý khi giáo viên xác nhận sau hạn.
- Trường hợp mở lớp trong ngày có thể cần rule override riêng.

**Dependencies**

- Service tính deadline
- Job hoặc trigger cập nhật trạng thái

## 5. Open Questions cần Product chốt tiếp

1. Báo lớp kết thúc có giữ đúng quyết định hiện tại là chỉ gửi thông tin, hay quay lại rule cũ là phải xác nhận đã nhận thông tin.
2. Có cần tách `UP/DOWN level` thành loại thông báo riêng ở vận hành thay vì map vào `Khác`.
3. Giáo viên có được xác nhận sau khi request đã `Quá hạn` hay không.
4. Danh mục lý do từ chối lớp của giáo viên sẽ là text tự do hay danh mục chuẩn.
5. Luồng giáo viên cũ trong `Báo lớp chuyển ngang` có cần một item hiển thị riêng trong lịch sử giáo viên hay chỉ là log nội bộ vận hành.

## 6. Gợi ý chia backlog

### Nhóm nền tảng

- US-01
- US-02
- US-03
- US-11

### Nhóm màn giáo viên

- US-04
- US-05
- US-06
- US-07

### Nhóm màn vận hành

- US-08
- US-09
- US-10
