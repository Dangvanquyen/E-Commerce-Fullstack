# FashionStore

FashionStore là ứng dụng thương mại điện tử bán quần áo, gồm frontend React/Vite và backend ASP.NET Core Web API. Hệ thống hỗ trợ khách hàng mua sắm, giỏ hàng, yêu thích, đặt hàng, thanh toán VNPay, chat realtime với quản trị viên, chatbot AI và khu vực quản trị cửa hàng.

> Tài liệu này mô tả cấu trúc và cách chạy theo trạng thái hiện tại của repository.

## Mục lục

- [Tính năng](#tính-năng)
- [Kiến trúc dự án](#kiến-trúc-dự-án)
- [Yêu cầu môi trường](#yêu-cầu-môi-trường)
- [Cài đặt nhanh](#cài-đặt-nhanh)
- [Chạy frontend](#chạy-frontend)
- [Chạy backend](#chạy-backend)
- [Cấu hình biến môi trường](#cấu-hình-biến-môi-trường)
- [Database và migration](#database-và-migration)
- [Tài khoản mặc định](#tài-khoản-mặc-định)
- [API và SignalR](#api-và-signalr)
- [Deploy frontend lên Vercel](#deploy-frontend-lên-vercel)
- [Deploy backend](#deploy-backend)
- [Checklist production](#checklist-production)
- [Kiểm tra trước khi push](#kiểm-tra-trước-khi-push)
- [Xử lý lỗi thường gặp](#xử-lý-lỗi-thường-gặp)
- [Bảo mật](#bảo-mật)

## Tính năng

### Khách hàng

- Xem sản phẩm, danh mục, chi tiết sản phẩm và biến thể.
- Tìm kiếm, lọc, phân trang sản phẩm.
- Đăng ký, đăng nhập bằng JWT và đăng xuất.
- Quản lý giỏ hàng và số lượng sản phẩm.
- Thêm/xóa sản phẩm yêu thích.
- Đặt hàng trực tiếp hoặc qua giỏ hàng.
- Theo dõi đơn hàng và hủy đơn theo trạng thái cho phép.
- Thanh toán VNPay.
- Cập nhật hồ sơ, địa chỉ, mật khẩu và ảnh đại diện.
- Theo dõi hành vi xem sản phẩm.
- Chat với quản trị viên qua SignalR, có cơ chế polling dự phòng khi realtime không khả dụng.
- Nhận tư vấn từ chatbot AI.

### Quản trị viên

- Dashboard tổng quan.
- Quản lý danh mục.
- Quản lý sản phẩm và biến thể.
- Quản lý tồn kho.
- Quản lý đơn hàng và trạng thái đơn.
- Quản lý người dùng và vai trò.
- Quản lý voucher/mã giảm giá.
- Theo dõi giỏ hàng bỏ quên.
- Xem báo cáo doanh thu và hành vi sản phẩm.
- Chat với khách hàng.
- Gợi ý sản phẩm dựa trên mô hình Apriori.

## Kiến trúc dự án

```text
BanQuanAo/
├── backend/
│   ├── ClothingStore.sln
│   ├── global.json
│   ├── Domain/                 # Entity và abstraction ở tầng domain
│   ├── Application/            # DTO, mapping, service và business logic
│   ├── Infrastructure/         # EF Core, DbContext, migration, repository
│   └── WebAPIs/                # ASP.NET Core API, controller, SignalR Hub
├── frontend/
│   ├── src/
│   │   ├── api/                # Axios client và API modules
│   │   ├── components/         # Component dùng chung
│   │   ├── context/             # Auth, cart, wishlist, chat context
│   │   ├── layouts/             # Shop layout và admin layout
│   │   ├── pages/               # Trang khách hàng và quản trị
│   │   └── services/            # SignalR và service frontend
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
├── vercel.json                 # Cấu hình khi deploy từ root repository
└── .gitignore
```

### Luồng backend

Backend sử dụng kiến trúc nhiều tầng:

```text
WebAPIs -> Application -> Domain
    \-> Infrastructure -> SQL Server
```

- `Domain`: entity và interface repository.
- `Application`: DTO, service nghiệp vụ, mapping và interface service.
- `Infrastructure`: `AppDbContext`, EF Core configuration, migration, repository và dịch vụ hạ tầng.
- `WebAPIs`: controller REST, xác thực JWT, CORS, Swagger trong Development và SignalR `/chatHub`.

## Yêu cầu môi trường

### Bắt buộc

- Node.js 18 trở lên, khuyến nghị Node.js 20 hoặc mới hơn.
- npm.
- .NET SDK 9.0.305 hoặc SDK .NET 9 tương thích.
- SQL Server hoặc Azure SQL.
- Git.

### Tùy chọn

- Visual Studio 2022 hoặc VS Code.
- SQL Server Management Studio/Azure Data Studio.
- Tài khoản VNPay sandbox hoặc production.
- API key Gemini.
- SMTP account, thường là Gmail App Password.

Kiểm tra phiên bản:

```powershell
node --version
npm --version
dotnet --version
git --version
```

## Cài đặt nhanh

Từ thư mục gốc repository:

```powershell
# Cài dependency frontend
npm --prefix frontend install

# Build kiểm tra frontend
npm --prefix frontend run build

# Build kiểm tra backend
dotnet build backend/ClothingStore.sln
```

Hoặc làm việc trực tiếp trong thư mục frontend:

```powershell
cd frontend
npm install
```

Không commit các thư mục sau:

- `node_modules/`
- `frontend/dist/`
- `bin/` và `obj/`
- file `.env` chứa secret
- log runtime
- file upload local

## Chạy frontend

Frontend chạy mặc định trên cổng Vite, thường là `http://localhost:5173`.

```powershell
cd frontend
npm run dev
```

Mở trình duyệt tại địa chỉ Vite in ra trong terminal.

Các lệnh khác:

```powershell
# Kiểm tra lint
npm run lint

# Build production
npm run build

# Chạy thử bản build đã tạo
npm run preview
```

### Cấu hình frontend local

Tạo file `frontend/.env.local` từ mẫu:

```powershell
Copy-Item frontend/.env.example frontend/.env.local
```

Nội dung tối thiểu:

```env
VITE_API_BASE_URL=http://localhost:5281
```

`VITE_API_BASE_URL` là origin của backend. Có thể ghi theo một trong hai dạng:

```env
VITE_API_BASE_URL=http://localhost:5281
```

hoặc:

```env
VITE_API_BASE_URL=http://localhost:5281/api/v1
```

Frontend sẽ tự chuẩn hóa thành:

- REST API: `http://localhost:5281/api/v1`
- SignalR: `http://localhost:5281/chatHub`

Sau khi thay đổi file `.env.local`, cần khởi động lại Vite.

## Chạy backend

Backend API nằm ở `backend/WebAPIs` và target .NET 9.

### Chạy bằng dotnet CLI

```powershell
dotnet run --project backend/WebAPIs/WebAPIs.csproj
```

Theo `launchSettings.json`, môi trường local thường có các địa chỉ:

- HTTP: `http://localhost:5281`
- HTTPS: `https://localhost:7061`

Khi chạy Development, Swagger UI được mở tại root của backend, ví dụ:

```text
http://localhost:5281/
```

### Chạy bằng Visual Studio

1. Mở `backend/ClothingStore.sln`.
2. Chọn project `WebAPIs` làm startup project.
3. Chọn profile HTTP hoặc HTTPS.
4. Kiểm tra connection string và database trước khi chạy.
5. Nhấn `F5` hoặc `Ctrl+F5`.

## Cấu hình biến môi trường

Không dùng connection string, JWT secret hoặc API key thật trong Git. ASP.NET Core cho phép ghi đè cấu hình JSON bằng biến môi trường với dấu `:` được thay bằng `__`.

### Backend local

Có thể dùng User Secrets để giữ secret ngoài file cấu hình:

```powershell
dotnet user-secrets init --project backend/WebAPIs/WebAPIs.csproj

dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost;Database=ClothingStoreDb;Trusted_Connection=True;TrustServerCertificate=True;" --project backend/WebAPIs/WebAPIs.csproj

dotnet user-secrets set "JwtSettings:Key" "your-local-secret-at-least-32-characters" --project backend/WebAPIs/WebAPIs.csproj
```

### Các cấu hình backend

| Tên cấu hình | Bắt buộc | Mục đích |
| --- | --- | --- |
| `ConnectionStrings__DefaultConnection` | Có | Connection string SQL Server/Azure SQL |
| `JwtSettings__Key` | Có | Khóa ký JWT, nên dài và ngẫu nhiên |
| `JwtSettings__Issuer` | Có | JWT issuer |
| `JwtSettings__Audience` | Có | JWT audience |
| `JwtSettings__DurationInMinutes` | Có | Thời hạn token |
| `Cors__AllowedOrigins__0` | Có khi deploy | Domain frontend được phép gọi API |
| `Vnpay__TmnCode` | Khi dùng VNPay | Mã merchant VNPay |
| `Vnpay__HashSecret` | Khi dùng VNPay | Secret ký giao dịch VNPay |
| `Vnpay__BaseUrl` | Khi dùng VNPay | URL sandbox hoặc production VNPay |
| `Vnpay__PaymentBackReturnUrl` | Khi dùng VNPay | URL frontend nhận kết quả thanh toán |
| `GeminiAI__ApiKey` | Khi dùng chatbot AI | API key Gemini |
| `GeminiAI__ModelName` | Khi dùng chatbot AI | Tên model Gemini |
| `EmailSettings__SmtpServer` | Khi gửi email | SMTP server |
| `EmailSettings__Port` | Khi gửi email | SMTP port |
| `EmailSettings__SenderEmail` | Khi gửi email | Email gửi đi |
| `EmailSettings__Username` | Khi gửi email | SMTP username |
| `EmailSettings__Password` | Khi gửi email | SMTP password/app password |

Ví dụ cấu hình production trên host:

```text
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=Server=tcp:your-server.database.windows.net,1433;Initial Catalog=ClothingStoreDb;User ID=your-user;Password=your-password;Encrypt=True;TrustServerCertificate=False;
JwtSettings__Key=replace-with-a-long-random-secret
JwtSettings__Issuer=ClothingStoreApp
JwtSettings__Audience=ClothingStoreUser
JwtSettings__DurationInMinutes=60
Cors__AllowedOrigins__0=https://your-store.vercel.app
Vnpay__PaymentBackReturnUrl=https://your-store.vercel.app/payment-callback
```

> Không dùng `Trusted_Connection=True`, `localhost` hoặc SQL Server instance trên máy cá nhân khi backend chạy trên cloud.

## Database và migration

Ứng dụng dùng Entity Framework Core với SQL Server. Migration hiện có trong:

```text
backend/Infrastructure/Migrations/
```

Khi backend khởi động, `Program.cs` thực hiện:

1. `Database.MigrateAsync()` để áp dụng migration.
2. `DbSeeder.SeedAsync()` để tạo dữ liệu khởi tạo nếu database còn trống.
3. Huấn luyện mô hình Apriori khi có thể.

### Tạo migration mới

Nếu thay đổi entity hoặc cấu hình database:

```powershell
dotnet ef migrations add TenMigration `
  --project backend/Infrastructure/Infrastructure.csproj `
  --startup-project backend/WebAPIs/WebAPIs.csproj `
  --output-dir Migrations
```

Trên PowerShell, nếu lệnh nhiều dòng gây lỗi, chạy trên một dòng:

```powershell
dotnet ef migrations add TenMigration --project backend/Infrastructure/Infrastructure.csproj --startup-project backend/WebAPIs/WebAPIs.csproj --output-dir Migrations
```

Áp dụng migration thủ công:

```powershell
dotnet ef database update `
  --project backend/Infrastructure/Infrastructure.csproj `
  --startup-project backend/WebAPIs/WebAPIs.csproj
```

### Dữ liệu seed

Seeder tạo một số vai trò, tài khoản quản trị, danh mục và sản phẩm mẫu khi các bảng tương ứng chưa có dữ liệu.

Trước production nên:

- Đổi mật khẩu tài khoản quản trị mặc định.
- Không dùng dữ liệu mẫu trong môi trường thật nếu không cần.
- Backup database trước khi migration.
- Kiểm tra quyền database của user deploy.

## Tài khoản mặc định

Seeder hiện có tài khoản phát triển:

```text
Username: admin
Password: 123456
```

Đây chỉ là tài khoản local/development. Phải đổi mật khẩu hoặc xóa tài khoản này trước khi public hệ thống.

## API và SignalR

### REST API

Base URL:

```text
/api/v1
```

Một số nhóm endpoint chính:

| Nhóm | Ví dụ |
| --- | --- |
| Auth | `/api/v1/Auth/Login`, `/api/v1/Auth/Register` |
| Sản phẩm | `/api/v1/SanPham`, `/api/v1/SanPham/{id}` |
| Biến thể | `/api/v1/SanPhamChiTiet/...` |
| Danh mục | `/api/v1/DanhMuc/...` |
| Giỏ hàng | `/api/v1/GioHang`, `/api/v1/GioHangChiTiet/...` |
| Đơn hàng | `/api/v1/DonHang/...` |
| Thanh toán | `/api/v1/Payment/...` |
| Chat | `/api/v1/chat/...` |
| Người dùng | `/api/v1/NguoiDung/...` |
| Thống kê | `/api/v1/ThongKe/...` |
| Voucher | `/api/v1/MaGiamGia/...` |
| Yêu thích | `/api/v1/YeuThich/...` |

Swagger chỉ được bật khi `ASPNETCORE_ENVIRONMENT=Development`.

### Xác thực JWT

Frontend lưu token sau khi đăng nhập và tự động gửi header:

```http
Authorization: Bearer <token>
```

Các request cần quyền sẽ trả về `401` nếu token hết hạn hoặc không hợp lệ. Frontend sẽ xóa session local và chuyển người dùng về `/login`.

### SignalR

Hub chat:

```text
/chatHub
```

Frontend sử dụng token JWT khi kết nối. Backend hỗ trợ token qua query string `access_token` cho SignalR.

Khi deploy:

- Backend host phải hỗ trợ WebSocket.
- CORS phải cho phép domain frontend.
- Proxy/reverse proxy phải chuyển tiếp WebSocket upgrade.
- Nếu SignalR không kết nối được, frontend có polling fallback cho một số dữ liệu chat.

## Deploy frontend lên Vercel

Có hai cách được repository hỗ trợ.

### Cách 1: Deploy từ root repository

Giữ Vercel Root Directory mặc định là root repository. File `vercel.json` ở root đã khai báo:

```json
{
  "buildCommand": "npm --prefix frontend run build",
  "installCommand": "npm --prefix frontend install",
  "outputDirectory": "frontend/dist"
}
```

Trên Vercel, thêm Environment Variable:

```text
VITE_API_BASE_URL=https://your-backend-domain.example.com
```

### Cách 2: Đặt Root Directory là `frontend`

Trong Vercel Project Settings:

- Root Directory: `frontend`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

File `frontend/vercel.json` đã có rewrite SPA về `index.html`.

### Sau khi deploy frontend

Kiểm tra trực tiếp:

```text
https://your-store.vercel.app/
https://your-store.vercel.app/shop
https://your-store.vercel.app/login
https://your-store.vercel.app/payment-callback
```

Nếu refresh ở route con trả về 404, kiểm tra lại Root Directory và rewrite trong Vercel.

## Deploy backend

Vercel không phải môi trường phù hợp để chạy ASP.NET Core API lâu dài. Backend cần chạy trên một host hỗ trợ .NET, ví dụ:

- Azure App Service.
- Railway.
- Render.
- VPS chạy Docker/systemd/IIS.
- Một dịch vụ cloud khác hỗ trợ ASP.NET Core và WebSocket.

### Quy trình tổng quát

1. Tạo SQL Server cloud hoặc Azure SQL.
2. Cho phép backend host truy cập database.
3. Deploy project `backend/WebAPIs` hoặc publish solution.
4. Cấu hình các biến môi trường backend.
5. Thêm domain Vercel vào `Cors:AllowedOrigins`.
6. Bật WebSocket cho SignalR.
7. Kiểm tra endpoint API và `/chatHub`.
8. Cập nhật `VITE_API_BASE_URL` trên Vercel.
9. Redeploy frontend sau khi đổi biến `VITE_`.

### Publish bằng dotnet CLI

```powershell
dotnet restore backend/ClothingStore.sln
dotnet build backend/ClothingStore.sln --configuration Release
dotnet publish backend/WebAPIs/WebAPIs.csproj --configuration Release --output publish
```

Host cần chạy file publish của project `WebAPIs` và cung cấp biến môi trường production.

## Checklist production

### Frontend

- [ ] Vercel Root Directory và output directory đúng.
- [ ] `VITE_API_BASE_URL` trỏ tới backend public, không trỏ `localhost`.
- [ ] Đã redeploy sau khi thay đổi environment variable.
- [ ] Refresh các route `/shop`, `/login`, `/admin` không bị 404.
- [ ] Đăng nhập và đăng xuất hoạt động.
- [ ] API không báo lỗi CORS trên browser.
- [ ] Ảnh sản phẩm và ảnh avatar tải được.
- [ ] SignalR chat kết nối được hoặc fallback hoạt động.
- [ ] Callback VNPay quay về đúng domain.

### Backend

- [ ] `ASPNETCORE_ENVIRONMENT=Production`.
- [ ] Connection string trỏ database cloud.
- [ ] JWT key dài, ngẫu nhiên và không nằm trong Git.
- [ ] `Cors:AllowedOrigins` chứa đúng domain frontend.
- [ ] VNPay đã dùng đúng sandbox hoặc production credentials.
- [ ] Gemini API key đã được cấu hình nếu bật chatbot.
- [ ] SMTP credentials đã được cấu hình nếu dùng email.
- [ ] WebSocket đã bật.
- [ ] Database migration chạy thành công.
- [ ] Không còn placeholder `YOUR_...` trong môi trường production.
- [ ] Đã đổi tài khoản admin mặc định.
- [ ] Đã cấu hình logging và monitoring.

### Database và file storage

- [ ] Database đã backup.
- [ ] User database có quyền tối thiểu cần thiết.
- [ ] Không lưu file upload quan trọng trên filesystem tạm của host.
- [ ] Cân nhắc Cloudinary, S3, Azure Blob Storage hoặc dịch vụ object storage cho avatar và ảnh sản phẩm.

## Kiểm tra trước khi push

Chạy từ root repository:

```powershell
# Kiểm tra thay đổi và file chưa track
git status --short

# Kiểm tra whitespace trong diff
git diff --check

# Build frontend
npm --prefix frontend run build

# Lint frontend
npm --prefix frontend run lint

# Build backend
dotnet build backend/ClothingStore.sln --configuration Release
```

Lint hiện có thể báo lỗi tồn tại ở một số component cũ. `npm run build` vẫn là kiểm tra bắt buộc cho Vercel; nên xử lý toàn bộ lỗi lint trước khi coi bản phát hành là sạch hoàn toàn.

## Xử lý lỗi thường gặp

### Frontend gọi nhầm localhost sau khi deploy

Kiểm tra `VITE_API_BASE_URL` trong Vercel. Sau khi sửa biến, phải redeploy vì Vite nhúng biến môi trường vào bundle lúc build.

### Lỗi CORS

Kiểm tra:

1. Domain frontend có đúng tuyệt đối trong `Cors:AllowedOrigins` không.
2. Có thừa dấu `/` cuối domain không.
3. Backend đã đọc đúng biến `Cors__AllowedOrigins__0` chưa.
4. Request có đi đúng backend domain không.

### SignalR không kết nối

Kiểm tra:

- URL hub là `https://backend-domain/chatHub`, không phải `.../api/v1/chatHub`.
- Host đã bật WebSocket chưa.
- Reverse proxy có chuyển WebSocket không.
- CORS có `AllowCredentials()` và origin chính xác không.
- JWT token còn hợp lệ không.

### Backend không khởi động

Xem log và kiểm tra:

- SQL Server có truy cập được không.
- Connection string có đúng cú pháp không.
- JWT key có tồn tại không.
- Host có chạy đúng .NET 9 không.
- Migration có lỗi do database permission hoặc schema cũ không.

### VNPay trả về sai trang

Kiểm tra `Vnpay__PaymentBackReturnUrl`. Giá trị phải là URL frontend public, ví dụ:

```text
https://your-store.vercel.app/payment-callback
```

Không dùng `http://localhost:5173/payment-callback` trên production.

### Ảnh upload mất sau khi restart

Filesystem trên nhiều host cloud là tạm thời hoặc không dùng chung giữa các instance. Dùng object storage và lưu URL ảnh trong database.

## Bảo mật

- Không commit `.env`, password, JWT secret, Gemini key, SMTP password hoặc VNPay hash secret.
- Không dùng tài khoản admin mặc định trên môi trường public.
- Không bật các route debug/test trong production.
- Chỉ cho phép các origin frontend cần thiết trong CORS.
- Dùng HTTPS cho frontend, backend và callback thanh toán.
- Dùng database user riêng cho production.
- Xoay vòng secret ngay nếu từng bị commit vào Git hoặc xuất hiện trong log.
- Không hiển thị JWT trong giao diện, log production hoặc response debug.
- Giới hạn quyền truy cập Swagger; hiện Swagger chỉ bật trong Development.

## Trạng thái kiểm tra hiện tại

Các kiểm tra deploy chính:

- Frontend Vite production build: đạt.
- Backend solution build: đạt, có thể còn cảnh báo nullable ở một số code chat hiện hữu.
- SPA rewrite cho Vercel: đã cấu hình.
- URL REST và SignalR: đã chuẩn hóa qua `frontend/src/api/apiConfig.js`.
- Log, build output và upload local: đã được thêm vào `.gitignore`.

## License

Chưa khai báo license riêng cho repository này. Nếu dự án được phân phối công khai, hãy bổ sung license phù hợp trước khi phát hành.
