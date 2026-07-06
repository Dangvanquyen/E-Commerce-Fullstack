using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace Infrastructure.DataAccess
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<VaiTro> VaiTro { get; set; }
        public DbSet<NguoiDung> NguoiDung { get; set; }
        public DbSet<DanhMuc> DanhMuc { get; set; }
        public DbSet<SanPham> SanPham { get; set; }
        public DbSet<SanPhamChiTiet> SanPhamChiTiet { get; set; }
        public DbSet<GioHang> GioHang { get; set; }
        public DbSet<GioHangChiTiet> GioHangChiTiet { get; set; }
        public DbSet<DonHang> DonHang { get; set; }
        public DbSet<DonHangChiTiet> DonHangChiTiet { get; set; }
        public DbSet<ThanhToan> ThanhToan { get; set; }
        public DbSet<YeuThich> YeuThich { get; set; }
        public DbSet<ChatRoom> ChatRooms { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<LichSuXemSanPham> LichSuXemSanPham { get; set; }
        public DbSet<ThongBao> ThongBao { get; set; }
        public DbSet<MaGiamGia> MaGiamGia { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        }
    }
}
