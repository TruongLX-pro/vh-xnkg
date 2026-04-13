# User Stories + Acceptance Criteria

## 1. Thông tin tài liệu
- Tài liệu: User Stories + Acceptance Criteria
- Liên kết PRD: `PRD_xac_nhan_khai_giang_giao_vien.md`
- Phạm vi: MVP cho quy trình xác nhận khai giảng lớp mới và đổi giáo viên trước buổi học đầu tiên
- Ngày: 2026-04-09

## 2. Nguyên tắc chung
- ERP là nguồn dữ liệu nghiệp vụ chính.
- ERP là nơi xác nhận chính thức của giáo viên.
- Telegram chỉ là kênh nhắc việc hoặc điều hướng về ERP.
- Mỗi lần mở lớp mới hoặc đổi giáo viên sẽ tạo một request xác nhận độc lập.
- Mọi thao tác cần có lịch sử để truy vết.

## 3. Danh sách User Stories

### US-01: Tự động tạo request xác nhận khi mở lớp mới
**Vai trò**: Hệ thống / Vận hành  
**User Story**: Là bộ phận vận hành, tôi muốn hệ thống tự động tạo yêu cầu xác nhận cho giáo viên khi lớp mới được mở để không phải điền form và chuyển tiếp thủ công cho CTV.

**Acceptance Criteria**
1. Khi lớp được mở trên ERP với trạng thái thuộc diện cần báo khai giảng và đã có giáo viên phụ trách, hệ thống tự động tạo 1 request xác nhận mới.
2. Request phải được gắn tối thiểu với các thông tin: mã lớp, giáo viên, lịch học, ngày bắt đầu, level, loại yêu cầu, deadline xác nhận, nguồn phát sinh.
3. Trạng thái ban đầu của request là `Pending`.
4. Nếu lớp chưa có giáo viên phụ trách thì hệ thống không tạo request.
5. Nếu cùng một lần mở lớp đã tồn tại request `Pending` hoặc `Confirmed` hợp lệ cho cùng giáo viên và cùng loại yêu cầu, hệ thống không tạo trùng request.
6. Hệ thống phải lưu thời điểm tạo request và nguồn phát sinh là `Mở lớp mới`.

### US-02: Tự động tạo request mới khi đổi giáo viên trước buổi đầu
**Vai trò**: GVU / CM / Teacher Care  
**User Story**: Là bộ phận vận hành, tôi muốn khi đổi giáo viên trên ERP thì hệ thống tự động tạo request mới cho giáo viên mới để không cần điền form và nhắn tay.

**Acceptance Criteria**
1. Khi giáo viên của lớp được thay đổi trước buổi học đầu tiên, hệ thống phải đóng request hiện tại của giáo viên cũ với trạng thái `Cancelled` hoặc trạng thái tương đương do đổi giáo viên.
2. Hệ thống phải tạo một request mới cho giáo viên mới với trạng thái `Pending`.
3. Request mới phải giữ được snapshot thông tin lớp tại thời điểm phát sinh.
4. Hệ thống phải lưu được thông tin giáo viên cũ và giáo viên mới trong lịch sử.
5. Nếu lớp đã qua buổi học đầu tiên thì không áp dụng luồng đổi giáo viên thuộc MVP này.
6. Nguồn phát sinh phải thể hiện được bộ phận thao tác đổi giáo viên nếu dữ liệu nguồn có sẵn.

### US-03: Hệ thống gửi thông báo cho giáo viên khi có request mới
**Vai trò**: Giáo viên  
**User Story**: Là giáo viên, tôi muốn nhận được thông báo khi có lớp mới cần xác nhận để tôi nắm thông tin và phản hồi kịp thời.

**Acceptance Criteria**
1. Khi request được tạo mới, hệ thống phải hiển thị thông báo trên ERP cho giáo viên được gán.
2. Hệ thống có thể đồng thời gửi tin nhắn Telegram theo template cấu hình sẵn nếu giáo viên có liên kết kênh nhận tin.
3. Nội dung thông báo phải chứa tối thiểu: mã lớp, lịch học, ngày bắt đầu, level, deadline xác nhận, hành động truy cập ERP.
4. Hệ thống phải lưu log từng lần gửi thông báo, gồm: kênh gửi, thời điểm gửi, kết quả gửi.
5. Nếu Telegram gửi thất bại, request vẫn tồn tại và giáo viên vẫn phải nhìn thấy thông báo trên ERP.

### US-04: Giáo viên xem danh sách các lớp chờ xác nhận
**Vai trò**: Giáo viên  
**User Story**: Là giáo viên, tôi muốn có màn hình danh sách các lớp chờ xác nhận để chủ động xử lý các lớp mới được giao.

**Acceptance Criteria**
1. Giáo viên phải có màn hình hiển thị danh sách các request ở trạng thái `Pending`.
2. Mỗi dòng phải hiển thị tối thiểu: mã lớp, loại yêu cầu, lịch học, ngày bắt đầu, level, deadline xác nhận, trạng thái.
3. Giáo viên chỉ nhìn thấy request của chính mình.
4. Danh sách phải được sắp xếp mặc định theo deadline xác nhận tăng dần hoặc thời gian tạo mới nhất theo cấu hình sản phẩm.
5. Giáo viên có thể bấm vào từng request để xem chi tiết đầy đủ hơn.

