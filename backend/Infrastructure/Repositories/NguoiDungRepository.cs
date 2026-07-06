using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.DataAccess;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class NguoiDungRepository : GenericRepository<NguoiDung>, INguoiDungRepository
    {
        public NguoiDungRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<NguoiDung?> GetByEmailAsync(string email)
        {
            return await _dbSet
                .FirstOrDefaultAsync(n => n.Email == email);
        }

        public async Task<NguoiDung?> GetByTenDangNhapAsync(string tenDangNhap)
        {
            return await _dbSet
                .FirstOrDefaultAsync(n => n.TenDangNhap == tenDangNhap);
        }

        public async Task<NguoiDung?> GetNguoiDungWithVaiTroAsync(int nguoiDungId)
        {
            return await _dbSet
                .Include(n => n.VaiTro)
                .FirstOrDefaultAsync(n => n.NguoiDungId == nguoiDungId);
        }

        public async Task<NguoiDung?> GetNguoiDungWithGioHangAsync(int nguoiDungId)
        {
            return await _dbSet
                .Include(n => n.GioHang)
                    .ThenInclude(g => g.GioHangChiTiets)
                        .ThenInclude(c => c.SanPhamChiTiet)
                            .ThenInclude(s => s.SanPham)
                .FirstOrDefaultAsync(n => n.NguoiDungId == nguoiDungId);
        }

        public async Task<NguoiDung?> GetNguoiDungWithDonHangsAsync(int nguoiDungId)
        {
            return await _dbSet
                .Include(n => n.DonHangs)
                    .ThenInclude(d => d.DonHangChiTiets)
                .FirstOrDefaultAsync(n => n.NguoiDungId == nguoiDungId);
        }

        public async Task<IEnumerable<NguoiDung>> GetNguoiDungsByVaiTroAsync(int vaiTroId)
        {
            return await _dbSet
                .Where(n => n.VaiTroId == vaiTroId)
                .ToListAsync();
        }

        public async Task<bool> IsEmailExistsAsync(string email)
        {
            return await _dbSet.AnyAsync(n => n.Email == email);
        }

        public async Task<bool> IsTenDangNhapExistsAsync(string tenDangNhap)
        {
            return await _dbSet.AnyAsync(n => n.TenDangNhap == tenDangNhap);
        }
    }
}
