using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.DataAccess;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class MaGiamGiaRepository : GenericRepository<MaGiamGia>, IMaGiamGiaRepository
    {
        public MaGiamGiaRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<MaGiamGia?> GetByCodeAsync(string code)
        {
            return await _dbSet
                .FirstOrDefaultAsync(m => m.Code == code);
        }
    }
}