### US-05: Giáo viên xác nhận nhận lớp
**Vai trò**: Giáo viên  
**User Story**: Là giáo viên, tôi muốn bấm xác nhận nhận lớp trên ERP để vận hành biết tôi đã nhận thông tin và cam kết dạy buổi đầu.

**Acceptance Criteria**
1. Tại request `Pending`, giáo viên có thể chọn hành động `Nhận lớp`.
2. Khi xác nhận thành công, trạng thái request phải chuyển thành `Confirmed`.
3. Hệ thống phải lưu thời điểm xác nhận và người thao tác.
4. Sau khi request đã `Confirmed`, giáo viên không thể tiếp tục sửa lại thành `Rejected` trong MVP trừ khi có yêu cầu thiết kế bổ sung.
5. Vận hành phải thấy được request đã xác nhận trên màn hình theo dõi.
6. Hệ thống phải kiểm tra deadline để xác định request được xác nhận đúng hạn hay sau hạn nếu business cần ghi nhận.

### US-06: Giáo viên từ chối nhận lớp
**Vai trò**: Giáo viên  
**User Story**: Là giáo viên, tôi muốn có thể từ chối nhận lớp và nêu lý do để vận hành xử lý đổi giáo viên kịp thời.

**Acceptance Criteria**
1. Tại request `Pending`, giáo viên có thể chọn hành động `Từ chối lớp`.
2. Khi từ chối, hệ thống bắt buộc giáo viên nhập hoặc chọn lý do từ chối.
3. Sau khi gửi từ chối thành công, trạng thái request chuyển thành `Rejected`.
4. Hệ thống phải lưu lý do từ chối, ghi chú bổ sung nếu có, thời điểm từ chối.
5. Request `Rejected` phải xuất hiện trong queue `Từ chối` của vận hành.
6. Sau khi request chuyển `Rejected`, giáo viên không thể tự đổi lại thành `Confirmed`.

### US-07: Hệ thống tính và quản lý SLA xác nhận
**Vai trò**: Vận hành / Quản lý  
**User Story**: Là vận hành, tôi muốn hệ thống tự tính deadline xác nhận để có thể theo dõi các lớp sắp đến hạn và quá hạn.

**Acceptance Criteria**
1. Với lớp diễn ra trong tuần, hệ thống đặt deadline xác nhận là trước thời điểm học buổi đầu `T - 24 giờ`.
2. Với lớp diễn ra vào thứ 7 hoặc chủ nhật, hệ thống đặt deadline xác nhận là trước thời điểm học buổi đầu `T - 48 giờ`.
3. Deadline phải được lưu cùng request tại thời điểm tạo.
4. Trường hợp mở lớp trong ngày phải được gắn cờ ngoại lệ hoặc đi theo rule override riêng nếu hệ thống có cấu hình.
5. Hệ thống phải có khả năng xác định request đang trong hạn hay quá hạn dựa trên thời gian hệ thống.

### US-08: Tự động chuyển request sang quá hạn khi hết SLA
**Vai trò**: Vận hành  
**User Story**: Là vận hành, tôi muốn các request quá hạn được tự động chuyển trạng thái để tôi xử lý ngay các lớp có rủi ro.

**Acceptance Criteria**
1. Nếu đến deadline mà request vẫn ở trạng thái `Pending`, hệ thống tự động chuyển request sang `Expired`.
2. Request `Expired` phải hiển thị trong tab `Quá hạn`.
3. Hệ thống phải lưu thời điểm chuyển quá hạn.
4. Nếu giáo viên xác nhận sau khi request đã `Expired`, hành vi xử lý phải theo rule được chốt:
- Hoặc không cho phép xác nhận nữa.
- Hoặc cho phép xác nhận nhưng phải ghi nhận là xác nhận sau hạn.
5. MVP cần chọn một trong hai rule trên và thống nhất với business trước khi triển khai.

### US-09: Vận hành theo dõi queue xác nhận tập trung
**Vai trò**: Teacher Care / CTV TC / Quản lý vận hành  
**User Story**: Là vận hành, tôi muốn có một module tập trung để theo dõi toàn bộ các request xác nhận theo trạng thái nhằm thay thế file Excel theo dõi thủ công.

**Acceptance Criteria**
1. Hệ thống có module `Xác nhận lịch dạy`.
2. Module phải có tối thiểu các tab: `Chờ xác nhận`, `Đã xác nhận`, `Từ chối`, `Quá hạn`, `Đã hủy`.
3. Mỗi request trong danh sách phải hiển thị tối thiểu: mã lớp, giáo viên, loại yêu cầu, lịch học, ngày bắt đầu, deadline, trạng thái, nguồn phát sinh.
4. Người dùng vận hành có thể lọc theo ngày khai giảng, giáo viên, loại yêu cầu, nguồn phát sinh.
5. Người dùng vận hành có thể mở chi tiết request để xem lịch sử thông báo và lịch sử thao tác.

