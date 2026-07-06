using Domain.Entities;
using Infrastructure.DataAccess;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            if (!await context.VaiTro.AnyAsync())
            {
                await context.Database.ExecuteSqlRawAsync(@"
                    SET IDENTITY_INSERT [VaiTro] ON;
                    INSERT INTO [VaiTro] ([VaiTroId], [TenVaiTro], [MoTa]) VALUES
                        (1, N'Admin', N'Quản trị viên'),
                        (2, N'Customer', N'Khách hàng');
                    SET IDENTITY_INSERT [VaiTro] OFF;");
            }

            if (!await context.NguoiDung.AnyAsync(n => n.TenDangNhap == "admin"))
            {
                context.NguoiDung.Add(new NguoiDung
                {
                    TenDangNhap = "admin",
                    MatKhau = "123456",
                    HoTen = "Administrator",
                    Email = "admin@fashionstore.com",
                    SoDienThoai = "0900000000",
                    DiaChi = "",
                    TrangThai = true,
                    NgayTao = DateTime.Now,
                    VaiTroId = 1
                });
                await context.SaveChangesAsync();
            }
        }
    }
}
