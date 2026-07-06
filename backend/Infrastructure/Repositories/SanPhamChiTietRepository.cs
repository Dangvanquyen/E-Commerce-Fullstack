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
    public class SanPhamChiTietRepository : GenericRepository<SanPhamChiTiet>, ISanPhamChiTietRepository
    {
        public SanPhamChiTietRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<SanPhamChiTiet?> GetChiTietWithSanPhamAsync(int sanPhamChiTietId)
        {
            return await _dbSet
                .Include(c => c.SanPham)
                    .ThenInclude(s => s.DanhMuc)
                .FirstOrDefaultAsync(c => c.SanPhamChiTietId == sanPhamChiTietId);
        }

        public async Task<IEnumerable<SanPhamChiTiet>> GetChiTietsBySanPhamAsync(int sanPhamId)
        {
            return await _dbSet
                .Where(c => c.SanPhamId == sanPhamId)
                .ToListAsync();
        }

        public async Task<SanPhamChiTiet?> GetBySizeAndMauSacAsync(int sanPhamId, string size, string mauSac)
        {
            return await _dbSet
                .FirstOrDefaultAsync(c => c.SanPhamId == sanPhamId 
                    && c.Size == size 
                    && c.MauSac == mauSac);
        }

        public async Task<IEnumerable<SanPhamChiTiet>> GetAvailableChiTietsAsync(int sanPhamId)
        {
            return await _dbSet
                .Where(c => c.SanPhamId == sanPhamId && c.SoLuongTon > 0)
                .ToListAsync();
        }

        public async Task<bool> UpdateSoLuongTonAsync(int sanPhamChiTietId, int soLuong)
        {
            var chiTiet = await _dbSet.FindAsync(sanPhamChiTietId);
            if (chiTiet == null)
                return false;

            chiTiet.SoLuongTon = soLuong;
            return true;
        }

        public async Task<(IEnumerable<SanPhamChiTiet> Items, int TotalCount)> GetPagedInventoryAsync(
            string? searchTerm, int? danhMucId, string? stockStatus, int pageNumber, int pageSize)
        {
            var query = _dbSet
                .Include(c => c.SanPham)
                    .ThenInclude(s => s.DanhMuc)
                .AsQueryable();

            if (!string.IsNullOrEmpty(searchTerm))
            {
                var lowerSearch = searchTerm.ToLower();
                query = query.Where(c => c.SanPham.TenSanPham.ToLower().Contains(lowerSearch)
                                      || c.MauSac.ToLower().Contains(lowerSearch)
                                      || c.Size.ToLower().Contains(lowerSearch));
            }

            if (danhMucId.HasValue)
            {
                query = query.Where(c => c.SanPham.DanhMucId == danhMucId.Value);
            }

            if (!string.IsNullOrEmpty(stockStatus))
            {
                switch (stockStatus.ToLower())
                {
                    case "out_of_stock":
                        query = query.Where(c => c.SoLuongTon == 0);
                        break;
                    case "low_stock":
                        query = query.Where(c => c.SoLuongTon > 0 && c.SoLuongTon <= 10);
                        break;
                    case "in_stock":
                        query = query.Where(c => c.SoLuongTon > 10);
                        break;
                }
            }

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderBy(c => c.SanPham.TenSanPham)
                .ThenBy(c => c.Size)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }
    }
}
