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
    public class GioHangRepository : GenericRepository<GioHang>, IGioHangRepository
    {
        public GioHangRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<GioHang?> GetGioHangByNguoiDungAsync(int nguoiDungId)
        {
            return await _dbSet
                .FirstOrDefaultAsync(g => g.NguoiDungId == nguoiDungId);
        }

        public async Task<GioHang?> GetGioHangWithChiTietsAsync(int gioHangId)
        {
            return await _dbSet
                .Include(g => g.GioHangChiTiets)
                .FirstOrDefaultAsync(g => g.GioHangId == gioHangId);
        }

        public async Task<GioHang?> GetGioHangFullInfoAsync(int nguoiDungId)
        {
            return await _dbSet
                .Include(g => g.GioHangChiTiets)
                    .ThenInclude(c => c.SanPhamChiTiet)
                        .ThenInclude(s => s.SanPham)
                            .ThenInclude(p => p.DanhMuc)
                .FirstOrDefaultAsync(g => g.NguoiDungId == nguoiDungId);
        }

        public async Task<IEnumerable<GioHang>> GetAllNonEmptyCartsAsync()
        {
            return await _dbSet
                .Include(g => g.NguoiDung)
                .Include(g => g.GioHangChiTiets)
                    .ThenInclude(c => c.SanPhamChiTiet)
                        .ThenInclude(s => s.SanPham)
                            .ThenInclude(p => p.DanhMuc)
                .Where(g => g.GioHangChiTiets.Any())
                .OrderByDescending(g => g.NgayTao)
                .ToListAsync();
        }
    }
}
