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

            if (!await context.DanhMuc.AnyAsync())
            {
                context.DanhMuc.AddRange(new[]
                {
                    new DanhMuc { TenDanhMuc = "Áo Nam", MoTa = "Thời trang nam", TrangThai = true },
                    new DanhMuc { TenDanhMuc = "Quần Nam", MoTa = "Quần áo nam", TrangThai = true },
                    new DanhMuc { TenDanhMuc = "Áo Nữ", MoTa = "Thời trang nữ", TrangThai = true },
                    new DanhMuc { TenDanhMuc = "Quần Nữ", MoTa = "Quần áo nữ", TrangThai = true },
                    new DanhMuc { TenDanhMuc = "Phụ kiện", MoTa = "Phụ kiện thời trang", TrangThai = true }
                });
                await context.SaveChangesAsync();
            }

            if (!await context.SanPham.AnyAsync())
            {
                var danhMucs = await context.DanhMuc.ToDictionaryAsync(d => d.TenDanhMuc, d => d.DanhMucId);

                context.SanPham.AddRange(new[]
                {
                    new SanPham
                    {
                        TenSanPham = "Áo Polo Nam Classic",
                        MoTa = "Áo Polo nam chất liệu cotton mềm mịn, phù hợp mặc hàng ngày.",
                        Gia = 350000,
                        HinhAnh = "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
                        DanhMucId = danhMucs["Áo Nam"],
                        TrangThai = true,
                        NgayTao = DateTime.Now
                    },
                    new SanPham
                    {
                        TenSanPham = "Quần Jeans Nam Xanh",
                        MoTa = "Quần jeans nam form chuẩn, co giãn nhẹ, dễ phối đồ.",
                        Gia = 420000,
                        HinhAnh = "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
                        DanhMucId = danhMucs["Quần Nam"],
                        TrangThai = true,
                        NgayTao = DateTime.Now
                    },
                    new SanPham
                    {
                        TenSanPham = "Áo Thun Nữ Tay Dài",
                        MoTa = "Áo thun nữ form ôm nhẹ, vải thấm hút tốt, mặc thoải mái.",
                        Gia = 290000,
                        HinhAnh = "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
                        DanhMucId = danhMucs["Áo Nữ"],
                        TrangThai = true,
                        NgayTao = DateTime.Now
                    },
                    new SanPham
                    {
                        TenSanPham = "Quần Legging Nữ Đen",
                        MoTa = "Quần legging nữ co giãn 4 chiều, tôn dáng và dễ vận động.",
                        Gia = 330000,
                        HinhAnh = "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
                        DanhMucId = danhMucs["Quần Nữ"],
                        TrangThai = true,
                        NgayTao = DateTime.Now
                    },
                    new SanPham
                    {
                        TenSanPham = "Túi Đeo Chéo Thời Trang",
                        MoTa = "Túi đeo chéo unisex, thiết kế thời trang, tiện dụng.",
                        Gia = 280000,
                        HinhAnh = "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
                        DanhMucId = danhMucs["Phụ kiện"],
                        TrangThai = true,
                        NgayTao = DateTime.Now
                    }
                });
                await context.SaveChangesAsync();
            }
        }
    }
}
