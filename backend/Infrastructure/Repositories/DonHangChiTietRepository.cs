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
    public class DonHangChiTietRepository : GenericRepository<DonHangChiTiet>, IDonHangChiTietRepository
    {
        public DonHangChiTietRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<DonHangChiTiet>> GetChiTietsByDonHangAsync(int donHangId)
        {
            return await _dbSet
                .Where(c => c.DonHangId == donHangId)
                .Include(c => c.SanPhamChiTiet)
                    .ThenInclude(s => s.SanPham)
                .ToListAsync();
        }

        public async Task<DonHangChiTiet?> GetChiTietWithSanPhamInfoAsync(int donHangChiTietId)
        {
            return await _dbSet
                .Include(c => c.SanPhamChiTiet)
                    .ThenInclude(s => s.SanPham)
                        .ThenInclude(p => p.DanhMuc)
                .FirstOrDefaultAsync(c => c.DonHangChiTietId == donHangChiTietId);
        }

        public async Task<decimal> GetTongTienByDonHangAsync(int donHangId)
        {
            return await _dbSet
                .Where(c => c.DonHangId == donHangId)
                .SumAsync(c => c.SoLuong * c.DonGia);
        }
    }
}
