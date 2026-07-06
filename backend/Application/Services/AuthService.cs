using Application.DTOs.Requests;
using Application.DTOs.Responses;
using Application.Services.Interfaces;
using AutoMapper;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;
        private readonly IMemoryCache _cache;
        private readonly IEmailService _emailService;

        public AuthService(IUnitOfWork unitOfWork, IMapper mapper, IConfiguration configuration, IMemoryCache cache, IEmailService emailService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _configuration = configuration;
            _cache = cache;
            _emailService = emailService;
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            // 1. Lấy thông tin User từ Database
            var nguoiDung = await _unitOfWork.NguoiDung.GetByTenDangNhapAsync(request.TenDangNhap);

            // 2. Kiểm tra User có tồn tại không
            if (nguoiDung == null)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Tên đăng nhập không tồn tại"
                };
            }

            // 3. Kiểm tra Mật khẩu (So sánh chuỗi đơn giản)
            if (nguoiDung.MatKhau != request.MatKhau)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Mật khẩu không đúng"
                };
            }

            // 4. Kiểm tra trạng thái hoạt động
            if (!nguoiDung.TrangThai)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Tài khoản đã bị khóa"
                };
            }

            // 5. Tạo Token
            var token = GenerateJwtToken(nguoiDung);
            var expiration = DateTime.UtcNow.AddMinutes(
                int.Parse(_configuration["JwtSettings:DurationInMinutes"]!));

            // --- XỬ LÝ GÁN TÊN VAI TRÒ THỦ CÔNG ---
            // Vì repository chưa include bảng VaiTro, nên ta tự check ID để lấy tên
            string tenVaiTro = "User"; // Mặc định là User/Customer
            if (nguoiDung.VaiTroId == 1)
            {
                tenVaiTro = "Admin";
            }
            // --------------------------------------

            // 6. Tạo kết quả trả về
            var response = new AuthResponse
            {
                Success = true,
                Message = "Đăng nhập thành công",
                Token = token,
                Expiration = expiration,

                // 👇 QUAN TRỌNG 1: Gán thủ công ID để Frontend nhận diện (Sửa lỗi nhận số 0)
                VaiTroId = nguoiDung.VaiTroId,

                // Map toàn bộ object User sang DTO
                NguoiDung = _mapper.Map<NguoiDungResponse>(nguoiDung)
            };

            // 👇 QUAN TRỌNG 2: Gán thủ công Tên Vai Trò để hiển thị đẹp
            if (response.NguoiDung != null)
            {
                response.NguoiDung.VaiTroTen = tenVaiTro;
            }

            return response;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            // Check username trùng
            var existingUser = await _unitOfWork.NguoiDung.GetByTenDangNhapAsync(request.TenDangNhap);
            if (existingUser != null)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Tên đăng nhập đã tồn tại"
                };
            }

            // Check email trùng
            var existingEmail = await _unitOfWork.NguoiDung.GetByEmailAsync(request.Email);
            if (existingEmail != null)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Email đã được sử dụng"
                };
            }

            // Map request sang entity
            var nguoiDung = _mapper.Map<NguoiDung>(request);
            nguoiDung.NgayTao = DateTime.Now;
            nguoiDung.TrangThai = true;
            nguoiDung.VaiTroId = 2; // Mặc định đăng ký mới là Customer (User)

            // Lưu vào DB
            await _unitOfWork.NguoiDung.AddAsync(nguoiDung);
            await _unitOfWork.SaveChangesAsync();

            // Tạo token đăng nhập luôn cho tiện
            var token = GenerateJwtToken(nguoiDung);
            var expiration = DateTime.UtcNow.AddMinutes(
                int.Parse(_configuration["JwtSettings:DurationInMinutes"]!));

            var response = new AuthResponse
            {
                Success = true,
                Message = "Đăng ký thành công",
                Token = token,
                Expiration = expiration,

                // Gán ID thủ công
                VaiTroId = nguoiDung.VaiTroId,

                NguoiDung = _mapper.Map<NguoiDungResponse>(nguoiDung)
            };

            // Gán tên thủ công (Mới đăng ký thì chắc chắn là User rồi)
            if (response.NguoiDung != null)
            {
                response.NguoiDung.VaiTroTen = "User";
            }

            return response;
        }

        public async Task<ApiResponse<string>> ChangePasswordAsync(int userId, ChangePasswordRequest request)
        {
            // Lấy thông tin user
            var nguoiDung = await _unitOfWork.NguoiDung.GetByIdAsync(userId);
            if (nguoiDung == null)
            {
                return ApiResponse<string>.ErrorResponse("Người dùng không tồn tại");
            }

            // Kiểm tra mật khẩu hiện tại
            if (nguoiDung.MatKhau != request.CurrentPassword)
            {
                return ApiResponse<string>.ErrorResponse("Mật khẩu hiện tại không đúng");
            }

            // Kiểm tra mật khẩu mới không trùng mật khẩu cũ
            if (request.CurrentPassword == request.NewPassword)
            {
                return ApiResponse<string>.ErrorResponse("Mật khẩu mới phải khác mật khẩu hiện tại");
            }

            // Cập nhật mật khẩu mới
            nguoiDung.MatKhau = request.NewPassword;
            _unitOfWork.NguoiDung.Update(nguoiDung);
            await _unitOfWork.SaveChangesAsync();

            return ApiResponse<string>.SuccessResponse("", "Đổi mật khẩu thành công");
        }

        private string GenerateJwtToken(NguoiDung nguoiDung)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Xác định tên Role để nhét vào Token
            var roleName = nguoiDung.VaiTroId == 1 ? "Admin" : "Customer";

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, nguoiDung.NguoiDungId.ToString()),
                new Claim(ClaimTypes.Name, nguoiDung.TenDangNhap),
                new Claim(ClaimTypes.Email, nguoiDung.Email ?? string.Empty),
                new Claim(ClaimTypes.Role, roleName) // Lưu role vào token luôn
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(int.Parse(jwtSettings["DurationInMinutes"]!)),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<ApiResponse<string>> ForgotPasswordAsync(ForgotPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return ApiResponse<string>.ErrorResponse("Vui lòng nhập Email");
            }

            // 1. Kiểm tra Email có tồn tại trong hệ thống không
            var user = await _unitOfWork.NguoiDung.GetByEmailAsync(request.Email);
            if (user == null)
            {
                return ApiResponse<string>.ErrorResponse("Email này chưa được đăng ký trong hệ thống");
            }

            // 2. Tạo mã xác nhận ngẫu nhiên (6 chữ số)
            var random = new Random();
            var code = random.Next(100000, 999999).ToString();

            // 3. Lưu mã xác nhận vào cache với thời gian hết hạn (5 phút)
            var cacheKey = $"ResetPasswordCode_{request.Email}";
            _cache.Set(cacheKey, code, TimeSpan.FromMinutes(5));

            // 4. Gửi email
            var subject = "Mã xác nhận đặt lại mật khẩu - FashionStore";
            var body = $@"
                <div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px; max-width: 600px;'>
                    <h2 style='color: #e53e3e;'>Yêu cầu đặt lại mật khẩu</h2>
                    <p>Chào <strong>{user.HoTen}</strong>,</p>
                    <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu từ tài khoản của bạn.</p>
                    <p>Mã xác nhận khôi phục mật khẩu của bạn là:</p>
                    <div style='background-color: #f7fafc; padding: 15px; text-align: center; border-radius: 4px; border: 1px dashed #cbd5e0; margin: 20px 0;'>
                        <span style='font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #2d3748;'>{code}</span>
                    </div>
                    <p style='color: #718096; font-size: 14px;'>Mã xác nhận này sẽ hết hạn trong vòng 5 phút.</p>
                    <hr style='border: none; border-top: 1px solid #edf2f7; margin: 20px 0;' />
                    <p style='color: #a0aec0; font-size: 12px;'>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
                </div>";

            try
            {
                await _emailService.SendEmailAsync(request.Email, subject, body);
                return ApiResponse<string>.SuccessResponse("", "Mã xác nhận đã được gửi đến email của bạn.");
            }
            catch (Exception ex)
            {
                return ApiResponse<string>.ErrorResponse($"Không thể gửi email. Chi tiết: {ex.Message}");
            }
        }

        public async Task<ApiResponse<string>> ResetPasswordAsync(ResetPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return ApiResponse<string>.ErrorResponse("Vui lòng nhập Email");
            }
            if (string.IsNullOrWhiteSpace(request.Code))
            {
                return ApiResponse<string>.ErrorResponse("Vui lòng nhập mã xác nhận");
            }
            if (string.IsNullOrWhiteSpace(request.NewPassword))
            {
                return ApiResponse<string>.ErrorResponse("Vui lòng nhập mật khẩu mới");
            }

            // 1. Kiểm tra mã xác nhận trong cache
            var cacheKey = $"ResetPasswordCode_{request.Email}";
            if (!_cache.TryGetValue(cacheKey, out string? cachedCode) || cachedCode != request.Code)
            {
                return ApiResponse<string>.ErrorResponse("Mã xác nhận không đúng hoặc đã hết hạn");
            }

            // 2. Tìm người dùng
            var user = await _unitOfWork.NguoiDung.GetByEmailAsync(request.Email);
            if (user == null)
            {
                return ApiResponse<string>.ErrorResponse("Người dùng không tồn tại");
            }

            // 3. Đổi mật khẩu
            user.MatKhau = request.NewPassword;
            _unitOfWork.NguoiDung.Update(user);
            await _unitOfWork.SaveChangesAsync();

            // 4. Xóa mã trong cache
            _cache.Remove(cacheKey);

            return ApiResponse<string>.SuccessResponse("", "Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.");
        }
    }
}