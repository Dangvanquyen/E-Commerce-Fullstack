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
    public class DanhMucRepository : GenericRepository<DanhMuc>, IDanhMucRepository
    {
        public DanhMucRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<DanhMuc?> GetByTenDanhMucAsync(string tenDanhMuc)
        {
            return await _dbSet
                .FirstOrDefaultAsync(d => d.TenDanhMuc == tenDanhMuc);
        }

        public async Task<DanhMuc?> GetDanhMucWithSanPhamsAsync(int danhMucId)
        {
            return await _dbSet
                .Include(d => d.SanPhams)
                    .ThenInclude(s => s.SanPhamChiTiets)
                .FirstOrDefaultAsync(d => d.DanhMucId == danhMucId);
        }

        public async Task<IEnumerable<DanhMuc>> GetActiveDanhMucsAsync()
        {
            return await _dbSet
                .Where(d => d.TrangThai)
                .ToListAsync();
        }
    }
}
