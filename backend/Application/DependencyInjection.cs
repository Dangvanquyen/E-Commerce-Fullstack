using Application.Mappings;
using Application.Services;
using Application.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services, IConfiguration configuration)
        {
            // AutoMapper
            services.AddAutoMapper(typeof(MappingProfile));

            // Auth Service
            services.AddScoped<IAuthService, AuthService>();

            // Email Service
            services.AddScoped<IEmailService, SmtpEmailService>();

            // Business Services
            services.AddScoped<IVaiTroService, VaiTroService>();
            services.AddScoped<INguoiDungService, NguoiDungService>();
            services.AddScoped<IDanhMucService, DanhMucService>();
            services.AddScoped<ISanPhamService, SanPhamService>();
            services.AddScoped<ISanPhamChiTietService, SanPhamChiTietService>();
            services.AddScoped<IGioHangService, GioHangService>();
            services.AddScoped<IGioHangChiTietService, GioHangChiTietService>();
            services.AddScoped<IDonHangService, DonHangService>();
            services.AddScoped<IDonHangChiTietService, DonHangChiTietService>();
            services.AddScoped<IThanhToanService, ThanhToanService>();
            services.AddScoped<IYeuThichService, YeuThichService>();
            services.AddScoped<IChatService, ChatService>();
            services.AddScoped<IVnPayService, VnPayService>();
            services.AddScoped<IThongKeService, ThongKeService>();
            services.AddScoped<IAiChatService, AiChatService>();
            services.AddScoped<IThongBaoService, ThongBaoService>();
            services.AddScoped<IMaGiamGiaService, MaGiamGiaService>();

            // Caching
            services.AddMemoryCache();

            // HttpClient for Gemini AI
            services.AddHttpClient("GeminiAI", client =>
            {
                client.Timeout = TimeSpan.FromSeconds(30);
            });

            return services;
        }
    }
}
