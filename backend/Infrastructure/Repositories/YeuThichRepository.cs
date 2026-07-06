using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.DataAccess;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class YeuThichRepository : GenericRepository<YeuThich>, IYeuThichRepository
    {
        public YeuThichRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<YeuThich>> GetByNguoiDungIdAsync(int nguoiDungId)
        {
            return await _dbSet
                .Where(y => y.NguoiDungId == nguoiDungId)
                .Include(y => y.SanPham)
                    .ThenInclude(s => s.SanPhamChiTiets)
                .OrderByDescending(y => y.NgayThem)
                .ToListAsync();
        }

        public async Task<YeuThich?> GetByNguoiDungAndSanPhamAsync(int nguoiDungId, int sanPhamId)
        {
            return await _dbSet
                .FirstOrDefaultAsync(y => y.NguoiDungId == nguoiDungId && y.SanPhamId == sanPhamId);
        }

        public async Task<bool> IsInWishlistAsync(int nguoiDungId, int sanPhamId)
        {
            return await _dbSet
                .AnyAsync(y => y.NguoiDungId == nguoiDungId && y.SanPhamId == sanPhamId);
        }
    }
}
