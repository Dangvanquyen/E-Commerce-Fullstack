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
    public class SanPhamRepository : GenericRepository<SanPham>, ISanPhamRepository
    {
        public SanPhamRepository(AppDbContext context) : base(context)
        {
        }

        
        public override async Task<(IEnumerable<SanPham> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize)
        {
            var totalCount = await _dbSet.CountAsync(); 
            var items = await _dbSet
                .Include(s => s.DanhMuc)
                .Include(s => s.SanPhamChiTiets)
                .OrderByDescending(s => s.NgayTao)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<SanPham?> GetSanPhamWithChiTietAsync(int sanPhamId)
        {
            return await _dbSet
                .Include(s => s.SanPhamChiTiets)
                .FirstOrDefaultAsync(s => s.SanPhamId == sanPhamId);
        }

        public async Task<SanPham?> GetSanPhamWithDanhMucAsync(int sanPhamId)
        {
            return await _dbSet
                .Include(s => s.DanhMuc)
                .FirstOrDefaultAsync(s => s.SanPhamId == sanPhamId);
        }

        public async Task<SanPham?> GetSanPhamWithFullDetailsAsync(int sanPhamId)
        {
            return await _dbSet
                .Include(s => s.DanhMuc)
                .Include(s => s.SanPhamChiTiets)
                .FirstOrDefaultAsync(s => s.SanPhamId == sanPhamId);
        }

        public async Task<IEnumerable<SanPham>> GetSanPhamsByDanhMucAsync(int danhMucId)
        {
            return await _dbSet
                .Where(s => s.DanhMucId == danhMucId)
                .Include(s => s.SanPhamChiTiets)
                .ToListAsync();
        }

        public async Task<IEnumerable<SanPham>> GetActiveSanPhamsAsync()
        {
            return await _dbSet
                .Where(s => s.TrangThai)
                .Include(s => s.DanhMuc)
                .Include(s => s.SanPhamChiTiets)
                .ToListAsync();
        }

        public async Task<IEnumerable<SanPham>> SearchSanPhamsAsync(string keyword)
        {
            return await _dbSet
                .Where(s => EF.Functions.Collate(s.TenSanPham, "SQL_Latin1_General_CP1_CI_AI").Contains(keyword) 
                         || EF.Functions.Collate(s.MoTa, "SQL_Latin1_General_CP1_CI_AI").Contains(keyword))
                .Include(s => s.DanhMuc)
                .Include(s => s.SanPhamChiTiets)
                .ToListAsync();
        }

        public async Task<(IEnumerable<SanPham> Items, int TotalCount)> GetSanPhamsPagedByDanhMucAsync(
            int danhMucId, int pageNumber, int pageSize)
        {
            var query = _dbSet.Where(s => s.DanhMucId == danhMucId);
            var totalCount = await query.CountAsync();
            var items = await query
                .Include(s => s.SanPhamChiTiets)
                .OrderByDescending(s => s.NgayTao)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }
    }
}
