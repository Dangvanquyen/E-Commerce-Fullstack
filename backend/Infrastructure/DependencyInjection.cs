using Application.Services.Interfaces;
using Domain.Interfaces;
using Infrastructure.DataAccess;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            // Database
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

            // Unit of Work
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            // Repositories
            services.AddScoped<IVaiTroRepository, VaiTroRepository>();
            services.AddScoped<INguoiDungRepository, NguoiDungRepository>();
            services.AddScoped<IDanhMucRepository, DanhMucRepository>();
            services.AddScoped<ISanPhamRepository, SanPhamRepository>();
            services.AddScoped<ISanPhamChiTietRepository, SanPhamChiTietRepository>();
            services.AddScoped<IGioHangRepository, GioHangRepository>();
            services.AddScoped<IGioHangChiTietRepository, GioHangChiTietRepository>();
            services.AddScoped<IDonHangRepository, DonHangRepository>();
            services.AddScoped<IDonHangChiTietRepository, DonHangChiTietRepository>();
            services.AddScoped<IThanhToanRepository, ThanhToanRepository>();
            services.AddScoped<IThongKeRepository, ThongKeRepository>();
            services.AddScoped<IThongBaoRepository, ThongBaoRepository>();
            services.AddScoped<IMaGiamGiaRepository, MaGiamGiaRepository>();

            // Apriori Recommendation Service
            services.AddScoped<IAprioriRecommendationService, Infrastructure.Services.AprioriRecommendationService>();

            return services;
        }
    }
}