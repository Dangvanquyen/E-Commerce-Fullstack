using Application.DTOs.Requests;
using Application.DTOs.Responses;

namespace Application.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<ApiResponse<string>> ChangePasswordAsync(int userId, ChangePasswordRequest request);
        Task<ApiResponse<string>> ForgotPasswordAsync(ForgotPasswordRequest request);
        Task<ApiResponse<string>> ResetPasswordAsync(ResetPasswordRequest request);
    }
}
