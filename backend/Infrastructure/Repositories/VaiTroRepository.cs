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
    public class VaiTroRepository : GenericRepository<VaiTro>, IVaiTroRepository
    {
        public VaiTroRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<VaiTro?> GetByTenVaiTroAsync(string tenVaiTro)
        {
            return await _dbSet
                .FirstOrDefaultAsync(v => v.TenVaiTro == tenVaiTro);
        }

        public async Task<VaiTro?> GetVaiTroWithNguoiDungsAsync(int vaiTroId)
        {
            return await _dbSet
                .Include(v => v.NguoiDungs)
                .FirstOrDefaultAsync(v => v.VaiTroId == vaiTroId);
        }
    }
}