### US-10: Vận hành xem lịch sử xử lý của từng request
**Vai trò**: Vận hành / Quản lý  
**User Story**: Là vận hành, tôi muốn xem lịch sử chi tiết của một request để truy vết việc tạo yêu cầu, gửi thông báo, phản hồi của giáo viên và các thay đổi phát sinh.

**Acceptance Criteria**
1. Từ màn hình chi tiết request, người dùng có thể xem lịch sử các sự kiện theo thứ tự thời gian.
2. Lịch sử phải bao gồm tối thiểu: thời điểm tạo request, người/bộ phận phát sinh, thời điểm gửi thông báo, kết quả gửi, thời điểm giáo viên xác nhận hoặc từ chối, lý do từ chối nếu có.
3. Nếu request bị hủy do đổi giáo viên, lịch sử phải thể hiện rõ lý do hủy và request thay thế nếu có.

### US-11: Vận hành gửi nhắc lại thông báo cho giáo viên
**Vai trò**: Vận hành  
**User Story**: Là vận hành, tôi muốn gửi nhắc lại cho giáo viên ở các request chưa xác nhận để giảm tỷ lệ quá hạn.

**Acceptance Criteria**
1. Với request ở trạng thái `Pending`, vận hành có thể bấm `Gửi nhắc lại`.
2. Hệ thống phải gửi lại thông báo theo kênh cấu hình và lưu log gửi mới.
3. Hệ thống không cho phép gửi nhắc lại cho request đã `Confirmed`, `Rejected` hoặc `Cancelled`.
4. Nếu business cần giới hạn số lần nhắc thì rule này phải được cấu hình hoặc chốt thêm ngoài MVP.

### US-12: Hệ thống chống tạo trùng request
**Vai trò**: Vận hành / Hệ thống  
**User Story**: Là vận hành, tôi muốn hệ thống tránh tạo request trùng để không gây nhầm lẫn cho giáo viên và làm sai số liệu theo dõi.

**Acceptance Criteria**
1. Hệ thống không tạo nhiều request `Pending` trùng nhau cho cùng lớp, cùng giáo viên, cùng loại yêu cầu từ cùng một event.
2. Nếu event nguồn được cập nhật lại nhưng không thay đổi dữ liệu trọng yếu thì hệ thống không tạo request mới.
3. Nếu có thay đổi trọng yếu như đổi giáo viên thì phải tạo request mới theo rule nghiệp vụ.

### US-13: Quản lý trạng thái khi lớp bị hủy hoặc không còn cần xác nhận
**Vai trò**: Vận hành  
**User Story**: Là vận hành, tôi muốn request được hủy khi lớp không còn cần xác nhận nữa để queue phản ánh đúng thực tế.

**Acceptance Criteria**
1. Nếu lớp bị hủy trước khi giáo viên xác nhận, request đang `Pending` phải chuyển sang `Cancelled`.
2. Nếu request đã `Confirmed` nhưng lớp bị hủy sau đó, hệ thống cần lưu được sự kiện lớp bị hủy trong lịch sử.
3. Request `Cancelled` không hiển thị trong tab `Chờ xác nhận`.
4. Lý do hủy phải được lưu để phục vụ báo cáo và truy vết.

### US-14: Phân quyền truy cập dữ liệu theo vai trò
**Vai trò**: Hệ thống / Quản trị  
**User Story**: Là quản trị hệ thống, tôi muốn phân quyền theo vai trò để đảm bảo giáo viên và vận hành chỉ truy cập dữ liệu phù hợp.

**Acceptance Criteria**
1. Giáo viên chỉ xem và thao tác được trên request của chính mình.
2. Người dùng vận hành được xem danh sách request theo phạm vi quyền được cấp.
3. Người dùng không có quyền không thể truy cập module `Xác nhận lịch dạy`.
4. Mọi thao tác nghiệp vụ phải gắn được với user thao tác để phục vụ audit log.

## 4. Nghiệp vụ mở cần chốt trước khi dev
- Sau khi request đã `Expired`, giáo viên có còn được phép xác nhận hay không.
- Mở lớp trong ngày sẽ đi theo rule nào: bắt buộc pre-confirm ngoài hệ thống hay vẫn tạo request có override.
- Danh mục lý do từ chối có cần chuẩn hóa thành dropdown hay cho nhập text tự do.
- Telegram có phải kênh bắt buộc cho MVP hay chỉ là kênh tùy chọn.
- Có cần hiển thị popup bắt buộc khi giáo viên đăng nhập hay chỉ cần notification center.

## 5. Gợi ý chia backlog theo sprint
### Sprint 1
- US-01
- US-02
- US-03
- US-04
- US-05
- US-06

### Sprint 2
- US-07
- US-08
- US-09
- US-10
- US-11
- US-12
- US-13
- US-14
