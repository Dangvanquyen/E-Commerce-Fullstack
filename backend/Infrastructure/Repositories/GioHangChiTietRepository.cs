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
    public class GioHangChiTietRepository : GenericRepository<GioHangChiTiet>, IGioHangChiTietRepository
    {
        public GioHangChiTietRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<GioHangChiTiet?> GetChiTietByGioHangAndSanPhamAsync(int gioHangId, int sanPhamChiTietId)
        {
            return await _dbSet
                .FirstOrDefaultAsync(c => c.GioHangId == gioHangId 
                    && c.SanPhamChiTietId == sanPhamChiTietId);
        }

        public async Task<IEnumerable<GioHangChiTiet>> GetChiTietsByGioHangAsync(int gioHangId)
        {
            return await _dbSet
                .Where(c => c.GioHangId == gioHangId)
                .Include(c => c.SanPhamChiTiet)
                    .ThenInclude(s => s.SanPham)
                .ToListAsync();
        }

        public async Task<GioHangChiTiet?> GetChiTietWithSanPhamInfoAsync(int gioHangChiTietId)
        {
            return await _dbSet
                .Include(c => c.SanPhamChiTiet)
                    .ThenInclude(s => s.SanPham)
                        .ThenInclude(p => p.DanhMuc)
                .FirstOrDefaultAsync(c => c.GioHangChiTietId == gioHangChiTietId);
        }

        public async Task RemoveAllByGioHangAsync(int gioHangId)
        {
            var chiTiets = await _dbSet
                .Where(c => c.GioHangId == gioHangId)
                .ToListAsync();
            
            _dbSet.RemoveRange(chiTiets);
        }
    }
}
