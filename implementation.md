Xây dựng hệ thống website làm nhiệm vụ và đầu tư kiếm tiền với giao diện giống các ứng dụng kiếm tiền Trung Quốc.

YÊU CẦU CHUNG

* Toàn bộ text hiển thị trên giao diện phải là tiếng Việt.
* Không hiển thị tiếng Anh trong UI.
* Thiết kế mobile-first.
* Layout dọc giống ứng dụng điện thoại.
* Trên desktop vẫn hiển thị dạng mobile.

---

TECH STACK

Frontend

Next.js (App Router)
TailwindCSS
Mobile-first responsive

Backend

NestJS (REST API)

Database

PostgreSQL

Deployment

Frontend deploy trên Vercel
Backend deploy trên VPS

---

UI LAYOUT

Website phải hiển thị như ứng dụng mobile.

Max width: 420px
Căn giữa màn hình desktop.

Theme:

Nền gradient xanh đậm
Text trắng
Số liệu màu xanh neon
Card bo góc lớn
Button lớn

Thanh menu dưới gồm:

Trang chủ
Nhiệm vụ
Nhóm
Ví
Cá nhân

---

HỆ THỐNG ĐĂNG KÝ

Form đăng ký:

Tên đăng nhập
Mật khẩu
Nhập lại mật khẩu
Mã giới thiệu (bắt buộc)
Captcha chống bot

Quy tắc:

Không cho đăng ký nếu thiếu mã giới thiệu.
Mã giới thiệu phải tồn tại trong hệ thống.
Sau khi đăng ký thành công, user được tạo một mã giới thiệu riêng.

---

HỆ THỐNG GIỚI THIỆU

Referral 3 cấp:

Level 1 (F1)
Level 2 (F2)
Level 3 (F3)

Hoa hồng:

Level 1: 32%
Level 2: 3%
Level 3: 1%

Khi người được giới thiệu đầu tư hoặc hoàn thành nhiệm vụ thì người giới thiệu sẽ nhận hoa hồng.

---

DATABASE MODELS (FIELD PHẢI LÀ TIẾNG ANH)

User

id
username
password_hash
referral_code
invited_by_user_id
balance
total_income
today_income
bank_name
bank_account_number
bank_account_holder
created_at

InvestmentProduct

id
name
description
price
roi_percent
daily_profit
total_profit
duration_days
payment_delay_hours
is_active

UserInvestment

id
user_id
product_id
amount
daily_profit
total_profit
start_date
end_date
status

Task

id
title
description
reward
task_type
is_active

TaskCompletion

id
user_id
task_id
status
created_at

CommissionRecord

id
user_id
from_user_id
level
amount
type
created_at

DepositRequest

id
user_id
amount
status
created_at

WithdrawRequest

id
user_id
amount
bank_name
bank_account_number
bank_account_holder
status
created_at

---

TRANG CHỦ

Hiển thị:

Số dư
Thu nhập hôm nay
Tổng thu nhập

Nút nhanh:

Đầu tư
Nhiệm vụ
Rút tiền

---

TRANG GÓI ĐẦU TƯ

Ví dụ:

Palantir AI VIP 1

Tỷ lệ hoàn vốn: 31%
Thời hạn: 90 ngày
Lợi nhuận hằng ngày: 18,600
Tổng lợi nhuận: 1,674,000
Thời gian hoàn tiền: 24h

Nút:

Mua ngay

---

TRANG NHÓM

Hiển thị:

Số người đã giới thiệu
Hoa hồng hôm nay
Tổng thu nhập

Thông tin hoa hồng:

Giới thiệu trực tiếp (cấp 1): 32%
Giới thiệu gián tiếp (cấp 2): 3%
Giới thiệu gián tiếp (cấp 3): 1%

Card thống kê:

LV1
Số người
Hoa hồng hôm nay
Tổng thu nhập

LV2
Số người
Hoa hồng hôm nay
Tổng thu nhập

LV3
Số người
Hoa hồng hôm nay
Tổng thu nhập

---

HỆ THỐNG HOA HỒNG

Khi user đầu tư:

F1 nhận 32%
F2 nhận 3%
F3 nhận 1%

Hoa hồng được lưu trong bảng CommissionRecord.

---

TRANG NHIỆM VỤ

Danh sách nhiệm vụ:

Xem trang web
Click link
AI trading task

User bấm hoàn thành nhiệm vụ.

Admin duyệt nhiệm vụ.

Sau khi duyệt thì cộng tiền.

---

TRANG VÍ

Hiển thị:

Số dư
Thu nhập hôm nay
Tổng thu nhập

Chức năng:

Yêu cầu nạp tiền
Yêu cầu rút tiền

Rút tiền cần:

Tên ngân hàng
Số tài khoản
Tên chủ tài khoản

---

TRANG CÁ NHÂN

Hiển thị:

Tên người dùng
Mã giới thiệu
Link mời bạn bè

Cho phép cập nhật:

Thông tin ngân hàng

---

ADMIN PANEL

Admin đăng nhập riêng.

Chức năng:

Quản lý user
Xem cây giới thiệu
Tạo gói đầu tư
Tạo nhiệm vụ
Duyệt nhiệm vụ
Duyệt nạp tiền
Duyệt rút tiền
Xem thống kê hệ thống

---

ANTI SPAM & CHỐNG TẠO ACC ĂN HOA HỒNG

Hệ thống phải có các cơ chế sau:

1. Captcha khi đăng ký.

2. Giới hạn số tài khoản đăng ký trên cùng IP:

Tối đa 3 tài khoản trong 24 giờ.

3. Kiểm tra fingerprint trình duyệt:

Nếu nhiều tài khoản cùng fingerprint thì đánh dấu nghi ngờ.

4. Không cho rút tiền nếu:

User chưa đầu tư hoặc chưa hoàn thành nhiệm vụ tối thiểu.

5. Chỉ kích hoạt hoa hồng nếu user F1 có hoạt động thực:

Đầu tư tối thiểu một gói.

6. Phát hiện vòng lặp referral:

Không cho user tạo vòng giới thiệu.

7. Rate limit API:

Giới hạn số request đăng ký / login.

8. Admin có dashboard hiển thị:

IP đăng ký
Fingerprint
Số tài khoản cùng IP

---

BẢO MẬT

Password hashing (bcrypt)
JWT authentication
Validate referral code
Không cho hoàn thành nhiệm vụ nhiều lần

---

UI DESIGN

Layout mobile dọc
Max width 420px
Theme tối
Gradient xanh
Button lớn
Card bo góc
Hiệu ứng mượt

---

DELIVERABLE

Next.js frontend
NestJS backend
PostgreSQL schema
Admin dashboard
API documentation

---

Tên webstite là 
bscxau